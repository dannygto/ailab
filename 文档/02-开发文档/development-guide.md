# 开发指南

本文档提供AICAM平台的开发指南，帮助开发者快速上手项目。

## 开发环境设置

### 系统要求

- **Node.js**: v16.0.0或更高版本
- **npm**: v8.0.0或更高版本
- **Python**: v3.8或更高版本（用于AI服务）
- **IDE**: 推荐使用Visual Studio Code

### 推荐的VS Code插件

- ESLint
- Prettier
- TypeScript Vue Plugin
- Material Icon Theme
- GitLens

## 开发流程

### 1. 克隆项目

```bash
git clone [项目地址]
cd AICAMV2
```

### 2. 安装依赖

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/build.ps1" -install
```

### 3. 启动开发服务

#### 启动所有服务（前端、后端、AI服务）

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/start-platform.ps1" -all -dev
```

#### 只启动前端

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/start-platform.ps1" -frontend -dev
```

#### 只启动后端

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/start-platform.ps1" -backend -dev
```

#### 只启动AI服务

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/start-platform.ps1" -ai
```

### 4. 访问服务

- 前端: [http://localhost:3000](http://localhost:3000)
- 后端API: [http://localhost:3002](http://localhost:3002)
- 健康检查: [http://localhost:3002/health](http://localhost:3002/health)

## 代码规范

### TypeScript规范

- 使用接口定义所有数据模型
- 避免使用`any`类型
- 为函数参数和返回值添加类型注解
- 使用枚举定义常量集合

### React组件规范

- 使用函数组件和Hooks
- 组件文件采用PascalCase命名
- 组件属性使用接口定义
- 复杂组件使用子组件拆分

### 后端规范

- 遵循MVC架构
- API端点采用RESTful设计
- 使用中间件处理通用逻辑
- 所有异步操作使用async/await

## 开发指引

### 前端开发

1. **添加新页面**

   ```typescript
   // src/pages/NewPage.tsx
   import React from 'react';
   
   interface NewPageProps {
     title: string;
   }
   
   const NewPage: React.FC<NewPageProps> = ({ title }) => {
     return (
       <div>
         <h1>{title}</h1>
         {/* 页面内容 */}
       </div>
     );
   };
   
   export default NewPage;
   ```

2. **添加路由**

   ```typescript
   // src/routes/index.tsx
   import NewPage from '../pages/NewPage';
   
   // 添加到路由配置
   const routes = [
     // 其他路由
     {
       path: '/new-page',
       element: <NewPage title="新页面" />
     }
   ];
   ```

### 后端开发

1. **添加新API端点**

   ```typescript
   // src/controllers/newController.ts
   import { Request, Response } from 'express';
   
   export const getData = async (req: Request, res: Response) => {
     try {
       // 处理逻辑
       res.json({ success: true, data: {} });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   };
   ```

2. **注册路由**

   ```typescript
   // src/routes/newRoutes.ts
   import { Router } from 'express';
   import { getData } from '../controllers/newController';
   
   const router = Router();
   router.get('/data', getData);
   
   export default router;
   ```

   ```typescript
   // src/routes/index.ts
   import newRoutes from './newRoutes';
   
   // 添加到主路由
   app.use('/api/new', newRoutes);
   ```

### AI服务开发

1. **添加新AI功能**

   ```python
   # ai/services/new_service.py
   def process_data(input_data):
       # 处理逻辑
       return {"result": "processed data"}
   ```

2. **集成到主服务**

   ```python
   # ai/main.py
   from services.new_service import process_data
   
   # 添加到API路由
   @app.route('/api/process', methods=['POST'])
   def api_process():
       data = request.json
       result = process_data(data)
       return jsonify(result)
   ```

## 测试

### 前端测试

```bash
cd frontend
npm test
```

### 后端测试

```bash
cd backend
npm test
```

## 构建

### 前端构建

```bash
cd frontend
npm run build
```

### 后端构建

```bash
cd backend
npm run build
```

### 全部构建

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/build.ps1" -all -production
```

## 调试技巧

- 使用Chrome DevTools调试前端
- 使用VS Code的调试功能调试Node.js后端
- 使用console.log/winston记录关键信息
- 使用React Developer Tools分析组件性能

---

**最后更新**: 2025年6月28日
