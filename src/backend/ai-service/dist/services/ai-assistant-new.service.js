"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantService = void 0;
const logger_1 = require("@/utils/logger");
const ai_models_service_1 = require("./ai-models.service");
class AIAssistantService {
    constructor() {
        this.aiModels = new ai_models_service_1.AIModelsService();
        const hasArkKey = !!process.env["ARK_API_KEY"];
        const hasDeepSeekKey = !!process.env["DEEPSEEK_API_KEY"];
        if (!hasArkKey && !hasDeepSeekKey) {
            logger_1.logger.warn('No valid API key found. Using mock mode.');
        }
        else if (hasArkKey) {
            logger_1.logger.info('Using Ark API (火山方舟) for AI services');
        }
        else {
            logger_1.logger.info('Using DeepSeek API for AI services');
        }
    }
    async processChat(request) {
        const startTime = Date.now();
        try {
            logger_1.logger.info(`Processing chat request for user: ${request.context.userId}`);
            const systemPrompt = this.buildSystemPrompt(request.context);
            const conversationHistory = await this.getConversationHistory(request.context.userId);
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-10),
                { role: 'user', content: request.message }
            ];
            let response;
            let reasoning;
            if (!process.env["ARK_API_KEY"] && !process.env["DEEPSEEK_API_KEY"]) {
                logger_1.logger.info('Using mock mode for AI API');
                response = this.generateMockResponse(request.message, request.context);
            }
            else {
                const preferredModel = this.selectModel(request.message, request.context);
                try {
                    const aiResponse = await this.aiModels.callAI(messages, {
                        preferredModel,
                        temperature: 0.7,
                        max_tokens: 16000
                    });
                    response = aiResponse.content;
                    reasoning = aiResponse.reasoning_content;
                }
                catch (error) {
                    logger_1.logger.error('AI API call failed, fallback to mock mode:', error);
                    response = this.generateMockResponse(request.message, request.context);
                }
            }
            await this.saveConversation(request.context.userId, request.message, response);
            const suggestions = request.options?.includeSuggestions
                ? await this.generateSuggestions(request, response)
                : [];
            const actions = request.options?.includeActions
                ? await this.generateActions(request, response)
                : [];
            const duration = Date.now() - startTime;
            logger_1.logger.info(`Chat request processed in ${duration}ms`);
            return {
                id: this.generateMessageId(),
                message: response,
                reasoning: reasoning || '',
                suggestions,
                actions,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error processing chat request:', error);
            throw error;
        }
    }
    selectModel(message, _context) {
        if (this.isReasoningTask(message)) {
            return 'deepseek-reasoner';
        }
        if (this.isProgrammingTask(message)) {
            return 'deepseek-chat';
        }
        return 'volcanic-ark';
    }
    isReasoningTask(message) {
        const reasoningKeywords = [
            '计算', '分析', '推理', '逻辑', '比较', '哪个更大', '哪个更小',
            '数学', '物理计算', '化学方程式', '解题', '证明'
        ];
        return reasoningKeywords.some(keyword => message.includes(keyword));
    }
    isProgrammingTask(message) {
        const programmingKeywords = [
            '代码', '编程', '程序', 'Python', 'JavaScript', 'Java', 'C++',
            '算法', '数据结构', '函数', '类', '变量', 'bug', '调试'
        ];
        return programmingKeywords.some(keyword => message.includes(keyword));
    }
    buildSystemPrompt(context) {
        let basePrompt = `你是多学科实验教学系统的AI助手，专门帮助学生和教师进行多学科实验教学。

你的主要职责包括：
1. 回答关于各学科实验的问题，包括物理、化学、生物、计算机科学、机器人等
2. 提供实验参数建议和实验设计指导
3. 解释实验原理和结果
4. 帮助诊断实验问题
5. 针对不同年龄段和教育水平提供合适的实验建议
6. 推荐相关学习资源
7. 将AI技术作为辅助工具，融入各学科实验教学

用户信息：
- 角色: ${context.role}
- 用户ID: ${context.userId}
- 当前页面: ${context.currentPage || '未知'}
${context.experimentId ? `- 当前实验ID: ${context.experimentId}` : ''}

设备状态: ${this.formatDeviceStatus(context.deviceStatus)}

请用友好、专业的语气回答，并根据用户的角色和水平调整回答的详细程度。`;
        if (context.userProfile) {
            basePrompt += `\n\n用户档案：
- 水平: ${context.userProfile.level}
- 主要学科: ${context.userProfile.subjects.join(', ')}`;
        }
        return basePrompt;
    }
    formatDeviceStatus(deviceStatus) {
        if (!deviceStatus) {
            return '无设备连接';
        }
        const devices = Object.entries(deviceStatus).map(([name, status]) => {
            return `${name}: ${status}`;
        }).join(', ');
        return devices || '设备状态未知';
    }
    async getConversationHistory(userId) {
        try {
            const history = [];
            return history.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting conversation history:', error);
            return [];
        }
    }
    async saveConversation(_userId, _userMessage, _assistantResponse) {
        try {
        }
        catch (error) {
            logger_1.logger.error('Error saving conversation:', error);
        }
    }
    async generateSuggestions(request, _response) {
        const suggestions = [];
        if (request.context.role === 'student') {
            suggestions.push({ id: '1', text: '创建一个新的实验', category: 'experiment' }, { id: '2', text: '查看实验步骤指导', category: 'knowledge' }, { id: '3', text: '分析实验结果', category: 'analysis' });
        }
        else if (request.context.role === 'teacher') {
            suggestions.push({ id: '1', text: '设计课程实验', category: 'experiment' }, { id: '2', text: '查看学生实验报告', category: 'analysis' }, { id: '3', text: '配置实验参数', category: 'parameter' });
        }
        if (request.context.currentPage?.includes('experiment')) {
            suggestions.push({ id: '4', text: '优化实验参数', category: 'parameter' }, { id: '5', text: '解释实验原理', category: 'knowledge' });
        }
        return suggestions.slice(0, 5);
    }
    async generateActions(request, response) {
        const actions = [];
        try {
            const intent = this.extractIntent(request.message);
            switch (intent) {
                case 'parameter_adjustment':
                    actions.push({
                        type: 'update_parameter',
                        title: '更新实验参数',
                        description: '根据建议调整实验参数',
                        data: { parameters: this.extractParameterSuggestions(response) },
                        confirmRequired: true,
                    });
                    break;
                case 'save_result':
                    actions.push({
                        type: 'save_result',
                        title: '保存实验结果',
                        description: '将当前实验结果保存到实验记录',
                        data: { experimentId: request.context.experimentId },
                        confirmRequired: false,
                    });
                    break;
                case 'apply_parameters':
                    actions.push({
                        type: 'apply_parameters',
                        title: '应用推荐参数',
                        description: '应用AI推荐的实验参数',
                        data: { parameters: this.extractParameterSuggestions(response) },
                        confirmRequired: true,
                    });
                    break;
            }
        }
        catch (error) {
            logger_1.logger.error('Error generating actions:', error);
        }
        return actions;
    }
    extractIntent(message) {
        if (message.includes('参数') || message.includes('调整')) {
            return 'parameter_adjustment';
        }
        if (message.includes('保存') || message.includes('记录')) {
            return 'save_result';
        }
        if (message.includes('应用') || message.includes('使用')) {
            return 'apply_parameters';
        }
        return 'general';
    }
    extractParameterSuggestions(_response) {
        return {
            temperature: 25,
            duration: 30,
            concentration: 0.1
        };
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateMockResponse(message, _context) {
        const commonResponses = [
            `您询问了"${message}"。这是一个很好的问题！`,
            `关于您的问题"${message}"，我建议您可以尝试以下方法...`,
            `针对"${message}"这个问题，我可以为您提供以下指导...`,
            `AI助手测试模式已激活。\n\n您的输入: "${message}"\n\n在生产环境中，您将看到由真实AI模型生成的专业回答。`
        ];
        const index = Math.floor(Math.random() * commonResponses.length);
        return commonResponses[index] || "AI助手正在开发模式下运行。";
    }
    async testModelConnection(modelName, _config, _specificParams) {
        try {
            const model = modelName.includes('deepseek') ?
                (modelName.includes('reasoner') ? 'deepseek-reasoner' : 'deepseek-chat') :
                'volcanic-ark';
            const result = await this.aiModels.testConnection(model);
            return {
                success: result.success,
                message: result.message,
                modelInfo: {
                    latency: result.latency,
                    provider: model.includes('deepseek') ? 'DeepSeek' : '火山方舟'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: `连接测试失败: ${error.message}`
            };
        }
    }
}
exports.AIAssistantService = AIAssistantService;
//# sourceMappingURL=ai-assistant-new.service.js.map