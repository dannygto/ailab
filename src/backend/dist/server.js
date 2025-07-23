import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import guidanceRoutes from './routes/guidance.routes.js';
import deviceRoutes from './routes/device.routes.js';
import templateRoutes from './routes/template.routes.js';
import experimentRoutes from './routes/experiment.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import schoolRoutes from './routes/school.routes.js';
import { AIService } from './services/ai.service.js';
const aiService = new AIService();
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3002;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
    console.log('WebSocket客户端已连接');
    ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        message: 'WebSocket连接已建立',
        timestamp: new Date().toISOString()
    }));
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('收到WebSocket消息:', data);
            if (data.type === 'ping') {
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                }));
            }
            else if (data.type === 'ai-request') {
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        type: 'ai-response',
                        requestId: data.requestId,
                        message: '这是来自AI助手的响应',
                        timestamp: new Date().toISOString()
                    }));
                }, 1000);
            }
        }
        catch (err) {
            console.error('处理WebSocket消息时出错:', err);
            ws.send(JSON.stringify({
                type: 'error',
                message: '消息格式错误',
                timestamp: new Date().toISOString()
            }));
        }
    });
    ws.on('close', () => {
        console.log('WebSocket客户端已断开连接');
    });
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
    });
});
app.use(helmet());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.0.145:3000",
        "http://192.168.0.145:3001",
        "http://82.156.75.232:3000",
        "http://82.156.75.232:3001"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/guidance', guidanceRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/schools', schoolRoutes);
app.get('/', (req, res) => {
    res.json({
        message: '人工智能辅助实验平台后端API - 普教版',
        version: '1.0.0',
        edition: 'basic',
        timestamp: new Date().toISOString()
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
app.post('/api/ai-assistant/test-connection', (req, res) => {
    try {
        const { model, config, specificParams } = req.body;
        console.log(`🧪 测试AI模型连接: ${model}`);
        if (!model || !config || !config.apiKey) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数: 模型名称或API密钥'
            });
        }
        let tokenLimits = {};
        if (model === 'doubao-seed-1-6-thinking-250615') {
            tokenLimits = {
                contextWindow: 256000,
                inputTokenLimit: 240000,
                outputTokenLimit: 16000
            };
        }
        else if (model === 'deepseek-reasoner') {
            tokenLimits = {
                contextWindow: 128000,
                inputTokenLimit: 120000,
                outputTokenLimit: 8000
            };
        }
        else {
            tokenLimits = {
                contextWindow: 32000,
                inputTokenLimit: 30000,
                outputTokenLimit: 2000
            };
        }
        return res.json({
            success: true,
            message: `成功连接到 ${model}`,
            tokenLimits
        });
    }
    catch (error) {
        console.error('AI模型连接测试失败:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'AI模型连接测试失败'
        });
    }
});
app.get('/api/dashboard/stats', (req, res) => {
    const generateSystemHealth = () => ({
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 30,
        disk: Math.floor(Math.random() * 20) + 15,
        gpu: Math.floor(Math.random() * 25) + 5
    });
    res.json({
        totalExperiments: 15,
        runningExperiments: 3,
        completedExperiments: 10,
        failedExperiments: 2,
        totalUsers: 8,
        activeUsers: 5,
        systemHealth: generateSystemHealth(),
        lastUpdated: new Date().toISOString()
    });
});
app.get('/api/dashboard/recent-experiments', (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const experiments = [
        {
            id: '1',
            name: '磁铁性质探究',
            description: '观察磁铁的吸引力和磁极性质，探究磁铁在日常生活中的应用',
            type: 'observation',
            status: 'completed',
            userId: '1',
            parameters: {},
            data: {},
            results: {},
            metadata: {},
            createdAt: '2025-01-20T10:30:00Z',
            updatedAt: '2025-01-20T11:45:00Z',
            tags: ['物理', '小学'],
            grade: 'primary',
            subject: 'science',
            duration: 45
        },
        {
            id: '2',
            name: '简单电路制作',
            description: '学习基本电路原理，制作简单的串联和并联电路',
            type: 'measurement',
            status: 'running',
            userId: '1',
            parameters: {},
            data: {},
            results: {},
            metadata: {},
            createdAt: '2025-01-19T14:20:00Z',
            updatedAt: '2025-01-19T15:30:00Z',
            tags: ['物理', '初中'],
            grade: 'junior',
            subject: 'physics',
            duration: 60
        },
        {
            id: '3',
            name: '植物细胞观察',
            description: '使用显微镜观察植物细胞的结构，认识细胞壁、细胞核等组织',
            type: 'observation',
            status: 'completed',
            userId: '1',
            parameters: {},
            data: {},
            results: {},
            metadata: {},
            createdAt: '2025-01-18T09:15:00Z',
            updatedAt: '2025-01-18T10:20:00Z',
            tags: ['生物', '初中'],
            grade: 'junior',
            subject: 'biology',
            duration: 50
        },
        {
            id: '4',
            name: '化学反应实验',
            description: '观察酸碱中和反应现象，测量反应过程中的pH值变化',
            type: 'reaction',
            status: 'pending',
            userId: '1',
            parameters: {},
            data: {},
            results: {},
            metadata: {},
            createdAt: '2025-01-17T16:00:00Z',
            updatedAt: '2025-01-17T16:00:00Z',
            tags: ['化学', '高中'],
            grade: 'senior',
            subject: 'chemistry',
            duration: 90
        },
        {
            id: '5',
            name: '光的折射现象',
            description: '研究光在不同介质中的折射规律，测量折射角度',
            type: 'measurement',
            status: 'completed',
            userId: '1',
            parameters: {},
            data: {},
            results: {},
            metadata: {},
            createdAt: '2025-01-16T13:45:00Z',
            updatedAt: '2025-01-16T14:30:00Z',
            tags: ['物理', '初中'],
            grade: 'junior',
            subject: 'physics',
            duration: 70
        }
    ].slice(0, limit);
    res.json(experiments);
});
app.get('/api/experiments', (req, res) => {
    const experiments = [
        {
            id: '1',
            name: '磁铁的性质探究',
            title: '磁铁的性质探究',
            type: 'OBSERVATION',
            grade: 'primary',
            subject: 'science',
            description: '观察磁铁的吸引力和磁极性质，探究磁铁在日常生活中的应用',
            status: 'completed',
            createdAt: '2025-01-15',
            duration: '30分钟',
            materials: ['条形磁铁', '回形针', '铁钉', '塑料片'],
            safetyLevel: 'LOW'
        },
        {
            id: '2',
            name: '植物细胞观察',
            title: '植物细胞观察',
            type: 'OBSERVATION',
            grade: 'junior',
            subject: 'biology',
            description: '使用显微镜观察洋葱表皮细胞，认识植物细胞的基本结构',
            status: 'running',
            createdAt: '2025-01-10',
            duration: '45分钟',
            materials: ['洋葱', '显微镜', '载玻片', '碘液'],
            safetyLevel: 'MEDIUM'
        },
        {
            id: '3',
            name: '简单电路制作',
            title: '简单电路制作',
            type: 'DESIGN',
            grade: 'junior',
            subject: 'physics',
            description: '通过制作简单电路理解电路原理，学习串联和并联电路的区别',
            status: 'draft',
            createdAt: '2025-01-12',
            duration: '60分钟',
            materials: ['电池', '导线', '小灯泡', '开关'],
            safetyLevel: 'MEDIUM'
        }
    ];
    res.json({
        data: experiments,
        total: experiments.length,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: Math.ceil(experiments.length / (parseInt(req.query.limit) || 10))
    });
});
app.get('/api/teacher/students', (req, res) => {
    res.json({
        students: [
            {
                id: '1',
                name: '张小明',
                grade: '初二',
                class: '初二(3)班',
                email: 'zhangxm@example.com',
                status: 'active',
                joinDate: '2024-09-01',
                completedExperiments: 5
            },
            {
                id: '2',
                name: '李小红',
                grade: '初二',
                class: '初二(3)班',
                email: 'lixh@example.com',
                status: 'active',
                joinDate: '2024-09-01',
                completedExperiments: 7
            }
        ]
    });
});
app.get('/api/experiment-resources', (req, res) => {
    res.json({
        resources: [
            {
                id: '1',
                name: '磁铁的性质探究',
                subject: '科学',
                gradeLevel: '小学',
                type: 'investigation',
                difficulty: 'basic',
                duration: 45,
                materials: ['磁铁', '铁钉', '塑料片', '纸片', '指南针'],
                objectives: ['了解磁铁的基本性质', '观察磁极的相互作用', '学会使用指南针'],
                description: '通过实际操作，让学生了解磁铁的吸引力和磁极性质',
                status: 'published',
                createdDate: '2025-01-15',
                updatedDate: '2025-01-20'
            }
        ]
    });
});
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, modelId = 'deepseek-chat', apiKey, context = {}, options = {} } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        const messages = [
            { role: 'system', content: '你是多学科实验平台的AI助手，可以帮助学生和教师进行实验设计、参数调整和结果分析。请提供准确、简洁和有教育意义的回答。' },
            { role: 'user', content: message }
        ];
        if (apiKey) {
            if (modelId.includes('doubao') || modelId.includes('ark')) {
                process.env.ARK_API_KEY = apiKey;
            }
            else if (modelId.includes('deepseek')) {
                process.env.DEEPSEEK_API_KEY = apiKey;
            }
        }
        const aiResponse = await aiService.chat(messages, modelId, { ...options, apiKey });
        return res.json({ success: true, ...aiResponse });
    }
    catch (error) {
        console.error('AI助手接口错误:', error);
        res.status(500).json({ success: false, message: error.message || '服务器内部错误' });
    }
});
app.get('/api/ai/models', (req, res) => {
    try {
        console.log('🔍 调试信息:');
        console.log('aiService 类型:', typeof aiService);
        console.log('aiService 构造函数:', aiService.constructor.name);
        console.log('aiService 方法列表:', Object.getOwnPropertyNames(Object.getPrototypeOf(aiService)));
        console.log('getAvailableModels 方法:', typeof aiService.getAvailableModels);
        const availableModels = aiService.getAvailableModels();
        res.json({
            success: true,
            models: availableModels
        });
    }
    catch (error) {
        console.error('❌ 获取模型列表失败:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
app.post('/api/ai-assistant/test', async (req, res) => {
    const { modelId } = req.body;
    try {
        console.log('🧪 测试AI模型连接:', modelId);
        if (!modelId) {
            return res.status(400).json({
                success: false,
                message: '请提供模型ID'
            });
        }
        const result = await aiService.testModelConnection(modelId);
        console.log('🧪 连接测试结果:', result);
        res.json(result);
    }
    catch (error) {
        console.error('❌ AI连接测试失败:', error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
});
app.post('/api/ai-assistant/chat', async (req, res) => {
    try {
        const { message, modelId = 'deepseek-chat', apiKey, context = {}, options = {} } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        const messages = [
            { role: 'system', content: '你是多学科实验平台的AI助手，可以帮助学生和教师进行实验设计、参数调整和结果分析。请提供准确、简洁和有教育意义的回答。' },
            { role: 'user', content: message }
        ];
        if (apiKey) {
            if (modelId.includes('doubao') || modelId.includes('ark')) {
                process.env.ARK_API_KEY = apiKey;
            }
            else if (modelId.includes('deepseek')) {
                process.env.DEEPSEEK_API_KEY = apiKey;
            }
        }
        const aiResponse = await aiService.chat(messages, modelId, { ...options, apiKey });
        return res.json({ success: true, ...aiResponse });
    }
    catch (error) {
        console.error('AI助手接口错误:', error);
        res.status(500).json({ success: false, message: error.message || '服务器内部错误' });
    }
});
app.post('/api/ai-assistant/test', async (req, res) => {
    try {
        const { modelId = 'deepseek-chat' } = req.body;
        console.log(`🧪 测试AI模型连接: ${modelId}`);
        const result = await aiService.testModelConnection(modelId);
        res.json({
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI连接测试错误:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'AI模型连接测试失败'
        });
    }
});
function generateSuggestions(query, response) {
    const defaultSuggestions = [
        { text: '如何设计一个物理实验？', category: 'experiment' },
        { text: '数据分析有哪些常用方法？', category: 'analysis' },
        { text: '如何解释实验误差？', category: 'knowledge' }
    ];
    const suggestions = [];
    if (query.includes('实验') || response.includes('实验')) {
        suggestions.push({ text: '如何提高实验精确度？', category: 'experiment' }, { text: '实验数据如何可视化？', category: 'analysis' });
    }
    if (query.includes('物理') || response.includes('物理')) {
        suggestions.push({ text: '推荐一个物理力学实验', category: 'experiment' }, { text: '物理实验常见误差来源', category: 'knowledge' });
    }
    else if (query.includes('化学') || response.includes('化学')) {
        suggestions.push({ text: '化学滴定实验步骤', category: 'experiment' }, { text: '如何安全进行化学实验', category: 'knowledge' });
    }
    else if (query.includes('生物') || response.includes('生物')) {
        suggestions.push({ text: '显微镜使用方法', category: 'experiment' }, { text: '植物细胞观察实验', category: 'experiment' });
    }
    return [...suggestions, ...defaultSuggestions].slice(0, 5);
}
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: '未找到请求的资源' });
});
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`🚀 后端服务器启动成功！`);
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`🌐 外部地址: http://${HOST}:${PORT}（监听所有接口）`);
    console.log(`🎓 版本: 普教版 (K12基础教育)`);
    console.log(`🕐 时间: ${new Date().toLocaleString()}`);
});
//# sourceMappingURL=server.js.map