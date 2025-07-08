"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
// 实验数据存储
const experiments = new Map();
// 实验执行状态存储
const experimentExecutions = new Map();
/**
 * 实验控制器
 * 处理实验相关的API请求
 */
class ExperimentController {
    constructor() {
        /**
         * 获取实验列表
         */
        this.getAllExperiments = async (req, res) => {
            try {
                const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status, type, search } = req.query;
                // 从存储中获取所有实验
                let items = Array.from(experiments.values());
                // 过滤逻辑
                if (status) {
                    items = items.filter(exp => exp.status === status);
                }
                if (type) {
                    items = items.filter(exp => exp.type === type);
                }
                if (search) {
                    const searchTerm = String(search).toLowerCase();
                    items = items.filter(exp => exp.title.toLowerCase().includes(searchTerm) ||
                        exp.description.toLowerCase().includes(searchTerm));
                }
                // 排序逻辑
                items.sort((a, b) => {
                    const aValue = a[String(sort)] || '';
                    const bValue = b[String(sort)] || '';
                    if (order === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    }
                    else {
                        return aValue < bValue ? 1 : -1;
                    }
                });
                // 分页逻辑
                const pageNum = Number(page);
                const limitNum = Number(limit);
                const startIndex = (pageNum - 1) * limitNum;
                const endIndex = pageNum * limitNum;
                const paginatedItems = items.slice(startIndex, endIndex);
                // 构建响应
                res.status(200).json({
                    success: true,
                    data: {
                        items: paginatedItems,
                        total: items.length,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(items.length / limitNum)
                    }
                });
            }
            catch (error) {
                console.error('获取实验列表失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验列表失败'
                });
            }
        };
        /**
         * 获取单个实验
         */
        this.getExperimentById = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: experiment
                });
            }
            catch (error) {
                console.error('获取实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验详情失败'
                });
            }
        };
        /**
         * 创建实验
         */
        this.createExperiment = async (req, res) => {
            try {
                const { title, description, type, config, templateId } = req.body;
                // 验证必要字段
                if (!title || !type) {
                    res.status(400).json({
                        success: false,
                        error: '标题和类型为必填项'
                    });
                    return;
                }
                // 创建新实验
                const now = new Date().toISOString();
                const newExperiment = {
                    id: (0, uuid_1.v4)(),
                    title,
                    description: description || '',
                    status: 'draft',
                    type,
                    createdBy: req.body.userId || 'anonymous',
                    createdAt: now,
                    updatedAt: now,
                    config: config || {},
                    templateId
                };
                // 保存实验
                experiments.set(newExperiment.id, newExperiment);
                res.status(201).json({
                    success: true,
                    data: newExperiment
                });
            }
            catch (error) {
                console.error('创建实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '创建实验失败'
                });
            }
        };
        /**
         * 更新实验
         */
        this.updateExperiment = async (req, res) => {
            try {
                const { id } = req.params;
                const { title, description, status, config, results } = req.body;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 更新实验字段
                const updatedExperiment = {
                    ...experiment,
                    title: title !== undefined ? title : experiment.title,
                    description: description !== undefined ? description : experiment.description,
                    status: status !== undefined ? status : experiment.status,
                    config: config !== undefined ? { ...experiment.config, ...config } : experiment.config,
                    results: results !== undefined ? { ...experiment.results, ...results } : experiment.results,
                    updatedAt: new Date().toISOString()
                };
                // 保存更新后的实验
                experiments.set(id, updatedExperiment);
                res.status(200).json({
                    success: true,
                    data: updatedExperiment
                });
            }
            catch (error) {
                console.error('更新实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '更新实验失败'
                });
            }
        };
        /**
         * 删除实验
         */
        this.deleteExperiment = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 删除实验
                experiments.delete(id);
                res.status(200).json({
                    success: true,
                    data: null
                });
            }
            catch (error) {
                console.error('删除实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '删除实验失败'
                });
            }
        };
        /**
         * 启动实验
         */
        this.startExperiment = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 检查是否可以启动
                if (experiment.status === 'running') {
                    res.status(400).json({
                        success: false,
                        error: '实验已经在运行中'
                    });
                    return;
                }
                // 更新实验状态
                const updatedExperiment = {
                    ...experiment,
                    status: 'running',
                    updatedAt: new Date().toISOString()
                };
                // 保存更新后的实验
                experiments.set(id, updatedExperiment);
                // 创建执行记录
                const execution = {
                    id: (0, uuid_1.v4)(),
                    experimentId: id,
                    status: 'running',
                    progress: 0,
                    logs: [
                        {
                            timestamp: new Date().toISOString(),
                            level: 'info',
                            message: '实验已启动'
                        }
                    ],
                    metrics: {
                        currentLoss: 0,
                        currentAccuracy: 0,
                        timeElapsed: 0
                    },
                    startedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                experimentExecutions.set(id, execution);
                res.status(200).json({
                    success: true,
                    data: updatedExperiment
                });
            }
            catch (error) {
                console.error('启动实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '启动实验失败'
                });
            }
        };
        /**
         * 停止实验
         */
        this.stopExperiment = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 检查是否可以停止
                if (experiment.status !== 'running' && experiment.status !== 'paused') {
                    res.status(400).json({
                        success: false,
                        error: '只有运行中或暂停的实验可以停止'
                    });
                    return;
                }
                // 更新实验状态
                const updatedExperiment = {
                    ...experiment,
                    status: 'stopped',
                    updatedAt: new Date().toISOString()
                };
                // 保存更新后的实验
                experiments.set(id, updatedExperiment);
                // 更新执行记录
                const execution = experimentExecutions.get(id);
                if (execution) {
                    execution.status = 'stopped';
                    execution.updatedAt = new Date().toISOString();
                    execution.logs.push({
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: '实验已停止'
                    });
                    experimentExecutions.set(id, execution);
                }
                res.status(200).json({
                    success: true,
                    data: updatedExperiment
                });
            }
            catch (error) {
                console.error('停止实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '停止实验失败'
                });
            }
        };
        /**
         * 克隆实验
         */
        this.cloneExperiment = async (req, res) => {
            try {
                const { id } = req.params;
                const { title } = req.body;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 创建新实验
                const now = new Date().toISOString();
                const newExperiment = {
                    ...experiment,
                    id: (0, uuid_1.v4)(),
                    title: title || `${experiment.title} (复制)`,
                    status: 'draft',
                    createdAt: now,
                    updatedAt: now,
                    results: {},
                };
                // 保存新实验
                experiments.set(newExperiment.id, newExperiment);
                res.status(201).json({
                    success: true,
                    data: newExperiment
                });
            }
            catch (error) {
                console.error('克隆实验失败:', error);
                res.status(500).json({
                    success: false,
                    error: '克隆实验失败'
                });
            }
        };
        /**
         * 获取实验结果
         */
        this.getExperimentResults = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: experiment.results || {}
                });
            }
            catch (error) {
                console.error('获取实验结果失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验结果失败'
                });
            }
        };
        /**
         * 上传实验数据
         */
        this.uploadExperimentData = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 检查文件是否存在
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        error: '未提供文件'
                    });
                    return;
                }
                // 这里应该处理上传的文件
                // 模拟处理
                const uploadResult = {
                    filename: req.file.filename,
                    size: req.file.size,
                    uploadedAt: new Date().toISOString()
                };
                // 更新实验
                experiment.data = {
                    ...experiment.data,
                    uploadedFile: uploadResult
                };
                experiment.updatedAt = new Date().toISOString();
                // 保存更新后的实验
                experiments.set(id, experiment);
                res.status(200).json({
                    success: true,
                    data: uploadResult
                });
            }
            catch (error) {
                console.error('上传实验数据失败:', error);
                res.status(500).json({
                    success: false,
                    error: '上传实验数据失败'
                });
            }
        };
        /**
         * 获取实验执行状态
         */
        this.getExperimentExecution = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 获取执行状态
                const execution = experimentExecutions.get(id);
                if (!execution) {
                    res.status(404).json({
                        success: false,
                        error: '找不到实验执行记录'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: execution
                });
            }
            catch (error) {
                console.error('获取实验执行状态失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验执行状态失败'
                });
            }
        };
        /**
         * 获取实验日志
         */
        this.getExperimentLogs = async (req, res) => {
            try {
                const { id } = req.params;
                const limit = parseInt(req.query.limit) || 100;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 获取执行状态
                const execution = experimentExecutions.get(id);
                if (!execution) {
                    res.status(404).json({
                        success: false,
                        error: '找不到实验执行记录'
                    });
                    return;
                }
                // 获取限制数量的日志
                const logs = execution.logs.slice(-limit);
                res.status(200).json({
                    success: true,
                    data: logs
                });
            }
            catch (error) {
                console.error('获取实验日志失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验日志失败'
                });
            }
        };
        /**
         * 获取实验指标
         */
        this.getExperimentMetrics = async (req, res) => {
            try {
                const { id } = req.params;
                // 从存储中获取实验
                const experiment = experiments.get(id);
                if (!experiment) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定的实验'
                    });
                    return;
                }
                // 获取执行状态
                const execution = experimentExecutions.get(id);
                if (!execution) {
                    res.status(404).json({
                        success: false,
                        error: '找不到实验执行记录'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: execution.metrics
                });
            }
            catch (error) {
                console.error('获取实验指标失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取实验指标失败'
                });
            }
        };
    }
}
exports.default = new ExperimentController();
