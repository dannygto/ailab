"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantService = void 0;
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const axios_1 = __importDefault(require("axios"));
class AIAssistantService {
    constructor() {
        this.suggestions = await this.generateSuggestions(request, response);
        this.actions = await this.generateActions(request, response);
        this.arkApiKey = process.env["ARK_API_KEY"] || '';
        this.arkBaseUrl = process.env["ARK_BASE_URL"] || 'https://ark.cn-beijing.volces.com/api/v3';
        this.arkModel = process.env["ARK_MODEL"] || 'doubao-seed-1-6-thinking-250615';
        const apiKey = process.env["OPENAI_API_KEY"] || 'mock-key-for-development';
        const mockMode = !this.arkApiKey && (!process.env["OPENAI_API_KEY"] || process.env["OPENAI_API_KEY"] === 'mock-key-for-development');
        if (mockMode) {
            logger_1.logger.warn('No valid API key found. Using mock mode.');
        }
        else if (this.arkApiKey) {
            logger_1.logger.info('Using Ark API (火山方舟) for AI services');
        }
        else {
            logger_1.logger.info('Using OpenAI API for AI services');
        }
        this.openai = new openai_1.default({
            apiKey: apiKey,
        });
        this.dbManager = database_1.DatabaseManager.getInstance();
    }
    async processChat(request) {
        const startTime = Date.now();
        try {
            logger_1.logger.info(`Processing chat request for user: ${request.context.userId}`);
            const systemPrompt = this.buildSystemPrompt(request.context);
            const conversationHistory = await this.getConversationHistory(request.context.userId);
            let response;
            if (this.arkApiKey && this.arkApiKey !== 'mock-key-for-development') {
                logger_1.logger.info('Using Ark API for chat completion');
                response = await this.callArkAPI(request.message, systemPrompt, conversationHistory);
            }
            else if (process.env["OPENAI_API_KEY"] && process.env["OPENAI_API_KEY"] !== 'mock-key-for-development') {
                logger_1.logger.info('Using OpenAI API for chat completion');
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
            }
            else {
                logger_1.logger.info('Using mock mode for chat completion');
                response = this.generateMockResponse(request.message, request.context);
            }
            {
                role: 'user', content;
                request.message;
            }
            max_tokens: 1000,
                temperature;
            0.7,
            ;
        }
        finally { }
        ;
        response = completion.choices[0]?.message?.content || '抱歉，我无法理解您的问题。';
    }
}
exports.AIAssistantService = AIAssistantService;
await this.saveConversation(request.context.userId, request.message, response);
const responseTime = Date.now() - startTime;
logger_1.logger.info(`Chat response generated in ${responseTime}ms`);
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
try { }
catch (error) {
    logger_1.logger.error('Error processing chat request:', error);
    throw new Error('AI助手服务暂时不可用，请稍后重试');
}
buildSystemPrompt(context, types_1.AssistantContext);
string;
{
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
- 偏好学科: ${context.userProfile.preferences?.subjectAreas?.join(', ') || '未知'}
- 教育阶段: ${context.userProfile.educationLevel || '未知'}
- 学习历史: ${context.userProfile.learningHistory?.join(', ') || '未知'}`;
    }
    return basePrompt;
}
formatDeviceStatus(deviceStatus ?  : any);
string;
{
    if (!deviceStatus)
        return '设备状态未知';
    const statusList = [];
    if (deviceStatus.camera)
        statusList.push(`摄像头: ${deviceStatus.camera}`);
    if (deviceStatus.sensor)
        statusList.push(`传感器: ${deviceStatus.sensor}`);
    if (deviceStatus.robot)
        statusList.push(`机器人: ${deviceStatus.robot}`);
    return statusList.join(', ') || '设备状态未知';
}
async;
getConversationHistory(userId, string);
Promise < any[] > {
    try: {
        const: redis = this.dbManager.getRedisClient(),
        const: historyKey = `conversation:${userId}`,
        const: history = await redis.lRange(historyKey, 0, 9),
        return: history.map(msg => JSON.parse(msg))
    }, catch(error) {
        logger_1.logger.error('Error getting conversation history:', error);
        return [];
    }
};
async;
saveConversation(userId, string, userMessage, string, assistantResponse, string);
Promise < void  > {
    try: {
        const: redis = this.dbManager.getRedisClient(),
        const: historyKey = `conversation:${userId}`,
        const: userMsg = { role: 'user', content: userMessage },
        const: assistantMsg = { role: 'assistant', content: assistantResponse },
        await, redis, : .lPush(historyKey, JSON.stringify(userMsg)),
        await, redis, : .lPush(historyKey, JSON.stringify(assistantMsg)),
        await, redis, : .lTrim(historyKey, 0, 19),
        await, redis, : .expire(historyKey, 86400)
    }, catch(error) {
        logger_1.logger.error('Error saving conversation:', error);
    }
};
async;
generateSuggestions(request, types_1.ChatRequest, response, string);
Promise < types_1.Suggestion[] > {
    const: suggestions, Suggestion: types_1.Suggestion, []:  = [],
    try: {
        if(request) { }, : .context.role === 'student'
    }
};
{
    const subjectArea = this.extractSubjectArea(request.message, request.context);
    if (subjectArea) {
        switch (subjectArea) {
            case 'physics':
                suggestions.push({
                    type: 'experiment',
                    title: '物理实验建议',
                    content: '查看相关物理实验教程',
                    priority: 'medium',
                    action: {
                        type: 'navigate',
                        title: '浏览物理实验',
                        data: { page: 'experiments', filter: 'physics' },
                    },
                });
                break;
            case 'chemistry':
                suggestions.push({
                    type: 'experiment',
                    title: '化学实验建议',
                    content: '查看相关化学实验教程',
                    priority: 'medium',
                    action: {
                        type: 'navigate',
                        title: '浏览化学实验',
                        data: { page: 'experiments', filter: 'chemistry' },
                    },
                });
                break;
            case 'biology':
                suggestions.push({
                    type: 'experiment',
                    title: '生物实验建议',
                    content: '查看相关生物实验教程',
                    priority: 'medium',
                    action: {
                        type: 'navigate',
                        title: '浏览生物实验',
                        data: { page: 'experiments', filter: 'biology' },
                    },
                });
                break;
            case 'computer_science':
                suggestions.push({
                    type: 'experiment',
                    title: '计算机科学实验建议',
                    content: '查看相关计算机科学实验教程',
                    priority: 'medium',
                    action: {
                        type: 'navigate',
                        title: '浏览计算机科学实验',
                        data: { page: 'experiments', filter: 'computer_science' },
                    },
                });
                break;
            case 'robotics':
                suggestions.push({
                    type: 'experiment',
                    title: '机器人实验建议',
                    content: '查看相关机器人实验教程',
                    priority: 'medium',
                    action: {
                        type: 'navigate',
                        title: '浏览机器人实验',
                        data: { page: 'experiments', filter: 'robotics' },
                    },
                });
                break;
        }
    }
    const educationLevel = this.getEducationLevelFromContext(request.context);
    if (educationLevel) {
        suggestions.push({
            type: 'knowledge',
            title: `${this.formatEducationLevel(educationLevel)}学习资源`,
            content: `浏览适合${this.formatEducationLevel(educationLevel)}的学习资料`,
            priority: 'low',
            action: {
                type: 'navigate',
                title: '查看学习资源',
                data: { page: 'resources', filter: educationLevel },
            },
        });
    }
}
if (request.message.includes('参数') || request.message.includes('调整')) {
    suggestions.push({
        type: 'parameter',
        title: '参数优化建议',
        content: '基于当前实验结果，我建议调整以下参数',
        priority: 'high',
        action: {
            type: 'parameter_adjustment',
            title: '应用建议参数',
            data: { parameters: this.extractParameterSuggestions(response) },
        },
    });
}
if (request.message.includes('分析') || request.message.includes('结果') || request.message.includes('数据')) {
    suggestions.push({
        type: 'analysis',
        title: '实验数据分析',
        content: '对当前实验数据进行深入分析',
        priority: 'high',
        action: {
            type: 'analyze_data',
            title: '分析数据',
            data: { experimentId: request.context.experimentId },
        },
    });
}
try { }
catch (error) {
    logger_1.logger.error('Error generating suggestions:', error);
}
return suggestions;
getEducationLevelFromContext(context, types_1.AssistantContext);
string | undefined;
{
    return context.userProfile?.educationLevel;
}
formatEducationLevel(level, string);
string;
{
    const levelMap = {
        'primary_school': '小学',
        'middle_school': '初中',
        'high_school': '高中',
        'undergraduate': '大学本科',
        'graduate': '研究生'
    };
    return levelMap[level] || '通用';
}
extractSubjectArea(message, string, context, types_1.AssistantContext);
string | undefined;
{
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('物理'))
        return 'physics';
    if (lowerMessage.includes('化学'))
        return 'chemistry';
    if (lowerMessage.includes('生物'))
        return 'biology';
    if (lowerMessage.includes('计算机') || lowerMessage.includes('编程'))
        return 'computer_science';
    if (lowerMessage.includes('机器人'))
        return 'robotics';
    if (context.userProfile?.preferences?.subjectAreas?.length) {
        return context.userProfile.preferences.subjectAreas[0];
    }
    if (context.currentPage) {
        if (context.currentPage.includes('physics'))
            return 'physics';
        if (context.currentPage.includes('chemistry'))
            return 'chemistry';
        if (context.currentPage.includes('biology'))
            return 'biology';
        if (context.currentPage.includes('computer'))
            return 'computer_science';
        if (context.currentPage.includes('robot'))
            return 'robotics';
    }
    return undefined;
}
async;
generateActions(request, types_1.ChatRequest, response, string);
Promise < types_1.AssistantAction[] > {
    const: actions, AssistantAction: types_1.AssistantAction, []:  = [],
    try: {
        const: intent = this.extractIntent(request.message),
        switch(intent) {
        },
        case: 'parameter_adjustment',
        actions, : .push({
            type: 'update_parameter',
            title: '更新实验参数',
            description: '根据建议调整实验参数',
            data: { parameters: this.extractParameterSuggestions(response) },
            confirmRequired: true,
        }),
        break: ,
        case: 'save_result',
        actions, : .push({
            type: 'save_result',
            title: '保存实验结果',
            description: '将当前实验结果保存到实验记录',
            data: { experimentId: request.context.experimentId },
            confirmRequired: false,
        }),
        break: ,
        case: 'apply_parameters',
        actions, : .push({
            type: 'apply_parameters',
            title: '应用推荐参数',
            description: '应用AI推荐的实验参数',
            data: { parameters: this.extractParameterSuggestions(response) },
            confirmRequired: true,
        }),
        break: 
    }
};
try { }
catch (error) {
    logger_1.logger.error('Error generating actions:', error);
}
return actions;
extractIntent(message, string);
string;
{
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('参数') || lowerMessage.includes('调整') || lowerMessage.includes('优化')) {
        return 'parameter_adjustment';
    }
    if (lowerMessage.includes('保存') || lowerMessage.includes('记录')) {
        return 'save_result';
    }
    if (lowerMessage.includes('应用') || lowerMessage.includes('使用')) {
        return 'apply_parameters';
    }
    return 'general_question';
}
extractParameterSuggestions(_response, string);
Record < string, any > {
    return: {}
};
generateMessageId();
string;
{
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async;
processVoiceChat(audioData, string, context, types_1.AssistantContext);
Promise < any > {
    try: {
        return: {
            transcription: '语音识别结果',
            intent: 'general_question',
            response: {
                text: '我听到了您的问题，让我为您解答...',
            },
        }
    }, catch(error) {
        logger_1.logger.error('Error processing voice chat:', error);
        throw new Error('语音处理服务暂时不可用');
    }
};
async;
analyzeExperiment(experimentId, string, data, any);
Promise < any > {
    try: {
        logger: logger_1.logger, : .info(`Analyzing experiment data for experiment ID: ${experimentId}`),
        const: experimentType = data.experimentType || 'unknown',
        switch(experimentType) {
        },
        case: 'image_classification',
        case: 'text_classification',
        case: 'object_detection',
        analysis = {
            performance: {
                accuracy: this.getMetricValue(data, 'accuracy', 0.85),
                loss: this.getMetricValue(data, 'loss', 0.15),
                trainingTime: data.trainingTime || '2小时30分钟',
                efficiency: '良好',
            },
            suggestions: [
                '建议增加训练数据以提高准确率',
                '可以尝试调整学习率参数',
            ],
        },
        break: ,
        case: 'physics_experiment',
        analysis = {
            performance: {
                errorRate: this.getMetricValue(data, 'errorRate', 0.03),
                repeatability: this.getMetricValue(data, 'repeatability', 0.92),
                experimentTime: data.experimentTime || '45分钟',
            },
            suggestions: [
                '建议减少外部环境干扰',
                '可以增加测量次数提高精度',
            ],
        },
        break: ,
        case: 'chemistry_experiment',
        analysis = {
            performance: {
                purity: this.getMetricValue(data, 'purity', 0.96),
                yield: this.getMetricValue(data, 'yield', 0.72),
                reactionTime: data.reactionTime || '30分钟',
            },
            suggestions: [
                '建议控制反应温度在适当范围',
                '可以优化反应物配比提高产率',
            ],
        },
        break: ,
        case: 'biology_experiment',
        analysis = {
            performance: {
                growthRate: this.getMetricValue(data, 'growthRate', 0.67),
                survivalRate: this.getMetricValue(data, 'survivalRate', 0.85),
                experimentDuration: data.experimentDuration || '7天',
            },
            suggestions: [
                '建议优化培养基配方',
                '可以改善环境控制提高存活率',
            ],
        },
        break: ,
        case: 'robotics_experiment',
        analysis = {
            performance: {
                accuracy: this.getMetricValue(data, 'accuracy', 0.78),
                speed: this.getMetricValue(data, 'speed', 0.65),
                batteryEfficiency: this.getMetricValue(data, 'batteryEfficiency', 0.82),
                experimentDuration: data.experimentDuration || '2小时',
            },
            suggestions: [
                '建议优化运动算法',
                '可以改进传感器精度',
            ],
        },
        break: ,
        default: analysis = {
            performance: {
                successRate: this.getMetricValue(data, 'successRate', 0.75),
                completionTime: data.completionTime || '1小时15分钟',
                efficiency: '中等',
            },
            suggestions: [
                '建议记录更详细的实验数据',
                '可以改进实验流程提高效率',
            ],
        }
    },
    analysis, : .conclusion = this.generateExperimentConclusion(experimentType, analysis.performance),
    return: { analysis }
};
try { }
catch (error) {
    logger_1.logger.error('Error analyzing experiment:', error);
    throw new Error('实验分析服务暂时不可用');
}
getMetricValue(data, any, metricName, string, defaultValue, number);
number;
{
    return data && data[metricName] !== undefined ? data[metricName] : defaultValue;
}
generateExperimentConclusion(experimentType, string, performance, any);
string;
{
    switch (experimentType) {
        case 'image_classification':
        case 'text_classification':
        case 'object_detection':
            return `模型表现${performance.accuracy > 0.8 ? '良好' : '一般'}，准确率为${performance.accuracy * 100}%，训练时间${performance.trainingTime}。`;
        case 'physics_experiment':
            return `实验误差率为${performance.errorRate * 100}%，重复性${performance.repeatability > 0.9 ? '很好' : '一般'}，总耗时${performance.experimentTime}。`;
        case 'chemistry_experiment':
            return `反应产物纯度为${performance.purity * 100}%，产率为${performance.yield * 100}%，反应时间${performance.reactionTime}。`;
        case 'biology_experiment':
            return `样本生长率为${performance.growthRate * 100}%，存活率为${performance.survivalRate * 100}%，实验周期${performance.experimentDuration}。`;
        case 'robotics_experiment':
            return `机器人运动精度为${performance.accuracy * 100}%，速度评分${performance.speed * 100}%，电池效率${performance.batteryEfficiency * 100}%。`;
        default:
            return `实验成功率为${performance.successRate * 100}%，完成时间${performance.completionTime}，总体效率${performance.efficiency}。`;
    }
}
generateMockResponse(message, string, context, types_1.AssistantContext);
string;
{
    logger_1.logger.info('Generating mock response for message:', message);
    if (context.experimentType) {
        return `这是一个针对${context.experimentType}实验的模拟AI助手响应。\n\n您可以在这里看到AI助手如何针对不同学科实验提供帮助。这是开发环境下的模拟数据，无需OpenAI API密钥。\n\n实验名称: ${context.experimentName || '未命名实验'}\n实验ID: ${context.experimentId || 'mock-exp-id'}\n\n您的问题是: "${message}"\n\n实验阶段的建议:\n1. 明确实验目标和假设\n2. 确认实验方法和步骤\n3. 准备必要的实验资源\n4. 执行实验并记录数据\n5. 分析结果并得出结论`;
    }
    const commonResponses = [
        `这是AI助手的模拟响应。您的问题是: "${message}"。在实际部署环境中，这里会返回真实的AI回答。`,
        `[开发模式] AI助手模拟响应。\n\n您询问的是: "${message}"\n\n这是一个测试响应，用于验证系统功能而无需API密钥。`,
        `AI助手测试模式已激活。\n\n您的输入: "${message}"\n\n在生产环境中，您将看到由OpenAI API生成的真实回答。`
    ];
    const index = Math.floor(Math.random() * commonResponses.length);
    return commonResponses[index] || "AI助手正在开发模式下运行。";
}
async;
testModelConnection(modelName, string, config, any, specificParams ?  : any);
Promise < { success: boolean, message: string, modelInfo: any } > {
    try: {
        const: apiKey = config.apiKey,
        if(, apiKey) {
            return { success: false, message: 'API密钥未提供' };
        },
        let, response,
        let, modelInfo: any = {},
        if(modelName) { }
    } === 'doubao-seed-1-6-thinking-250615'
};
{
    const endpoint = specificParams?.endpoint || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    modelInfo = {
        contextWindow: 256000,
        outputTokenLimit: 16000,
        inputTokenLimit: 224000,
        features: ['多模态', '长文本', '思考能力']
    };
    response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: specificParams?.model_id || 'doubao-seed-1-6-thinking-250615',
            messages: [
                { role: 'system', content: '这是一个测试请求' },
                { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            max_tokens: 10
        })
    });
}
if (modelName === 'deepseek-reasoner') {
    const endpoint = specificParams?.endpoint || 'https://api.deepseek.com/v1/chat/completions';
    modelInfo = {
        contextWindow: 32000,
        outputTokenLimit: 30000,
        inputTokenLimit: 32000,
        features: ['推理能力', '数学分析', '逻辑思维']
    };
    response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-reasoner',
            messages: [
                { role: 'system', content: '这是一个测试请求' },
                { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            max_tokens: 10
        })
    });
}
else {
    const endpoint = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
    modelInfo = {
        contextWindow: 4096,
        outputTokenLimit: 4096,
        inputTokenLimit: 4096
    };
    response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: 'system', content: '这是一个测试请求' },
                { role: 'user', content: '你好，这只是一个测试连接' }
            ],
            max_tokens: 10
        })
    });
}
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
        success: false,
        message: `连接失败: ${errorData?.error?.message || response.statusText || `HTTP错误 ${response.status}`}`
    };
}
return {
    success: true,
    message: '连接测试成功',
    modelInfo: modelInfo
};
try { }
catch (error) {
    logger_1.logger.error('模型连接测试错误:', error);
    return { success: false, message: `连接错误: ${error.message}` };
}
async;
callArkAPI(message, string, systemPrompt, string, conversationHistory, any[]);
Promise < string > {
    try: {
        const: response = await axios_1.default.post(`${this.arkBaseUrl}/chat/completions`, {
            model: this.arkModel,
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
                { role: 'user', content: message }
            ],
            max_tokens: 2000,
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.arkApiKey}`
            },
            timeout: 30000
        }),
        return: response.data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
    }, catch(error) {
        logger_1.logger.error('Ark API call failed:', error.message);
        throw new Error(`火山方舟API调用失败: ${error.message}`);
    }
};
//# sourceMappingURL=ai-assistant.service.backup.js.map