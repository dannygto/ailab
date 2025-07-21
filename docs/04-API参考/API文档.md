# AILAB 平台 API 文档（标准化）

## 概述

- RESTful API，统一认证（JWT），支持WebSocket实时通信
- 主要接口涵盖用户、实验、设备、资源、AI助手、数据分析等
- 支持多角色权限、批量操作、数据导入导出、自动化测试

## 认证机制
- 所有API需携带Authorization: Bearer <token>
- 登录接口获取token，token用于后续所有请求

## 主要接口示例

### 用户认证
```http
POST /api/auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "password123"
}
```

### 实验管理
```http
GET /api/experiments
POST /api/experiments
GET /api/experiments/{id}
PUT /api/experiments/{id}
DELETE /api/experiments/{id}
```

### 设备管理
```http
GET /api/devices
POST /api/devices
GET /api/devices/{id}
PUT /api/devices/{id}
DELETE /api/devices/{id}
```

### 资源管理
```http
GET /api/resources
POST /api/resources
GET /api/resources/{id}
PUT /api/resources/{id}
DELETE /api/resources/{id}
```

### AI助手与分析
```http
POST /api/ai/chat
POST /api/ai/analyze-experiment
```

### WebSocket
- 支持设备状态、实验进度、AI分析结果等实时推送

## 错误码与响应格式
- 统一JSON结构：success, data, message, error
- 常见错误码：401未认证，403无权限，404未找到，500服务器错误

## 国际化与扩展
- 预留多语言、国际标准合规、API版本管理、第三方集成等能力

---

**最后更新**：2025年6月28日 
