#!/bin/bash

# 简单修复前端API响应处理问题

echo "🔧 修复前端API响应处理..."

cd /home/ubuntu/ailab/src/frontend/src/services

# 1. 修复schoolService.ts中的数据访问
echo "修复schoolService.ts..."

# 创建修复后的schoolService内容
cat > schoolService.ts << 'EOL'
import apiService from './api';
import { toast } from 'react-hot-toast';

/**
 * 校区管理服务
 * 提供校区相关的API调用方法
 */
export class SchoolService {
  /**
   * 获取所有校区
   * @returns 校区列表
   */
  async getAllSchools() {
    try {
      const response = await apiService.get('/schools');

      // 处理不同的响应格式
      if (response && response.data) {
        // 如果响应有success字段
        if (response.success !== undefined) {
          return response.success ? (response.data || []) : [];
        }
        // 如果直接是数据数组
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
      }

      // 如果响应本身就是数组
      if (Array.isArray(response)) {
        return response;
      }

      console.warn('获取校区列表：未知响应格式', response);
      return [];
    } catch (error) {
      console.error('获取校区列表失败:', error);
      toast.error('获取校区列表失败');
      return [];
    }
  }

  /**
   * 获取特定校区信息
   * @param code 校区代码
   * @returns 校区信息
   */
  async getSchoolByCode(code: string) {
    try {
      const response = await apiService.get(`/schools/${code}`);

      // 处理不同的响应格式
      if (response && response.data) {
        // 如果响应有success字段
        if (response.success !== undefined) {
          return response.success ? response.data : null;
        }
        // 如果直接是数据对象
        return response.data.data || response.data;
      }

      // 如果响应本身就是数据对象
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        return response;
      }

      console.warn(`获取校区(${code})信息：未知响应格式`, response);
      return null;
    } catch (error) {
      console.error(`获取校区(${code})信息失败:`, error);
      toast.error('获取校区信息失败');
      return null;
    }
  }

  /**
   * 创建新校区
   * @param schoolData 校区数据
   * @returns 创建的校区信息
   */
  async createSchool(schoolData: any) {
    try {
      const response = await apiService.post('/schools', schoolData);

      if (response && response.data) {
        toast.success('校区创建成功');
        return response.success !== undefined ?
          (response.success ? response.data : null) :
          (response.data.data || response.data);
      }

      return response;
    } catch (error) {
      console.error('创建校区失败:', error);
      toast.error('创建校区失败');
      throw error;
    }
  }

  /**
   * 更新校区信息
   * @param id 校区ID
   * @param schoolData 校区更新数据
   * @returns 更新后的校区信息
   */
  async updateSchool(id: number, schoolData: any) {
    try {
      const response = await apiService.put(`/schools/${id}`, schoolData);

      if (response && response.data) {
        toast.success('校区信息更新成功');
        return response.success !== undefined ?
          (response.success ? response.data : null) :
          (response.data.data || response.data);
      }

      return response;
    } catch (error) {
      console.error('更新校区信息失败:', error);
      toast.error('更新校区信息失败');
      throw error;
    }
  }

  /**
   * 删除校区
   * @param id 校区ID
   * @returns 操作结果
   */
  async deleteSchool(id: number) {
    try {
      const response = await apiService.delete(`/schools/${id}`);
      toast.success('校区已成功删除');
      return response;
    } catch (error) {
      console.error('删除校区失败:', error);
      toast.error('删除校区失败');
      throw error;
    }
  }

  /**
   * 获取当前校区信息
   * @returns 当前校区信息
   */
  async getCurrentSchool() {
    try {
      // 从本地存储获取当前校区代码
      const currentSchoolCode = localStorage.getItem('currentSchoolCode') || this.getSchoolCodeFromUrl();

      if (!currentSchoolCode) {
        return null;
      }

      return await this.getSchoolByCode(currentSchoolCode);
    } catch (error) {
      console.error('获取当前校区信息失败:', error);
      return null;
    }
  }

  /**
   * 从URL中提取校区代码
   * @returns 校区代码
   */
  private getSchoolCodeFromUrl() {
    // 尝试从子域名获取校区代码
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length > 2) {
      return parts[0];
    }

    // 尝试从URL参数获取校区代码
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('schoolCode') || null;
  }

  /**
   * 设置当前校区
   * @param schoolCode 校区代码
   */
  setCurrentSchool(schoolCode: string) {
    localStorage.setItem('currentSchoolCode', schoolCode);
    // 重新加载页面以应用新校区设置
    window.location.reload();
  }
}

const schoolService = new SchoolService();
export default schoolService;
EOL

echo "✅ schoolService.ts修复完成"

# 2. 重启前端服务
echo "🔄 重启前端服务..."
cd /home/ubuntu/ailab/src/frontend

# 停止现有服务
pkill -f "npm.*start" || true
sleep 3

# 启动新服务
npm start > /tmp/frontend.log 2>&1 &

echo "✅ 前端服务已重启"

# 3. 等待并测试
sleep 15

echo "🧪 测试API连接..."

# 测试前端
FRONTEND_STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000)
echo "前端服务状态: $FRONTEND_STATUS"

# 测试后端API
API_STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/schools)
echo "后端API状态: $API_STATUS"

if [ "$FRONTEND_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    echo "✅ 修复完成！前端和后端API都正常运行"
else
    echo "⚠️ 部分服务可能需要更多时间启动"
fi

echo ""
echo "📋 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001/api/schools"
echo ""
echo "📊 如果还有问题，请检查浏览器控制台的错误信息"
