#!/bin/bash

# 修复学校API路由问题

echo "======================================="
echo "  修复学校API路由问题"
echo "======================================="

# 确保后端目录存在
cd /home/ubuntu/ailab

echo "🔧 检查后端路由注册..."

# 检查server.ts中是否正确注册了school路由
if grep -q "schoolRoutes" src/backend/src/server.ts; then
    echo "✅ school路由已在server.ts中注册"
else
    echo "❌ school路由未在server.ts中注册，正在修复..."

    # 备份server.ts
    cp src/backend/src/server.ts src/backend/src/server.ts.bak

    # 在适当位置添加school路由导入和注册
    sed -i '/import settingsRoutes/a import schoolRoutes from '\''./routes/school.routes.js'\'';' src/backend/src/server.ts
    sed -i '/app.use.*\/api\/settings/a app.use('\''/api/schools'\'', schoolRoutes);' src/backend/src/server.ts

    echo "✅ school路由已添加到server.ts"
fi

# 检查school.routes.ts文件是否存在
if [ ! -f "src/backend/src/routes/school.routes.ts" ]; then
    echo "❌ school.routes.ts文件不存在，正在创建..."

    # 创建school.routes.ts文件
    cat > src/backend/src/routes/school.routes.ts << 'EOF'
import express from 'express';
import schoolController from '../controllers/school.controller.js';

const router = express.Router();

/**
 * 校区路由
 *
 * 提供校区管理相关的API端点
 */

// 获取所有校区
router.get('/', schoolController.getAllSchools);

// 获取特定校区
router.get('/:code', schoolController.getSchoolByCode);

// 创建校区
router.post('/', schoolController.createSchool);

// 更新校区
router.put('/:id', schoolController.updateSchool);

// 删除校区
router.delete('/:id', schoolController.deleteSchool);

export default router;
EOF

    echo "✅ school.routes.ts文件已创建"
fi

# 检查school.controller.ts文件是否存在
if [ ! -f "src/backend/src/controllers/school.controller.ts" ]; then
    echo "❌ school.controller.ts文件不存在，正在创建..."

    # 创建school.controller.ts文件
    cat > src/backend/src/controllers/school.controller.ts << 'EOF'
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

// 模拟数据 - 包含默认主校区
let schools: School[] = [
  {
    id: 1,
    name: '示范学校主校区',
    code: 'demo-main',
    logoUrl: '/assets/schools/demo-main-logo.png',
    themeSettings: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
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
      console.log('获取所有校区请求');
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
      console.log('获取校区信息请求, code:', code);

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
      console.log('创建校区请求:', schoolData);

      // 验证必填字段
      if (!schoolData.name || !schoolData.code) {
        res.status(400).json({
          success: false,
          error: '校区名称和代码不能为空'
        });
        return;
      }

      // 检查代码是否已存在
      const existingSchool = schools.find(s => s.code === schoolData.code);
      if (existingSchool) {
        res.status(400).json({
          success: false,
          error: '校区代码已存在'
        });
        return;
      }

      // 创建新校区
      const newSchool: School = {
        id: Math.max(...schools.map(s => s.id), 0) + 1,
        name: schoolData.name,
        code: schoolData.code,
        logoUrl: schoolData.logoUrl || '',
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
      const updateData = req.body;
      console.log('更新校区请求, id:', id, 'data:', updateData);

      const schoolIndex = schools.findIndex(s => s.id === parseInt(id));

      if (schoolIndex === -1) {
        res.status(404).json({
          success: false,
          error: '找不到指定校区'
        });
        return;
      }

      // 更新校区信息
      schools[schoolIndex] = { ...schools[schoolIndex], ...updateData };

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
      console.log('删除校区请求, id:', id);

      const schoolIndex = schools.findIndex(s => s.id === parseInt(id));

      if (schoolIndex === -1) {
        res.status(404).json({
          success: false,
          error: '找不到指定校区'
        });
        return;
      }

      // 检查是否是主校区（第一个校区不允许删除）
      if (schoolIndex === 0) {
        res.status(400).json({
          success: false,
          error: '主校区不能删除'
        });
        return;
      }

      // 删除校区
      const deletedSchool = schools.splice(schoolIndex, 1)[0];

      res.status(200).json({
        success: true,
        data: deletedSchool
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
EOF

    echo "✅ school.controller.ts文件已创建"
fi

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart ailab-backend

# 等待服务启动
sleep 3

# 测试API接口
echo "🧪 测试学校API接口..."

# 测试获取所有校区
echo "测试 GET /api/schools"
curl -s http://localhost:3001/api/schools | head -c 200
echo ""

# 测试获取特定校区
echo "测试 GET /api/schools/demo-main"
curl -s http://localhost:3001/api/schools/demo-main | head -c 200
echo ""

# 显示最终状态
echo "📊 服务状态："
pm2 status

echo ""
echo "✅ 学校API修复完成！"
echo "🌐 测试地址: http://82.156.75.232:3000"
