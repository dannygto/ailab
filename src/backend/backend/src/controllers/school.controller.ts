import { Request, Response } from 'express';

/**
 * 校区接口
 */
interface School {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  themeSettings?: any;
  active: boolean;
}

// 模拟数据
let schools: School[] = [
  {
    id: 1,
    name: '北京实验中学',
    code: 'bjsyzx',
    logoUrl: '/assets/schools/bjsyzx-logo.png',
    themeSettings: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
    },
    active: true
  },
  {
    id: 2,
    name: '上海科技高中',
    code: 'shkjgz',
    logoUrl: '/assets/schools/shkjgz-logo.png',
    themeSettings: {
      primaryColor: '#009688',
      secondaryColor: '#ff5722',
    },
    active: true
  }
];

/**
 * 校区控制器
 * 处理校区相关的API请求
 */
class SchoolController {
  /**
   * 获取所有校区
   */
  public getAllSchools = async (req: Request, res: Response): Promise<void> => {
    try {
      // 在实际应用中，这里应该从数据库查询
      res.status(200).json({
        success: true,
        data: schools
      });
    } catch (error) {
      console.error('获取校区列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取校区列表失败'
      });
    }
  };

  /**
   * 获取特定校区
   */
  public getSchoolByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const school = schools.find(s => s.code === code);
      
      if (!school) {
        res.status(404).json({
          success: false,
          error: '找不到指定校区'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: school
      });
    } catch (error) {
      console.error('获取校区信息失败:', error);
      res.status(500).json({
        success: false,
        error: '获取校区信息失败'
      });
    }
  };

  /**
   * 创建校区
   */
  public createSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const schoolData = req.body;
      
      // 验证必要字段
      if (!schoolData.name || !schoolData.code) {
        res.status(400).json({
          success: false,
          error: '校区名称和代码不能为空'
        });
        return;
      }
      
      // 检查代码是否已存在
      if (schools.some(s => s.code === schoolData.code)) {
        res.status(400).json({
          success: false,
          error: '校区代码已存在'
        });
        return;
      }
      
      // 创建新校区
      const newSchool: School = {
        id: schools.length > 0 ? Math.max(...schools.map(s => s.id)) + 1 : 1,
        name: schoolData.name,
        code: schoolData.code,
        logoUrl: schoolData.logoUrl,
        themeSettings: schoolData.themeSettings || {},
        active: true
      };
      
      schools.push(newSchool);
      
      res.status(201).json({
        success: true,
        data: newSchool
      });
    } catch (error) {
      console.error('创建校区失败:', error);
      res.status(500).json({
        success: false,
        error: '创建校区失败'
      });
    }
  };

  /**
   * 更新校区
   */
  public updateSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const schoolData = req.body;
      
      // 查找校区
      const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
      
      if (schoolIndex === -1) {
        res.status(404).json({
          success: false,
          error: '找不到指定校区'
        });
        return;
      }
      
      // 更新校区
      schools[schoolIndex] = {
        ...schools[schoolIndex],
        ...schoolData,
        id: schools[schoolIndex].id // 确保ID不变
      };
      
      res.status(200).json({
        success: true,
        data: schools[schoolIndex]
      });
    } catch (error) {
      console.error('更新校区失败:', error);
      res.status(500).json({
        success: false,
        error: '更新校区失败'
      });
    }
  };

  /**
   * 删除校区
   */
  public deleteSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // 查找校区
      const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
      
      if (schoolIndex === -1) {
        res.status(404).json({
          success: false,
          error: '找不到指定校区'
        });
        return;
      }
      
      // 删除校区
      schools.splice(schoolIndex, 1);
      
      res.status(200).json({
        success: true,
        message: '校区已成功删除'
      });
    } catch (error) {
      console.error('删除校区失败:', error);
      res.status(500).json({
        success: false,
        error: '删除校区失败'
      });
    }
  };
}

export default new SchoolController();
