import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
export class AIService {
    constructor() {
        this.models = new Map();
        this.initializeModels();
    }
    initializeModels() {
        this.models.clear();
        const arkKey = process.env.ARK_API_KEY;
        this.models.set('doubao-seed-1-6-thinking-250615', {
            id: 'doubao-seed-1-6-thinking-250615',
            name: '豆包 (火山方舟 1.6 Thinking)',
            provider: '火山方舟',
            endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            apiKey: arkKey,
            available: !!arkKey && arkKey.length > 10,
            maxTokens: 16000,
            temperature: 0.7,
            description: '字节跳动豆包大模型 1.6 Thinking，支持中文对话和多模态'
        });
        console.log('【AIService模型注册表】', Array.from(this.models.entries()));
        console.log('【AIService初始化API Key】', arkKey);
    }
    getAvailableModels() {
        return Array.from(this.models.values()).filter(model => model.available);
    }
    getModelConfig(modelId) {
        return this.models.get(modelId);
    }
    async callVolcanicArk(messages, config) {
        try {
            console.log('🔥 Ark API 请求参数:', {
                url: config.endpoint,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                data: {
                    model: 'doubao-seed-1-6-thinking-250615',
                    messages: messages,
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    stream: false
                }
            });
            const response = await axios.post(config.endpoint, {
                model: 'doubao-seed-1-6-thinking-250615',
                messages: messages,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                timeout: 60000
            });
            const data = response.data;
            return {
                content: data.choices[0].message.content,
                usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                } : undefined,
                model: config.id,
                finishReason: data.choices[0].finish_reason
            };
        }
        catch (error) {
            console.error('火山方舟API调用失败:', error.response?.data || error.message);
            throw new Error(`火山方舟API调用失败: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async callDeepSeek(messages, config) {
        try {
            const response = await axios.post(config.endpoint, {
                model: config.id,
                messages: messages,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                timeout: 60000
            });
            const data = response.data;
            return {
                content: data.choices[0].message.content,
                usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                } : undefined,
                reasoningContent: data.choices[0].reasoning_content,
                model: config.id
            };
        }
        catch (error) {
            throw new Error('DeepSeek API调用失败: ' + (error.message || error.toString()));
        }
    }
    async chat(messages, modelId = 'doubao-seed-1-6-thinking-250615', options) {
        console.log('【AIService.chat调用】', { modelId, models: Array.from(this.models.keys()), options });
        const model = this.getModelConfig(modelId);
        if (!model) {
            throw new Error(`模型 ${modelId} 不存在`);
        }
        if (options?.apiKey) {
            const updatedModel = { ...model, apiKey: options.apiKey, available: true };
            this.models.set(modelId, updatedModel);
            console.log(`🔑 动态更新模型 ${modelId} 的API密钥`);
        }
        if (!model.available && !options?.apiKey) {
            throw new Error(`模型 ${modelId} 不可用，请检查API密钥配置`);
        }
        const effectiveConfig = {
            ...model,
            temperature: options?.temperature ?? model.temperature,
            maxTokens: options?.maxTokens ?? model.maxTokens
        };
        switch (model.provider) {
            case '火山方舟':
                try {
                    return await this.callVolcanicArk(messages, effectiveConfig);
                }
                catch (error) {
                    throw new Error('火山方舟API调用失败');
                }
            case 'DeepSeek':
                try {
                    return await this.callDeepSeek(messages, effectiveConfig);
                }
                catch (error) {
                    throw new Error('DeepSeek API调用失败');
                }
            default:
                throw new Error(`不支持的AI提供商: ${model.provider}`);
        }
    }
    async testModelConnection(modelId) {
        try {
            const model = this.getModelConfig(modelId);
            if (!model) {
                return {
                    success: false,
                    message: `模型 ${modelId} 不存在`
                };
            }
            if (!model.available) {
                return {
                    success: false,
                    message: `模型 ${modelId} 不可用，请检查API密钥配置`
                };
            }
            const testMessages = [
                {
                    role: 'user',
                    content: '你好，请简单回复一下确认连接正常。'
                }
            ];
            try {
                const response = await this.chat(testMessages, modelId, { maxTokens: 50 });
                return {
                    success: true,
                    message: `模型 ${modelId} 连接成功，响应: ${response.content.substring(0, 50)}...`
                };
            }
            catch (error) {
                throw new Error('模型连接失败');
            }
        }
        catch (error) {
            return {
                success: false,
                message: `模型测试出错: ${error.message}`
            };
        }
    }
    async testAllModels() {
        const results = {};
        for (const [modelId] of this.models) {
            results[modelId] = await this.testModelConnection(modelId);
        }
        return results;
    }
}
export const aiService = new AIService();
//# sourceMappingURL=ai.service.js.map