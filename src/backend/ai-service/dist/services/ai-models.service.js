"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModelsService = void 0;
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class AIModelsService {
    constructor() {
        this.arkClient = axios_1.default.create({
            baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env['ARK_API_KEY']}`
            },
            timeout: 30000
        });
        this.deepseekClient = new openai_1.default({
            apiKey: process.env['DEEPSEEK_API_KEY'],
            baseURL: "https://api.deepseek.com"
        });
    }
    async callVolcanicArk(messages, options) {
        try {
            const requestData = {
                model: options?.model || "doubao-seed-1-6-thinking-250615",
                messages: messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.max_tokens || 16000,
                stream: options?.stream || false
            };
            logger_1.logger.info('Calling Volcanic Ark API', { model: requestData.model });
            const response = await this.arkClient.post('/chat/completions', requestData);
            if (response.data.choices && response.data.choices.length > 0) {
                return {
                    content: response.data.choices[0].message.content,
                    usage: response.data.usage
                };
            }
            throw new Error('Invalid response from Volcanic Ark API');
        }
        catch (error) {
            logger_1.logger.error('Volcanic Ark API error:', error.response?.data || error.message);
            throw new Error(`火山方舟API调用失败: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async callDeepSeekReasoner(messages, options) {
        try {
            logger_1.logger.info('Calling DeepSeek Reasoner API');
            const response = await this.deepseekClient.chat.completions.create({
                model: "deepseek-reasoner",
                messages: messages,
                stream: options?.stream || false,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.max_tokens || 4096
            });
            if (options?.stream && options?.onChunk) {
                let reasoning_content = "";
                let content = "";
                for await (const chunk of response) {
                    if (chunk.choices?.[0]?.delta?.reasoning_content) {
                        reasoning_content += chunk.choices[0].delta.reasoning_content;
                        options.onChunk(content, reasoning_content);
                    }
                    else if (chunk.choices?.[0]?.delta?.content) {
                        content += chunk.choices[0].delta.content;
                        options.onChunk(content, reasoning_content);
                    }
                }
                return {
                    content,
                    reasoning_content
                };
            }
            else {
                const result = response;
                return {
                    content: result.choices[0].message.content,
                    reasoning_content: result.choices[0].message.reasoning_content,
                    usage: result.usage
                };
            }
        }
        catch (error) {
            logger_1.logger.error('DeepSeek API error:', error);
            throw new Error(`DeepSeek API调用失败: ${error.message}`);
        }
    }
    async callDeepSeekChat(messages, options) {
        try {
            logger_1.logger.info('Calling DeepSeek Chat API');
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
        }
        catch (error) {
            logger_1.logger.error('DeepSeek Chat API error:', error);
            throw new Error(`DeepSeek Chat API调用失败: ${error.message}`);
        }
    }
    async callAI(messages, options) {
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
    async testConnection(model) {
        const startTime = Date.now();
        try {
            const testMessages = [
                { role: 'user', content: '你好，请简单回复确认连接正常。' }
            ];
            await this.callAI(testMessages, { preferredModel: model });
            const latency = Date.now() - startTime;
            return {
                success: true,
                message: `${model} 连接测试成功`,
                latency
            };
        }
        catch (error) {
            return {
                success: false,
                message: `${model} 连接测试失败: ${error.message}`
            };
        }
    }
    getAvailableModels() {
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
exports.AIModelsService = AIModelsService;
//# sourceMappingURL=ai-models.service.js.map