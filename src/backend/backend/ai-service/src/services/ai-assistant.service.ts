import OpenAI from 'openai';
import { ChatRequest, ChatResponse, AssistantContext, Suggestion, AssistantAction } from '@/types';
import { logger } from '@/utils/logger';
import { DatabaseManager } from '@/config/database';
import axios from 'axios';

export class AIAssistantService {
  private openai: OpenAI;
  private dbManager: DatabaseManager;
  private arkApiKey: string;
  private arkBaseUrl: string;
  private arkModel: string;
  private deepseekApiKey: string;

  constructor() {
    this.arkApiKey = process.env["ARK_API_KEY"] || '';
    this.arkBaseUrl = process.env["ARK_BASE_URL"] || 'https://ark.cn-beijing.volces.com/api/v3';
    this.arkModel = process.env["ARK_MODEL"] || 'doubao-seed-1-6-thinking-250615';
    this.deepseekApiKey = process.env["DEEPSEEK_API_KEY"] || '';
    const apiKey = process.env["OPENAI_API_KEY"] || 'mock-key-for-development';
    this.openai = new OpenAI({ apiKey });
    this.dbManager = DatabaseManager.getInstance();
  }

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    try {
      logger.info(`Processing chat request for user: ${request.context.userId}`);
      const systemPrompt = this.buildSystemPrompt(request.context);
      const conversationHistory = await this.getConversationHistory(request.context.userId);
      let response: string;
      // Ark优先
      if (this.arkApiKey && this.arkApiKey !== 'mock-key-for-development') {
        response = await this.callArkAPI(request.message, systemPrompt, conversationHistory);
      } else if (this.deepseekApiKey) {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: request.message }
        ];
        response = await this.callDeepSeekAPI(messages, 'deepseek-chat');
      } else if (process.env["OPENAI_API_KEY"] && process.env["OPENAI_API_KEY"] !== 'mock-key-for-development') {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: request.message }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });
        response = completion.choices[0]?.message?.content || '抱歉，我无法生成回复。';
      } else {
        response = this.generateMockResponse(request.message, request.context);
      }
      const suggestions = await this.generateSuggestions(request, response);
      const actions = await this.generateActions(request, response);
      await this.saveConversation(request.context.userId, request.message, response);
      const responseTime = Date.now() - startTime;
      logger.info(`Chat response generated in ${responseTime}ms`);
      return {
        response,
        messageId: this.generateMessageId(),
        suggestions,
        actions,
        context: {
          conversationId: request.context.sessionId,
          turnCount: conversationHistory.length / 2 + 1,
          userIntent: this.extractIntent(request.message),
        },
      };
    } catch (error) {
      logger.error('Error processing chat request:', error);
      throw new Error('AI助手服务暂时不可用，请稍后重试');
    }
  }

  private buildSystemPrompt(context: AssistantContext): string {
    let basePrompt = `你是多学科实验教学系统的AI助手，专门帮助学生和教师进行多学科实验教学。\n\n你的主要职责包括：\n1. 回答关于各学科实验的问题，包括物理、化学、生物、计算机科学、机器人等\n2. 提供实验参数建议和实验设计指导\n3. 解释实验原理和结果\n4. 帮助诊断实验问题\n5. 针对不同年龄段和教育水平提供合适的实验建议\n6. 推荐相关学习资源\n7. 将AI技术作为辅助工具，融入各学科实验教学\n\n用户信息：\n- 角色: ${context.role}\n- 用户ID: ${context.userId}\n- 当前页面: ${context.currentPage || '未知'}${context.experimentId ? `- 当前实验ID: ${context.experimentId}` : ''}\n设备状态: ${this.formatDeviceStatus(context.deviceStatus)}\n\n请用友好、专业的语气回答，并根据用户的角色和水平调整回答的详细程度。`;
    if (context.userProfile) {
      basePrompt += `\n\n用户档案：\n- 水平: ${context.userProfile.level}\n- 偏好学科: ${context.userProfile.preferences?.subjectAreas?.join(', ') || '未知'}\n- 教育阶段: ${context.userProfile.educationLevel || '未知'}\n- 学习历史: ${context.userProfile.learningHistory?.join(', ') || '未知'}`;
    }
    return basePrompt;
  }

  private formatDeviceStatus(deviceStatus?: any): string {
    if (!deviceStatus) return '设备状态未知';
    const statusList = [];
    if (deviceStatus.camera) statusList.push(`摄像头: ${deviceStatus.camera}`);
    if (deviceStatus.sensor) statusList.push(`传感器: ${deviceStatus.sensor}`);
    if (deviceStatus.robot) statusList.push(`机器人: ${deviceStatus.robot}`);
    return statusList.join(', ') || '设备状态未知';
  }

  private async getConversationHistory(userId: string): Promise<any[]> {
    try {
      const redis = this.dbManager.getRedisClient();
      const historyKey = `conversation:${userId}`;
      const history = await redis.lRange(historyKey, 0, 9);
      return history.map((msg: any) => JSON.parse(msg));
    } catch (error) {
      logger.error('Error getting conversation history:', error);
      return [];
    }
  }

  private async saveConversation(userId: string, userMessage: string, assistantResponse: string): Promise<void> {
    try {
      const redis = this.dbManager.getRedisClient();
      const historyKey = `conversation:${userId}`;
      const userMsg = { role: 'user', content: userMessage };
      const assistantMsg = { role: 'assistant', content: assistantResponse };
      await redis.lPush(historyKey, JSON.stringify(userMsg));
      await redis.lPush(historyKey, JSON.stringify(assistantMsg));
      await redis.lTrim(historyKey, 0, 19);
      await redis.expire(historyKey, 86400);
    } catch (error) {
      logger.error('Error saving conversation:', error);
    }
  }

  private async generateSuggestions(request: ChatRequest, response: string): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    try {
      if (request.context.role === 'student') {
        const subjectArea = this.extractSubjectArea(request.message, request.context);
        if (subjectArea) {
          switch (subjectArea) {
            case 'physics':
              suggestions.push({ type: 'experiment', title: '物理实验建议', content: '查看相关物理实验教程', priority: 'medium', action: { type: 'navigate', title: '浏览物理实验', data: { page: 'experiments', filter: 'physics' } } });
              break;
            case 'chemistry':
              suggestions.push({ type: 'experiment', title: '化学实验建议', content: '查看相关化学实验教程', priority: 'medium', action: { type: 'navigate', title: '浏览化学实验', data: { page: 'experiments', filter: 'chemistry' } } });
              break;
            case 'biology':
              suggestions.push({ type: 'experiment', title: '生物实验建议', content: '查看相关生物实验教程', priority: 'medium', action: { type: 'navigate', title: '浏览生物实验', data: { page: 'experiments', filter: 'biology' } } });
              break;
            case 'computer_science':
              suggestions.push({ type: 'experiment', title: '计算机科学实验建议', content: '查看相关计算机科学实验教程', priority: 'medium', action: { type: 'navigate', title: '浏览计算机科学实验', data: { page: 'experiments', filter: 'computer_science' } } });
              break;
            case 'robotics':
              suggestions.push({ type: 'experiment', title: '机器人实验建议', content: '查看相关机器人实验教程', priority: 'medium', action: { type: 'navigate', title: '浏览机器人实验', data: { page: 'experiments', filter: 'robotics' } } });
              break;
          }
        }
        const educationLevel = this.getEducationLevelFromContext(request.context);
        if (educationLevel) {
          suggestions.push({ type: 'knowledge', title: `${this.formatEducationLevel(educationLevel)}学习资源`, content: `浏览适合${this.formatEducationLevel(educationLevel)}的学习资料`, priority: 'low', action: { type: 'navigate', title: '查看学习资源', data: { page: 'resources', filter: educationLevel } } });
        }
      }
      if (request.message.includes('参数') || request.message.includes('调整')) {
        suggestions.push({ type: 'parameter', title: '参数优化建议', content: '基于当前实验结果，我建议调整以下参数', priority: 'high', action: { type: 'parameter_adjustment', title: '应用建议参数', data: { parameters: this.extractParameterSuggestions(response) } } });
      }
      if (request.message.includes('分析') || request.message.includes('结果') || request.message.includes('数据')) {
        suggestions.push({ type: 'analysis', title: '实验数据分析', content: '对当前实验数据进行深入分析', priority: 'high', action: { type: 'analyze_data', title: '分析数据', data: { experimentId: request.context.experimentId } } });
      }
    } catch (error) {
      logger.error('Error generating suggestions:', error);
    }
    return suggestions;
  }

  private getEducationLevelFromContext(context: AssistantContext): string | undefined {
    return context.userProfile?.educationLevel;
  }

  private formatEducationLevel(level: string): string {
    const levelMap: Record<string, string> = {
      'primary_school': '小学',
      'middle_school': '初中',
      'high_school': '高中',
      'undergraduate': '大学本科',
      'graduate': '研究生'
    };
    return levelMap[level] || '通用';
  }

  private extractSubjectArea(message: string, context: AssistantContext): string | undefined {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('物理')) return 'physics';
    if (lowerMessage.includes('化学')) return 'chemistry';
    if (lowerMessage.includes('生物')) return 'biology';
    if (lowerMessage.includes('计算机') || lowerMessage.includes('编程')) return 'computer_science';
    if (lowerMessage.includes('机器人')) return 'robotics';
    if (context.userProfile?.preferences?.subjectAreas?.length) {
      return context.userProfile.preferences.subjectAreas[0];
    }
    if (context.currentPage) {
      if (context.currentPage.includes('physics')) return 'physics';
      if (context.currentPage.includes('chemistry')) return 'chemistry';
      if (context.currentPage.includes('biology')) return 'biology';
      if (context.currentPage.includes('computer')) return 'computer_science';
      if (context.currentPage.includes('robot')) return 'robotics';
    }
    return undefined;
  }

  private async generateActions(request: ChatRequest, response: string): Promise<AssistantAction[]> {
    const actions: AssistantAction[] = [];
    try {
      const intent = this.extractIntent(request.message);
      switch (intent) {
        case 'parameter_adjustment':
          actions.push({ type: 'update_parameter', title: '更新实验参数', description: '根据建议调整实验参数', data: { parameters: this.extractParameterSuggestions(response) }, confirmRequired: true });
          break;
        case 'save_result':
          actions.push({ type: 'save_result', title: '保存实验结果', description: '将当前实验结果保存到实验记录', data: { experimentId: request.context.experimentId }, confirmRequired: false });
          break;
        case 'apply_parameters':
          actions.push({ type: 'apply_parameters', title: '应用推荐参数', description: '应用AI推荐的实验参数', data: { parameters: this.extractParameterSuggestions(response) }, confirmRequired: true });
          break;
      }
    } catch (error) {
      logger.error('Error generating actions:', error);
    }
    return actions;
  }

  private extractIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('参数') || lowerMessage.includes('调整') || lowerMessage.includes('优化')) return 'parameter_adjustment';
    if (lowerMessage.includes('保存') || lowerMessage.includes('记录')) return 'save_result';
    if (lowerMessage.includes('应用') || lowerMessage.includes('使用')) return 'apply_parameters';
    return 'general_question';
  }

  private extractParameterSuggestions(_response: string): Record<string, any> {
    return {};
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async processVoiceChat(_audioData: string, _context: AssistantContext): Promise<any> {
    try {
      return { transcription: '语音识别结果', intent: 'general_question', response: { text: '我听到了您的问题，让我为您解答...' } };
    } catch (error) {
      logger.error('Error processing voice chat:', error);
      throw new Error('语音处理服务暂时不可用');
    }
  }

  private generateMockResponse(message: string, _context: AssistantContext): string {
    return `这是AI助手的模拟响应。您的问题是: "${message}"。在实际部署环境中，这里会返回真实的AI回答。`;
  }

  private async callArkAPI(message: string, systemPrompt: string, conversationHistory: any[]): Promise<string> {
    try {
      const response = await axios.post(
        `${this.arkBaseUrl}/chat/completions`,
        {
          model: this.arkModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.arkApiKey}`
          },
          timeout: 30000
        }
      );
      return response.data.choices[0]?.message?.content || '抱歉，我无法生成回复。';
    } catch (error: any) {
      logger.error('Ark API call failed:', error.message);
      throw new Error(`火山方舟API调用失败: ${error.message}`);
    }
  }

  private async callDeepSeekAPI(messages: any[], model: string = "deepseek-chat"): Promise<string> {
    try {
      const response = await axios.post(
        "https://api.deepseek.com/chat/completions",
        { model, messages, stream: false },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.deepseekApiKey}`
          },
          timeout: 30000
        }
      );
      return response.data.choices?.[0]?.message?.content || "抱歉，DeepSeek 没有返回内容。";
    } catch (error: any) {
      logger.error('DeepSeek API call failed:', error.message);
      throw new Error(`DeepSeek API 调用失败: ${error.message}`);
    }
  }

  async testModelConnection(modelName: string, config: any, specificParams?: any): Promise<{ success: boolean; message: string; modelInfo?: any }> {
    try {
      let apiKey = config.apiKey;
      if (modelName === 'deepseek-chat' || modelName === 'deepseek-reasoner') {
        apiKey = this.deepseekApiKey;
      }
      if (!apiKey) {
        return { success: false, message: 'API密钥未提供' };
      }
      let modelInfo: any = {};
      if (modelName === 'doubao-seed-1-6-thinking-250615') {
        const endpoint = specificParams?.endpoint || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
        modelInfo = { contextWindow: 256000, outputTokenLimit: 16000, inputTokenLimit: 224000, features: ['多模态', '长文本', '思考能力'] };
        const response = await axios.post(
          endpoint,
          {
            model: specificParams?.model_id || 'doubao-seed-1-6-thinking-250615',
            messages: [
              { role: 'system', content: '这是一个测试请求' },
              { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            max_tokens: 10
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
          }
        );
        if (!response.data || !response.data.choices) {
          return { success: false, message: 'Ark无返回内容' };
        }
        return { success: true, message: '连接测试成功', modelInfo };
      } else if (modelName === 'deepseek-chat' || modelName === 'deepseek-reasoner') {
        const endpoint = specificParams?.endpoint || 'https://api.deepseek.com/chat/completions';
        modelInfo = { contextWindow: 32000, outputTokenLimit: 30000, inputTokenLimit: 32000, features: ['推理能力', '数学分析', '逻辑思维'] };
        const response = await axios.post(
          endpoint,
          {
            model: modelName,
            messages: [
              { role: 'system', content: '这是一个测试请求' },
              { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            stream: false,
            max_tokens: 10
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
          }
        );
        if (!response.data || !response.data.choices) {
          return { success: false, message: 'DeepSeek无返回内容' };
        }
        return { success: true, message: '连接测试成功', modelInfo };
      } else {
        const endpoint = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
        modelInfo = { contextWindow: 4096, outputTokenLimit: 4096, inputTokenLimit: 4096 };
        const response = await axios.post(
          endpoint,
          {
            model: modelName,
            messages: [
              { role: 'system', content: '这是一个测试请求' },
              { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            max_tokens: 10
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: 30000
          }
        );
        if (!response.data || !response.data.choices) {
          return { success: false, message: 'OpenAI无返回内容' };
        }
        return { success: true, message: '连接测试成功', modelInfo };
      }
    } catch (error: any) {
      logger.error('模型连接测试错误:', error);
      return { success: false, message: `连接错误: ${error.message}` };
    }
  }
}