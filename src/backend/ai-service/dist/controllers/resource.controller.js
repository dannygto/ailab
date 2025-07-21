"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const resource_model_1 = require("../models/resource.model");
class ResourceController {
    async getResources(req, res) {
        try {
            const { type, category, search } = req.query;
            if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
                logger_1.default.info(`[MOCK] 获取资源列表: type=${type}, category=${category}, search=${search}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                const mockResources = this.generateMockResources(type);
                let filteredResources = category
                    ? mockResources.filter(r => r.metadata['category'] === category)
                    : mockResources;
                if (search) {
                    const searchTerm = search.toLowerCase();
                    filteredResources = filteredResources.filter(r => r.name.toLowerCase().includes(searchTerm) ||
                        (r.metadata['description'] && r.metadata['description'].toLowerCase().includes(searchTerm)));
                }
                res.json(filteredResources);
                return;
            }
            const query = {};
            if (type)
                query.type = type;
            if (category)
                query['metadata.category'] = category;
            if (search)
                query['$or'] = [
                    { name: { $regex: search, $options: 'i' } },
                    { 'metadata.description': { $regex: search, $options: 'i' } }
                ];
            const resources = await resource_model_1.ExperimentResourceModel.find(query).lean();
            res.json(resources);
        }
        catch (error) {
            logger_1.default.error('获取资源列表失败:', error);
            res.status(500).json({ message: '获取资源列表失败', error: error.message });
        }
    }
    async getResource(req, res) {
        try {
            const { id } = req.params;
            if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
                logger_1.default.info(`[MOCK] 获取资源详情: id=${id}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                const mockResources = this.generateMockResources();
                const resource = mockResources.find(r => r.id === id);
                if (!resource) {
                    res.status(404).json({ message: '资源不存在' });
                    return;
                }
                res.json(resource);
                return;
            }
            const dbResource = await resource_model_1.ExperimentResourceModel.findById(id).lean();
            if (!dbResource) {
                res.status(404).json({ message: '资源不存在' });
                return;
            }
            res.json(dbResource);
        }
        catch (error) {
            logger_1.default.error('获取资源详情失败:', error);
            res.status(500).json({ message: '获取资源详情失败', error: error.message });
        }
    }
    async createResource(req, res) {
        try {
            const resourceData = req.body;
            if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
                logger_1.default.info(`[MOCK] 创建资源: ${JSON.stringify(resourceData)}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                const newResource = {
                    id: `mock-resource-${Date.now()}`,
                    experimentId: resourceData.experimentId || 'global',
                    type: resourceData.type || 'dataset',
                    name: resourceData.name,
                    path: `/resources/${resourceData.name.toLowerCase().replace(/\s+/g, '-')}`,
                    size: resourceData.size || 0,
                    format: resourceData.format || 'unknown',
                    metadata: {
                        ...resourceData,
                        createdAt: new Date().toISOString()
                    },
                    createdAt: new Date()
                };
                res.status(201).json(newResource);
                return;
            }
            const created = await resource_model_1.ExperimentResourceModel.create(resourceData);
            res.status(201).json(created);
        }
        catch (error) {
            logger_1.default.error('创建资源失败:', error);
            res.status(500).json({ message: '创建资源失败', error: error.message });
        }
    }
    async updateResource(req, res) {
        try {
            const { id } = req.params;
            const resourceData = req.body;
            if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
                logger_1.default.info(`[MOCK] 更新资源: id=${id}, ${JSON.stringify(resourceData)}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockResources = this.generateMockResources();
                const resource = mockResources.find(r => r.id === id);
                if (!resource) {
                    res.status(404).json({ message: '资源不存在' });
                    return;
                }
                const updatedResource = {
                    ...resource,
                    name: resourceData.name || resource.name,
                    metadata: {
                        ...resource.metadata,
                        ...resourceData,
                        updatedAt: new Date().toISOString()
                    }
                };
                res.json(updatedResource);
                return;
            }
            const updated = await resource_model_1.ExperimentResourceModel.findByIdAndUpdate(id, resourceData, { new: true }).lean();
            if (!updated) {
                res.status(404).json({ message: '资源不存在' });
                return;
            }
            res.json(updated);
        }
        catch (error) {
            logger_1.default.error('更新资源失败:', error);
            res.status(500).json({ message: '更新资源失败', error: error.message });
        }
    }
    async deleteResource(req, res) {
        try {
            const { id } = req.params;
            if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
                logger_1.default.info(`[MOCK] 删除资源: id=${id}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                res.json({ message: '资源删除成功', id });
                return;
            }
            const deleted = await resource_model_1.ExperimentResourceModel.findByIdAndDelete(id).lean();
            if (!deleted) {
                res.status(404).json({ message: '资源不存在' });
                return;
            }
            res.json({ message: '资源删除成功', id });
        }
        catch (error) {
            logger_1.default.error('删除资源失败:', error);
            res.status(500).json({ message: '删除资源失败', error: error.message });
        }
    }
    generateMockResources(type) {
        const experimentTypes = [
            'physics_experiment',
            'chemistry_experiment',
            'biology_experiment',
            'integrated_science',
            'info_technology',
            'engineering_lab',
            'image_classification',
            'object_detection',
            'nlp_experiment'
        ];
        const resources = [];
        const typesToGenerate = type ? [type] : experimentTypes;
        typesToGenerate.forEach((expType) => {
            const count = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const isPhysical = Math.random() > 0.3;
                const resourceType = isPhysical ? 'physical' : 'virtual';
                let resourceName = '';
                let equipment = '';
                let software = '';
                if (expType === 'physics_experiment') {
                    resourceName = `物理实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
                    equipment = isPhysical ? '力学实验套件、光学元件、测量仪器' : '无需实体设备';
                    software = '物理实验数据分析软件';
                }
                else if (expType === 'chemistry_experiment') {
                    resourceName = `化学实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
                    equipment = isPhysical ? '试管、烧杯、滴定管、天平' : '无需实体设备';
                    software = '化学反应模拟软件';
                }
                else if (expType === 'biology_experiment') {
                    resourceName = `生物实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
                    equipment = isPhysical ? '显微镜、载玻片、培养皿' : '无需实体设备';
                    software = '生物数据分析系统';
                }
                else if (expType === 'integrated_science') {
                    resourceName = `综合科学${isPhysical ? '设备' : '软件'} ${i + 1}`;
                    equipment = isPhysical ? '多功能传感器、数据采集器' : '无需实体设备';
                    software = '综合实验分析平台';
                }
                else if (expType === 'info_technology') {
                    resourceName = `信息技术${isPhysical ? '设备' : '平台'} ${i + 1}`;
                    equipment = isPhysical ? '服务器、网络设备、开发板' : '无需实体设备';
                    software = '编程环境、模拟器';
                }
                else if (expType === 'engineering_lab') {
                    resourceName = `工程实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
                    equipment = isPhysical ? '材料测试机、电路分析仪' : '无需实体设备';
                    software = '工程设计软件';
                }
                else {
                    resourceName = `${expType.replace('_', ' ')} 数据集 ${i + 1}`;
                    equipment = '无需实体设备';
                    software = 'AI分析工具';
                }
                resources.push({
                    id: `mock-${expType}-${i}`,
                    experimentId: 'global',
                    type: isPhysical ? 'model' : 'dataset',
                    name: resourceName,
                    path: `/resources/${expType}/${resourceName.toLowerCase().replace(/\s+/g, '-')}`,
                    size: Math.floor(Math.random() * 1000) * 1024 * 1024,
                    format: isPhysical ? 'equipment' : 'software',
                    metadata: {
                        experimentType: expType,
                        resourceType: resourceType,
                        category: isPhysical ? 'basic_equipment' : 'software',
                        equipment,
                        software,
                        description: `这是${resourceName}的详细描述，包含其用途和适用场景。`,
                        availability: Math.random() > 0.1,
                        location: isPhysical ? '实验室A区' : '系统库',
                        quantity: isPhysical ? Math.floor(Math.random() * 10) + 1 : undefined,
                        lastMaintenance: isPhysical ? '2023-01-15' : undefined,
                        nextMaintenance: isPhysical ? '2023-07-15' : undefined,
                    },
                    createdAt: new Date(Date.now() - Math.random() * 10000000000)
                });
            }
        });
        return resources;
    }
}
exports.default = new ResourceController();
//# sourceMappingURL=resource.controller.js.map