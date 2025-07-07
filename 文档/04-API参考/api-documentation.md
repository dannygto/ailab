# AICAM系统API文档

## 概述

AICAM系统提供RESTful API接口，支持设备管理、摄像头控制、数据分析等功能。所有API都遵循统一的响应格式和错误处理机制。

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **认证方式**: JWT Token
- **内容类型**: `application/json`
- **字符编码**: UTF-8

## 认证

### 获取访问令牌

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "name": "管理员",
      "role": "admin"
    }
  },
  "message": "登录成功"
}
```

### 使用令牌

在请求头中添加Authorization字段：

```http
Authorization: Bearer <your-token>
```

## 设备管理API

### 获取设备列表

```http
GET /api/devices
Authorization: Bearer <token>
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `type`: 设备类型 (可选)
- `status`: 设备状态 (可选)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "摄像头001",
        "type": "camera",
        "status": "online",
        "location": {
          "lat": 39.9042,
          "lng": 116.4074
        },
        "lastSeen": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 创建设备

```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新摄像头",
  "type": "camera",
  "model": "Hikvision DS-2CD2T47G1-L",
  "location": {
    "lat": 39.9042,
    "lng": 116.4074,
    "address": "北京市朝阳区"
  },
  "config": {
    "resolution": "1920x1080",
    "fps": 25,
    "ptz": true
  }
}
```

### 更新设备

```http
PUT /api/devices/{deviceId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新后的设备名称",
  "config": {
    "resolution": "2560x1440",
    "fps": 30
  }
}
```

### 删除设备

```http
DELETE /api/devices/{deviceId}
Authorization: Bearer <token>
```

## 摄像头控制API

### 获取摄像头状态

```http
GET /api/cameras/{cameraId}/status
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "online",
    "streamUrl": "rtsp://192.168.1.100:554/stream1",
    "ptz": {
      "pan": 0,
      "tilt": 0,
      "zoom": 1
    },
    "recording": false,
    "lastSnapshot": "2024-01-15T10:30:00Z"
  }
}
```

### 控制云台

```http
POST /api/cameras/{cameraId}/ptz
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "move",
  "direction": "up",
  "speed": 50,
  "duration": 2000
}
```

**支持的操作**:
- `move`: 移动云台
- `stop`: 停止移动
- `home`: 回到初始位置
- `preset`: 调用预置位

**支持的方向**:
- `up`, `down`, `left`, `right`
- `up-left`, `up-right`, `down-left`, `down-right`

### 获取视频流

```http
GET /api/cameras/{cameraId}/stream
Authorization: Bearer <token>
```

**查询参数**:
- `quality`: 视频质量 (low, medium, high)
- `format`: 视频格式 (h264, h265)

### 拍摄快照

```http
POST /api/cameras/{cameraId}/snapshot
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/snapshots/camera_001_20240115_103000.jpg",
    "timestamp": "2024-01-15T10:30:00Z",
    "size": 245760
  }
}
```

### 开始/停止录制

```http
POST /api/cameras/{cameraId}/recording
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "start",
  "duration": 3600,
  "quality": "high"
}
```

## 数据分析API

### 获取传感器数据

```http
GET /api/data/sensors
Authorization: Bearer <token>
```

**查询参数**:
- `deviceId`: 设备ID
- `type`: 传感器类型
- `startTime`: 开始时间
- `endTime`: 结束时间
- `limit`: 数据点数量

**响应示例**:
```json
{
  "success": true,
  "data": {
    "sensors": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "temperature",
        "value": 25.6,
        "unit": "°C",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "type": "humidity",
        "value": 65.2,
        "unit": "%",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 获取历史数据

```http
GET /api/data/history
Authorization: Bearer <token>
```

**查询参数**:
- `deviceId`: 设备ID
- `metric`: 指标名称
- `period`: 时间周期 (1h, 1d, 1w, 1m)
- `aggregation`: 聚合方式 (avg, min, max, sum)

### 触发AI分析

```http
POST /api/analysis/trigger
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "507f1f77bcf86cd799439011",
  "type": "crop_health",
  "options": {
    "includeImage": true,
    "includeSensorData": true
  }
}
```

**支持的分析类型**:
- `crop_health`: 作物健康分析
- `pest_detection`: 病虫害检测
- `weather_analysis`: 天气分析
- `soil_analysis`: 土壤分析

### 获取分析结果

```http
GET /api/analysis/results/{analysisId}
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "type": "crop_health",
    "status": "completed",
    "result": {
      "health_score": 85,
      "issues": [
        {
          "type": "nutrient_deficiency",
          "severity": "medium",
          "description": "检测到氮肥不足",
          "recommendation": "建议增加氮肥施用量"
        }
      ],
      "recommendations": [
        "增加氮肥施用量",
        "调整灌溉频率",
        "监测土壤pH值"
      ]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:32:00Z"
  }
}
```

## 系统配置API

### 获取系统配置

```http
GET /api/config/system
Authorization: Bearer <token>
```

### 更新系统配置

```http
PUT /api/config/system
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera": {
    "recordingEnabled": true,
    "maxRecordingDuration": 7200,
    "snapshotInterval": 300
  },
  "sensor": {
    "dataCollectionInterval": 60000,
    "alertThresholds": {
      "temperature": {
        "min": 10,
        "max": 35
      },
      "humidity": {
        "min": 40,
        "max": 80
      }
    }
  },
  "ai": {
    "analysisEnabled": true,
    "autoAnalysisInterval": 3600
  }
}
```

### 获取巡视点配置

```http
GET /api/config/patrol-points
Authorization: Bearer <token>
```

### 添加巡视点

```http
POST /api/config/patrol-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "巡视点1",
  "cameraId": "507f1f77bcf86cd799439011",
  "position": {
    "pan": 45,
    "tilt": 30,
    "zoom": 2
  },
  "duration": 5000,
  "order": 1
}
```

## 用户管理API

### 获取用户列表

```http
GET /api/users
Authorization: Bearer <token>
```

### 创建用户

```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "name": "新用户",
  "email": "user@example.com",
  "role": "operator"
}
```

### 更新用户

```http
PUT /api/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新后的用户名",
  "email": "updated@example.com",
  "role": "admin"
}
```

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入参数验证失败",
    "details": [
      {
        "field": "username",
        "message": "用户名不能为空"
      }
    ]
  }
}
```

### 常见错误代码

- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `VALIDATION_ERROR`: 参数验证失败
- `NOT_FOUND`: 资源不存在
- `CONFLICT`: 资源冲突
- `INTERNAL_ERROR`: 服务器内部错误

### HTTP状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `500`: 服务器错误

## 实时通信

### WebSocket连接

```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// 监听设备状态变化
socket.on('device-status-change', (data) => {
  console.log('设备状态变化:', data);
});

// 监听传感器数据
socket.on('sensor-data', (data) => {
  console.log('传感器数据:', data);
});

// 监听AI分析结果
socket.on('analysis-result', (data) => {
  console.log('分析结果:', data);
});
```

### 事件类型

- `device-status-change`: 设备状态变化
- `sensor-data`: 传感器数据更新
- `camera-control`: 摄像头控制命令
- `analysis-result`: AI分析结果
- `alert`: 告警通知

## 速率限制

API请求受到速率限制，默认限制为：
- 每个IP每分钟最多100个请求
- 认证接口每分钟最多10个请求

超过限制时返回429状态码。

## 版本控制

API版本通过URL路径控制：
- 当前版本: `/api/v1/`
- 未来版本: `/api/v2/`

## 支持

如有问题，请联系：
- 邮箱: support@aicam.com
- 文档: https://docs.aicam.com
- 问题反馈: https://github.com/aicam/issues 