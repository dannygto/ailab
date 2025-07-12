import { Request, Response } from 'express';
import logger from '../utils/logger';
import { ExperimentResource } from '../types';

/**
 * 实验资源控制器
 * 负责处理与实验资源相关的请求
 */
class ResourceController {
  /**
   * 获取资源列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getResources(req: Request, res: Response): Promise<void> {
    try {
      const { type, category, search } = req.query;
      
      // 在开发环境中，返回模拟数据
      if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
        logger.info(`[MOCK] 获取资源列表: type=${type}, category=${category}, search=${search}`);
        
        // 延迟模拟数据库查询时间
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟资源数据
        const mockResources = this.generateMockResources(type as string);
        
        // 根据category过滤
        let filteredResources = category 
          ? mockResources.filter(r => r.metadata['category'] === category)
          : mockResources;
          
        // 根据search搜索
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          filteredResources = filteredResources.filter(r => 
            r.name.toLowerCase().includes(searchTerm) || 
            (r.metadata['description'] && r.metadata['description'].toLowerCase().includes(searchTerm))
          );
        }
        
        res.json(filteredResources);
        return;
      }
      
      // TODO: 连接数据库，根据查询参数获取资源列表
      
      res.status(501).json({ message: '此功能尚未实现' });
    } catch (error) {
      logger.error('获取资源列表失败:', error);
      res.status(500).json({ message: '获取资源列表失败', error: (error as Error).message });
    }
  }

  /**
   * 获取单个资源详情
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 在开发环境中，返回模拟数据
      if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
        logger.info(`[MOCK] 获取资源详情: id=${id}`);
        
        // 延迟模拟数据库查询时间
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟资源数据
        const mockResources = this.generateMockResources();
        const resource = mockResources.find(r => r.id === id);
        
        if (!resource) {
          res.status(404).json({ message: '资源不存在' });
          return;
        }
        
        res.json(resource);
        return;
      }
      
      // TODO: 连接数据库，获取指定ID的资源
      
      res.status(501).json({ message: '此功能尚未实现' });
    } catch (error) {
      logger.error('获取资源详情失败:', error);
      res.status(500).json({ message: '获取资源详情失败', error: (error as Error).message });
    }
  }

  /**
   * 创建新资源
   * @param req 请求对象
   * @param res 响应对象
   */
  public async createResource(req: Request, res: Response): Promise<void> {
    try {
      const resourceData = req.body;
      
      // 在开发环境中，模拟创建
      if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
        logger.info(`[MOCK] 创建资源: ${JSON.stringify(resourceData)}`);
        
        // 延迟模拟数据库操作时间
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 创建模拟资源ID
        const newResource: ExperimentResource = {
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
      
      // TODO: 连接数据库，创建新资源
      
      res.status(501).json({ message: '此功能尚未实现' });
    } catch (error) {
      logger.error('创建资源失败:', error);
      res.status(500).json({ message: '创建资源失败', error: (error as Error).message });
    }
  }

  /**
   * 更新资源
   * @param req 请求对象
   * @param res 响应对象
   */
  public async updateResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resourceData = req.body;
      
      // 在开发环境中，模拟更新
      if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
        logger.info(`[MOCK] 更新资源: id=${id}, ${JSON.stringify(resourceData)}`);
        
        // 延迟模拟数据库操作时间
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟资源数据
        const mockResources = this.generateMockResources();
        const resource = mockResources.find(r => r.id === id);
        
        if (!resource) {
          res.status(404).json({ message: '资源不存在' });
          return;
        }
        
        // 更新资源
        const updatedResource: ExperimentResource = {
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
      
      // TODO: 连接数据库，更新资源
      
      res.status(501).json({ message: '此功能尚未实现' });
    } catch (error) {
      logger.error('更新资源失败:', error);
      res.status(500).json({ message: '更新资源失败', error: (error as Error).message });
    }
  }

  /**
   * 删除资源
   * @param req 请求对象
   * @param res 响应对象
   */
  public async deleteResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 在开发环境中，模拟删除
      if (process.env["NODE_ENV"] === 'development' || process.env["MOCK_DB"] === 'true') {
        logger.info(`[MOCK] 删除资源: id=${id}`);
        
        // 延迟模拟数据库操作时间
        await new Promise(resolve => setTimeout(resolve, 500));
        
        res.json({ message: '资源删除成功', id });
        return;
      }
      
      // TODO: 连接数据库，删除资源
      
      res.status(501).json({ message: '此功能尚未实现' });
    } catch (error) {
      logger.error('删除资源失败:', error);
      res.status(500).json({ message: '删除资源失败', error: (error as Error).message });
    }
  }

  /**
   * 生成模拟资源数据
   * @param type 资源类型，可选
   * @returns 模拟资源数据数组
   */
  private generateMockResources(type?: string): ExperimentResource[] {
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
    
    const resources: ExperimentResource[] = [];
    
    // 为每种实验类型生成资源
    const typesToGenerate = type ? [type] : experimentTypes;
    
    typesToGenerate.forEach((expType) => {
      // 为每种类型生成3-5个资源
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
        } else if (expType === 'chemistry_experiment') {
          resourceName = `化学实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
          equipment = isPhysical ? '试管、烧杯、滴定管、天平' : '无需实体设备';
          software = '化学反应模拟软件';
        } else if (expType === 'biology_experiment') {
          resourceName = `生物实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
          equipment = isPhysical ? '显微镜、载玻片、培养皿' : '无需实体设备';
          software = '生物数据分析系统';
        } else if (expType === 'integrated_science') {
          resourceName = `综合科学${isPhysical ? '设备' : '软件'} ${i + 1}`;
          equipment = isPhysical ? '多功能传感器、数据采集器' : '无需实体设备';
          software = '综合实验分析平台';
        } else if (expType === 'info_technology') {
          resourceName = `信息技术${isPhysical ? '设备' : '平台'} ${i + 1}`;
          equipment = isPhysical ? '服务器、网络设备、开发板' : '无需实体设备';
          software = '编程环境、模拟器';
        } else if (expType === 'engineering_lab') {
          resourceName = `工程实验${isPhysical ? '设备' : '软件'} ${i + 1}`;
          equipment = isPhysical ? '材料测试机、电路分析仪' : '无需实体设备';
          software = '工程设计软件';
        } else {
          // AI相关资源
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
          size: Math.floor(Math.random() * 1000) * 1024 * 1024, // 随机大小
          format: isPhysical ? 'equipment' : 'software',
          metadata: {
            experimentType: expType,
            resourceType: resourceType,
            category: isPhysical ? 'basic_equipment' : 'software',
            equipment,
            software,
            description: `这是${resourceName}的详细描述，包含其用途和适用场景。`,
            availability: Math.random() > 0.1, // 90%的概率为可用
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

export default new ResourceController();
