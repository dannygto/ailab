# T1-9 前后端API对应问题修复计划

## 问题分析

通过对前端服务和后端控制器/路由的分析，发现以下几类API对应问题：

1. **缺失的API实现**：前端调用了一些在后端没有对应实现的API
2. **接口不一致**：前端与后端的参数结构或返回格式不匹配
3. **路径不匹配**：API路径命名不一致
4. **缺少类型定义**：部分接口缺少明确的类型定义

## 修复策略

采用以下策略解决API对应问题：

1. 为所有缺失的API添加后端实现
2. 统一API命名规范和路径结构
3. 完善类型定义，确保前后端类型一致
4. 优化API响应处理，统一错误处理机制
5. 实现API版本控制机制

## 需修复的API清单

### 1. 实验相关API

| 前端API调用 | 后端实现状态 | 修复计划 |
|------------|-------------|---------|
| `/experiments` (GET) | ❌ 缺失 | 实现获取实验列表API |
| `/experiments/:id` (GET) | ❌ 缺失 | 实现获取单个实验API |
| `/experiments` (POST) | ❌ 缺失 | 实现创建实验API |
| `/experiments/:id` (PUT) | ❌ 缺失 | 实现更新实验API |
| `/experiments/:id` (DELETE) | ❌ 缺失 | 实现删除实验API |
| `/experiments/:id/start` (POST) | ❌ 缺失 | 实现启动实验API |
| `/experiments/:id/stop` (POST) | ❌ 缺失 | 实现停止实验API |
| `/experiments/:id/clone` (POST) | ❌ 缺失 | 实现克隆实验API |
| `/experiments/:id/results` (GET) | ❌ 缺失 | 实现获取实验结果API |
| `/experiments/:id/upload` (POST) | ❌ 缺失 | 实现上传实验数据API |
| `/experiments/:id/execution` (GET) | ⚠️ 部分实现 | 完善实验执行状态API |
| `/experiments/:id/logs` (GET) | ⚠️ 部分实现 | 完善获取日志API |
| `/experiments/:id/metrics` (GET) | ⚠️ 部分实现 | 完善获取指标API |

### 2. 模板相关API

| 前端API调用 | 后端实现状态 | 修复计划 |
|------------|-------------|---------|
| `/templates` (GET) | ✅ 已实现 | 检查类型一致性 |
| `/templates/popular` (GET) | ✅ 已实现 | 检查类型一致性 |
| `/templates/search` (POST) | ✅ 已实现 | 检查类型一致性 |
| `/templates/:id` (GET) | ✅ 已实现 | 检查类型一致性 |
| `/templates` (POST) | ✅ 已实现 | 检查类型一致性 |
| `/templates/:id` (PUT) | ✅ 已实现 | 检查类型一致性 |
| `/templates/:id` (DELETE) | ✅ 已实现 | 检查类型一致性 |
| `/templates/:templateId/create-experiment` (POST) | ❌ 缺失 | 实现基于模板创建实验API |

### 3. AI服务相关API

| 前端API调用 | 后端实现状态 | 修复计划 |
|------------|-------------|---------|
| `/ai/models` (GET) | ⚠️ 可能缺失 | 检查并实现获取AI模型列表 |
| `/ai/complete` (POST) | ⚠️ 可能缺失 | 检查并实现文本补全API |
| `/ai/chat` (POST) | ⚠️ 可能缺失 | 检查并实现聊天API |
| `/ai/generate-image` (POST) | ⚠️ 可能缺失 | 检查并实现图像生成API |
| `/ai/analyze-image` (POST) | ⚠️ 可能缺失 | 检查并实现图像分析API |
| `/ai/health` (GET) | ⚠️ 可能缺失 | 检查并实现健康检查API |
| 其他AI高级分析API | ⚠️ 可能缺失 | 根据需要选择性实现 |

### 4. 系统设置相关API

| 前端API调用 | 后端实现状态 | 修复计划 |
|------------|-------------|---------|
| `/settings/general` (GET/PUT) | ❌ 缺失 | 实现通用设置API |
| `/settings/theme` (GET/PUT) | ❌ 缺失 | 实现主题设置API |
| `/settings/data` (GET/PUT) | ❌ 缺失 | 实现数据设置API |

## 实施计划

### 第一阶段：创建实验控制器和路由

1. 创建 `experiment.controller.ts` 实现实验相关API
2. 创建 `experiment.routes.ts` 定义实验路由
3. 更新类型定义确保前后端一致

### 第二阶段：实现系统设置API

1. 创建 `settings.controller.ts` 实现设置相关API
2. 创建 `settings.routes.ts` 定义设置路由
3. 实现设置存储和管理机制

### 第三阶段：完善AI服务API

1. 创建/更新 `ai.controller.ts` 实现AI相关API
2. 创建/更新 `ai.routes.ts` 定义AI路由
3. 实现AI服务与外部服务的整合

### 第四阶段：完善模板API

1. 补充 `template.controller.ts` 中缺失的API实现
2. 更新 `template.routes.ts` 添加缺失的路由

### 第五阶段：API测试与验证

1. 编写API测试用例
2. 进行端到端测试
3. 修复发现的问题

## 时间安排

- 第一阶段：2025年7月4日
- 第二阶段：2025年7月5日
- 第三阶段：2025年7月6日
- 第四阶段：2025年7月7日
- 第五阶段：2025年7月8日

## 注意事项

1. 所有API应遵循RESTful设计原则
2. 统一响应格式为 `{ success: boolean, data?: any, error?: string }`
3. 实现适当的权限控制和验证
4. 添加详细的API文档注释
5. 确保错误处理的一致性和友好性
