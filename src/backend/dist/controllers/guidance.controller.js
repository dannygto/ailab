import { GuidanceSuggestionType, LearningProgressStatus } from '../models/guidance.model.js';
const guidanceSuggestions = new Map();
const guidanceSessions = new Map();
function initializeExampleData() {
    const suggestions = [
        {
            id: 'gs-001',
            type: GuidanceSuggestionType.CONCEPT,
            title: '理解磁铁的基本性质',
            content: '磁铁具有两个磁极（北极和南极），同名磁极相互排斥，异名磁极相互吸引。磁力线从北极出发，经过外部空间，再回到南极，形成闭合曲线。',
            importance: 4,
            triggerConditions: {
                progressStatus: [LearningProgressStatus.BEGINNING],
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
            type: GuidanceSuggestionType.SAFETY,
            title: '使用酸碱试剂的安全注意事项',
            content: '处理酸碱溶液时，必须佩戴护目镜和手套。稀释浓酸时，应该将酸慢慢倒入水中，而不是将水倒入酸中，以避免剧烈反应和飞溅。',
            importance: 5,
            triggerConditions: {
                progressStatus: [LearningProgressStatus.BEGINNING, LearningProgressStatus.PROGRESSING],
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
            type: GuidanceSuggestionType.NEXT_STEP,
            title: '下一步：记录植物细胞观察结果',
            content: '请在显微镜下找到3-5个完整的洋葱表皮细胞，并绘制它们的结构图。标记出细胞壁、细胞膜、细胞核和液泡。注意观察细胞的形状和排列方式。',
            importance: 3,
            triggerConditions: {
                progressStatus: [LearningProgressStatus.PROGRESSING],
                timeTrigger: true,
                manualTrigger: false
            },
            createdAt: new Date().toISOString()
        }
    ];
    suggestions.forEach(suggestion => {
        guidanceSuggestions.set(suggestion.id, suggestion);
    });
}
initializeExampleData();
export class GuidanceController {
    constructor() {
        this.getAllGuidanceSuggestions = (req, res) => {
            try {
                const suggestions = Array.from(guidanceSuggestions.values());
                const type = req.query.type;
                const importance = req.query.importance;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                let filteredSuggestions = suggestions;
                if (type) {
                    filteredSuggestions = filteredSuggestions.filter(s => s.type === type);
                }
                if (importance) {
                    const importanceLevel = parseInt(importance);
                    filteredSuggestions = filteredSuggestions.filter(s => s.importance === importanceLevel);
                }
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
        this.createGuidanceSuggestion = (req, res) => {
            try {
                const suggestionData = req.body;
                if (!suggestionData.title || !suggestionData.content || !suggestionData.type) {
                    return res.status(400).json({
                        success: false,
                        message: '缺少必要字段'
                    });
                }
                const id = 'gs-' + Date.now().toString();
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
        this.updateGuidanceSuggestion = (req, res) => {
            try {
                const { id } = req.params;
                const suggestionData = req.body;
                if (!guidanceSuggestions.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导建议'
                    });
                }
                const existingSuggestion = guidanceSuggestions.get(id);
                const updatedSuggestion = {
                    ...existingSuggestion,
                    ...suggestionData,
                    id
                };
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
        this.deleteGuidanceSuggestion = (req, res) => {
            try {
                const { id } = req.params;
                if (!guidanceSuggestions.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导建议'
                    });
                }
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
        this.generateAIGuidance = async (req, res) => {
            try {
                const { experimentId, experimentType, studentId, currentStage, learningStatus, context } = req.body;
                if (!experimentType || !currentStage) {
                    return res.status(400).json({
                        success: false,
                        message: '缺少必要参数'
                    });
                }
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
                const sessionId = req.body.sessionId || `session-${Date.now()}`;
                let session = guidanceSessions.get(sessionId);
                if (!session) {
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
                session.interactions.push({
                    timestamp: new Date().toISOString(),
                    source: 'system',
                    type: 'guidance',
                    content: aiResponse.content,
                    relatedStage: currentStage
                });
                res.json({
                    success: true,
                    data: {
                        sessionId,
                        guidance: aiResponse.content,
                        type: GuidanceSuggestionType.NEXT_STEP,
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
        this.addStudentQuestion = (req, res) => {
            try {
                const { sessionId } = req.params;
                const { question, stage } = req.body;
                if (!question) {
                    return res.status(400).json({
                        success: false,
                        message: '问题内容不能为空'
                    });
                }
                let session = guidanceSessions.get(sessionId);
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的指导会话'
                    });
                }
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
export const guidanceController = new GuidanceController();
//# sourceMappingURL=guidance.controller.js.map