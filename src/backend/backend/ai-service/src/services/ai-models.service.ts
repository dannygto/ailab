/**
 * AI模型调用服务
 * 支持火山方舟豆包和DeepSeek等多个AI提供商
 */

import OpenAI from 'openai';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  reasoning_content?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | undefined;
}

export class AIModelsService {
  private arkClient: any;
  private deepseekClient: OpenAI;

  constructor() {
    // 初始化火山方舟客户端
    this.arkClient = axios.create({
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['ARK_API_KEY']}`
      },
      timeout: 30000
    });

    // 初始化DeepSeek客户端
    this.deepseekClient = new OpenAI({
      apiKey: process.env['DEEPSEEK_API_KEY'],
      baseURL: "https://api.deepseek.com"
    });
  }

  /**
   * 调用火山方舟豆包模型
   */
  async callVolcanicArk(messages: AIMessage[], options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }): Promise<AIResponse> {
    try {
      const requestData = {
        model: options?.model || "doubao-seed-1-6-thinking-250615",
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 16000,
        stream: options?.stream || false
      };

      logger.info('Calling Volcanic Ark API', { model: requestData.model });

      const response = await this.arkClient.post('/chat/completions', requestData);
      
      if (response.data.choices && response.data.choices.length > 0) {
        return {
          content: response.data.choices[0].message.content,
          usage: response.data.usage
        };
      }

      throw new Error('Invalid response from Volcanic Ark API');
    } catch (error: any) {
      logger.error('Volcanic Ark API error:', error.response?.data || error.message);
      throw new Error(`火山方舟API调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 调用DeepSeek推理模型（支持流式）
   */
  async callDeepSeekReasoner(messages: AIMessage[], options?: {
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    onChunk?: (content: string, reasoning?: string) => void;
  }): Promise<AIResponse> {
    try {
      logger.info('Calling DeepSeek Reasoner API');

      const response = await this.deepseekClient.chat.completions.create({
        model: "deepseek-reasoner",
        messages: messages,
        stream: options?.stream || false,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4096
      });

      if (options?.stream && options?.onChunk) {
        // 流式处理
        let reasoning_content = "";
        let content = "";

        for await (const chunk of response as any) {
          if (chunk.choices?.[0]?.delta?.reasoning_content) {
            reasoning_content += chunk.choices[0].delta.reasoning_content;
            options.onChunk(content, reasoning_content);
          } else if (chunk.choices?.[0]?.delta?.content) {
            content += chunk.choices[0].delta.content;
            options.onChunk(content, reasoning_content);
          }
        }

        return {
          content,
          reasoning_content
        };
      } else {
        // 非流式处理
        const result = response as any;
        return {
          content: result.choices[0].message.content,
          reasoning_content: result.choices[0].message.reasoning_content,
          usage: result.usage
        };
      }
    } catch (error: any) {
      logger.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API调用失败: ${error.message}`);
    }
  }

  /**
   * 调用DeepSeek Chat模型
   */
  async callDeepSeekChat(messages: AIMessage[], options?: {
    temperature?: number;
    max_tokens?: number;
  }): Promise<AIResponse> {
    try {
      logger.info('Calling DeepSeek Chat API');

      const response = await this.deepseekClient.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4096,
        stream: false
      });

      return {
        content: response.choices?.[0]?.message?.content || '',
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error: any) {
      logger.error('DeepSeek Chat API error:', error);
      throw new Error(`DeepSeek Chat API调用失败: ${error.message}`);
    }
  }

  /**
   * 智能选择模型并调用
   */
  async callAI(messages: AIMessage[], options?: {
    preferredModel?: 'volcanic-ark' | 'deepseek-reasoner' | 'deepseek-chat';
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    onChunk?: (content: string, reasoning?: string) => void;
  }): Promise<AIResponse> {
    const model = options?.preferredModel || 'volcanic-ark';

    switch (model) {
      case 'volcanic-ark':
        return this.callVolcanicArk(messages, options);
      
      case 'deepseek-reasoner':
        return this.callDeepSeekReasoner(messages, options);
      
      case 'deepseek-chat':
        return this.callDeepSeekChat(messages, options);
      
      default:
        throw new Error(`不支持的模型: ${model}`);
    }
  }

  /**
   * 测试模型连接
   */
  async testConnection(model: 'volcanic-ark' | 'deepseek-reasoner' | 'deepseek-chat'): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const testMessages: AIMessage[] = [
        { role: 'user', content: '你好，请简单回复确认连接正常。' }
      ];

      await this.callAI(testMessages, { preferredModel: model });
      
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        message: `${model} 连接测试成功`,
        latency
      };
    } catch (error: any) {
      return {
        success: false,
        message: `${model} 连接测试失败: ${error.message}`
      };
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): Array<{
    id: string;
    name: string;
    provider: string;
    description: string;
  }> {
    return [
      {
        id: 'volcanic-ark',
        name: '豆包思考模型',
        provider: '火山方舟',
        description: '支持多模态对话和长文本处理'
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek推理模型',
        provider: 'DeepSeek',
        description: '具备强大推理能力的大模型'
      },
      {
        id: 'deepseek-chat',
        name: 'DeepSeek对话模型',
        provider: 'DeepSeek',
        description: '专注编程和推理的对话模型'
      }
    ];
  }
}
