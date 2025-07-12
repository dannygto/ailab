"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guidanceController = exports.GuidanceController = void 0;
const guidance_model_1 = require("../models/guidance.model");
// 模拟数据库
const guidanceSuggestions = new Map();
const guidanceSessions = new Map();
// 初始化一些示例数据
function initializeExampleData() {
    // 示例指导建议
    const suggestions = [
        {
            id: 'gs-001',
            type: guidance_model_1.GuidanceSuggestionType.CONCEPT,
            title: '理解磁铁的基本性质',
            content: '磁铁具有两个磁极（北极和南极），同名磁极相互排斥，异名磁极相互吸引。磁力线从北极出发，经过外部空间，再回到南极，形成闭合曲线。',
            importance: 4,
            triggerConditions: {
                progressStatus: [guidance_model_1.LearningProgressStatus.BEGINNING],
                errorPatterns: [],
                timeTrigger: true,
                manualTrigger: true
            },
            relatedResources: [
                {
                    id: 'video-001',
                    type: 'video',
                    title: '磁铁的奥秘',
                    url: '/assets/videos/magnet-mystery.mp4'
                }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'gs-002',
            type: guidance_model_1.GuidanceSuggestionType.SAFETY,
            title: '使用酸碱试剂的安全注意事项',
            content: '处理酸碱溶液时，必须佩戴护目镜和手套。稀释浓酸时，应该将酸慢慢倒入水中，而不是将水倒入酸中，以避免剧烈反应和飞溅。',
            importance: 5,
            triggerConditions: {
                progressStatus: [guidance_model_1.LearningProgressStatus.BEGINNING, guidance_model_1.LearningProgressStatus.PROGRESSING],
                errorPatterns: ['未佩戴防护装备', '错误的稀释方法'],
                timeTrigger: false,
                manualTrigger: true
            },
            relatedResources: [
                {
                    id: 'doc-001',
                    type: 'document',
                    title: '实验室安全手册',
                    url: '/assets/documents/lab-safety-guide.pdf'
                }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'gs-003',
            type: guidance_model_1.GuidanceSuggestionType.NEXT_STEP,
            title: '下一步：记录植物细胞观察结果',
            content: '请在显微镜下找到3-5个完整的洋葱表皮细胞，并绘制它们的结构图。标记出细胞壁、细胞膜、细胞核和液泡。注意观察细胞的形状和排列方式。',
            importance: 3,
            triggerConditions: {
                progressStatus: [guidance_model_1.LearningProgressStatus.PROGRESSING],
                timeTrigger: true,
                manualTrigger: false
            },
            createdAt: new Date().toISOString()
        }
    ];
    // 将示例数据添加到Map中
    suggestions.forEach(suggestion => {
        guidanceSuggestions.set(suggestion.id, suggestion);
    });
}
// 初始化示例数据
initializeExampleData();
class GuidanceController {
    constructor() {
        // 获取所有指导建议
        this.getAllGuidanceSuggestions = (req, res) => {
            try {
                const suggestions = Array.from(guidanceSuggestions.values());
                // 支持过滤和分页
                const type = req.query.type;
                const importance = req.query.importance;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // 应用过滤
                let filteredSuggestions = suggestions;
                if (type) {
                    filteredSuggestions = filteredSuggestions.filter(s => s.type === type);
                }
                if (importance) {
                    const importanceLevel = parseInt(importance);
                    filteredSuggestions = filteredSuggestions.filter(s => s.importance === importanceLevel);
                }
                // 应用分页
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedSuggestions = filteredSuggestions.slice(startIndex, endIndex);
                res.json({
                    success: true,
                    data: {
                        data: paginatedSuggestions,
                        total: filteredSuggestions.length,
                        page,
                        limit,
                        totalPages: Math.ceil(filteredSuggestions.length / limit)
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取指导建议失败'
                });
            }
        };
        // 获取单个指导建议
        this.getGuidanceSuggestionById = (req, res) => {
            try {
                const { id } = req.params;
                const suggestion = guidanceSuggestions.get(id);
                if (!suggestion) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导建议'
                    });
                }
                res.json({
                    success: true,
                    data: suggestion
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取指导建议失败'
                });
            }
        };
        // 创建指导建议
        this.createGuidanceSuggestion = (req, res) => {
            try {
                const suggestionData = req.body;
                // 验证必要字段
                if (!suggestionData.title || !suggestionData.content || !suggestionData.type) {
                    return res.status(400).json({
                        success: false,
                        message: '缺少必要字段'
                    });
                }
                // 生成唯一ID
                const id = 'gs-' + Date.now().toString();
                // 创建新的指导建议
                const newSuggestion = {
                    id,
                    type: suggestionData.type,
                    title: suggestionData.title,
                    content: suggestionData.content,
                    importance: suggestionData.importance || 3,
                    triggerConditions: suggestionData.triggerConditions || {
                        timeTrigger: true,
                        manualTrigger: true
                    },
                    relatedResources: suggestionData.relatedResources || [],
                    createdAt: new Date().toISOString()
                };
                // 保存到模拟数据库
                guidanceSuggestions.set(id, newSuggestion);
                res.status(201).json({
                    success: true,
                    message: '指导建议创建成功',
                    data: newSuggestion
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '创建指导建议失败'
                });
            }
        };
        // 更新指导建议
        this.updateGuidanceSuggestion = (req, res) => {
            try {
                const { id } = req.params;
                const suggestionData = req.body;
                // 检查指导建议是否存在
                if (!guidanceSuggestions.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导建议'
                    });
                }
                // 获取现有数据
                const existingSuggestion = guidanceSuggestions.get(id);
                // 更新数据
                const updatedSuggestion = {
                    ...existingSuggestion,
                    ...suggestionData,
                    id // 确保ID不变
                };
                // 保存更新后的数据
                guidanceSuggestions.set(id, updatedSuggestion);
                res.json({
                    success: true,
                    message: '指导建议更新成功',
                    data: updatedSuggestion
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '更新指导建议失败'
                });
            }
        };
        // 删除指导建议
        this.deleteGuidanceSuggestion = (req, res) => {
            try {
                const { id } = req.params;
                // 检查指导建议是否存在
                if (!guidanceSuggestions.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导建议'
                    });
                }
                // 从模拟数据库中删除
                guidanceSuggestions.delete(id);
                res.json({
                    success: true,
                    message: '指导建议删除成功',
                    data: { id }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '删除指导建议失败'
                });
            }
        };
        // 生成AI指导建议
        this.generateAIGuidance = async (req, res) => {
            try {
                const { experimentId, experimentType, studentId, currentStage, learningStatus, context } = req.body;
                // 验证必要字段
                if (!experimentType || !currentStage) {
                    return res.status(400).json({
                        success: false,
                        message: '缺少必要参数'
                    });
                }
                // 准备AI提示
                const messages = [
                    {
                        role: 'system',
                        content: `你是一个专业的K12实验教学助手。你需要为学生提供关于${experimentType}实验的指导建议。
请根据学生当前的实验阶段和学习状态，提供针对性的指导。
你的建议应该简洁明了，具有教育性，并且容易理解。
同时关注安全事项和正确的实验方法。`
                    },
                    {
                        role: 'user',
                        content: `我正在进行${experimentType}实验，当前处于"${currentStage}"阶段。
${context ? `具体情况是：${context}` : ''}
${learningStatus ? `我的学习进度是：${learningStatus}` : ''}
请给我一些指导建议，帮助我顺利完成这个阶段的实验。`
                    }
                ];
                // 简单模拟AI响应，避免直接调用AI服务
                const aiResponse = {
                    content: `以下是关于${experimentType}实验在"${currentStage}"阶段的指导建议：

1. 确保记录所有观察数据，不要只依赖记忆
2. 在测量过程中，保持仪器水平并读取准确的刻度值
3. 每组测量重复至少3次，以减少随机误差
4. 如果发现结果与预期相差较大，检查实验步骤是否正确执行
5. 注意安全，特别是在处理实验器材时

需要更详细的指导或有具体问题，请随时提问。`,
                    usage: {
                        promptTokens: 150,
                        completionTokens: 200,
                        totalTokens: 350
                    },
                    model: 'simulation-model'
                };
                // 创建一个新的会话ID或使用现有的
                const sessionId = req.body.sessionId || `session-${Date.now()}`;
                // 记录交互
                let session = guidanceSessions.get(sessionId);
                if (!session) {
                    // 创建新会话
                    session = {
                        id: sessionId,
                        studentId: studentId || 'anonymous',
                        experimentId: experimentId || 'unknown',
                        startTime: new Date().toISOString(),
                        status: 'active',
                        interactions: [],
                        learningObjectives: []
                    };
                    guidanceSessions.set(sessionId, session);
                }
                // 添加新交互
                session.interactions.push({
                    timestamp: new Date().toISOString(),
                    source: 'system',
                    type: 'guidance',
                    content: aiResponse.content,
                    relatedStage: currentStage
                });
                // 返回AI生成的指导建议
                res.json({
                    success: true,
                    data: {
                        sessionId,
                        guidance: aiResponse.content,
                        type: guidance_model_1.GuidanceSuggestionType.NEXT_STEP,
                        timestamp: new Date().toISOString(),
                        usage: aiResponse.usage
                    }
                });
            }
            catch (error) {
                console.error('生成AI指导建议失败:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || '生成AI指导建议失败'
                });
            }
        };
        // 获取指导会话历史
        this.getGuidanceSessionHistory = (req, res) => {
            try {
                const { sessionId } = req.params;
                const session = guidanceSessions.get(sessionId);
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导会话'
                    });
                }
                res.json({
                    success: true,
                    data: session
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取指导会话历史失败'
                });
            }
        };
        // 添加学生问题到会话
        this.addStudentQuestion = (req, res) => {
            try {
                const { sessionId } = req.params;
                const { question, stage } = req.body;
                // 验证必要字段
                if (!question) {
                    return res.status(400).json({
                        success: false,
                        message: '问题内容不能为空'
                    });
                }
                // 获取会话
                let session = guidanceSessions.get(sessionId);
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导会话'
                    });
                }
                // 添加学生问题
                session.interactions.push({
                    timestamp: new Date().toISOString(),
                    source: 'student',
                    type: 'question',
                    content: question,
                    relatedStage: stage
                });
                res.json({
                    success: true,
                    message: '问题已添加到会话',
                    data: {
                        sessionId,
                        interactionCount: session.interactions.length
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '添加问题失败'
                });
            }
        };
    }
}
exports.GuidanceController = GuidanceController;
exports.guidanceController = new GuidanceController();
