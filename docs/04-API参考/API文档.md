# 此文件是 [documentation\04-api-reference\api-documentation.md] 的中文链接

> 注意：此文件是为了满足文档命名标准化的需要而创建的链接文件。原始内容在英文命名的文件中。

---

# AICAM绯荤粺API鏂囨。

## 姒傝堪

AICAM绯荤粺鎻愪緵RESTful API鎺ュ彛锛屾敮鎸佽澶囩鐞嗐€佹憚鍍忓ご鎺у埗銆佹暟鎹垎鏋愮瓑鍔熻兘銆傛墍鏈堿PI閮介伒寰粺涓€鐨勫搷搴旀牸寮忓拰閿欒澶勭悊鏈哄埗銆?

## 鍩虹淇℃伅

- **Base URL**: `http://localhost:3001/api`
- **璁よ瘉鏂瑰紡**: JWT Token
- **鍐呭绫诲瀷**: `application/json`
- **瀛楃缂栫爜**: UTF-8

## 璁よ瘉

### 鑾峰彇璁块棶浠ょ墝

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**鍝嶅簲绀轰緥**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "name": "绠＄悊鍛?,
      "role": "admin"
    }
  },
  "message": "鐧诲綍鎴愬姛"
}
```

### 浣跨敤浠ょ墝

鍦ㄨ姹傚ご涓坊鍔燗uthorization瀛楁锛?

```http
Authorization: Bearer <your-token>
```

## 璁惧绠＄悊API

### 鑾峰彇璁惧鍒楄〃

```http
GET /api/devices
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:
- `page`: 椤电爜 (榛樿: 1)
- `limit`: 姣忛〉鏁伴噺 (榛樿: 10)
- `type`: 璁惧绫诲瀷 (鍙€?
- `status`: 璁惧鐘舵€?(鍙€?

**鍝嶅簲绀轰緥**:
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "鎽勫儚澶?01",
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

### 鍒涘缓璁惧

```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏂版憚鍍忓ご",
  "type": "camera",
  "model": "Hikvision DS-2CD2T47G1-L",
  "location": {
    "lat": 39.9042,
    "lng": 116.4074,
    "address": "鍖椾含甯傛湞闃冲尯"
  },
  "config": {
    "resolution": "1920x1080",
    "fps": 25,
    "ptz": true
  }
}
```

### 鏇存柊璁惧

```http
PUT /api/devices/{deviceId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏇存柊鍚庣殑璁惧鍚嶇О",
  "config": {
    "resolution": "2560x1440",
    "fps": 30
  }
}
```

### 鍒犻櫎璁惧

```http
DELETE /api/devices/{deviceId}
Authorization: Bearer <token>
```

## 鎽勫儚澶存帶鍒禔PI

### 鑾峰彇鎽勫儚澶寸姸鎬?

```http
GET /api/cameras/{cameraId}/status
Authorization: Bearer <token>
```

**鍝嶅簲绀轰緥**:
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

### 鎺у埗浜戝彴

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

**鏀寔鐨勬搷浣?*:
- `move`: 绉诲姩浜戝彴
- `stop`: 鍋滄绉诲姩
- `home`: 鍥炲埌鍒濆浣嶇疆
- `preset`: 璋冪敤棰勭疆浣?

**鏀寔鐨勬柟鍚?*:
- `up`, `down`, `left`, `right`
- `up-left`, `up-right`, `down-left`, `down-right`

### 鑾峰彇瑙嗛娴?

```http
GET /api/cameras/{cameraId}/stream
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:
- `quality`: 瑙嗛璐ㄩ噺 (low, medium, high)
- `format`: 瑙嗛鏍煎紡 (h264, h265)

### 鎷嶆憚蹇収

```http
POST /api/cameras/{cameraId}/snapshot
Authorization: Bearer <token>
```

**鍝嶅簲绀轰緥**:
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

### 寮€濮?鍋滄褰曞埗

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

## 鏁版嵁鍒嗘瀽API

### 鑾峰彇浼犳劅鍣ㄦ暟鎹?

```http
GET /api/data/sensors
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:
- `deviceId`: 璁惧ID
- `type`: 浼犳劅鍣ㄧ被鍨?
- `startTime`: 寮€濮嬫椂闂?
- `endTime`: 缁撴潫鏃堕棿
- `limit`: 鏁版嵁鐐规暟閲?

**鍝嶅簲绀轰緥**:
```json
{
  "success": true,
  "data": {
    "sensors": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "temperature",
        "value": 25.6,
        "unit": "掳C",
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

### 鑾峰彇鍘嗗彶鏁版嵁

```http
GET /api/data/history
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:
- `deviceId`: 璁惧ID
- `metric`: 鎸囨爣鍚嶇О
- `period`: 鏃堕棿鍛ㄦ湡 (1h, 1d, 1w, 1m)
- `aggregation`: 鑱氬悎鏂瑰紡 (avg, min, max, sum)

### 瑙﹀彂AI鍒嗘瀽

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

**鏀寔鐨勫垎鏋愮被鍨?*:
- `crop_health`: 浣滅墿鍋ュ悍鍒嗘瀽
- `pest_detection`: 鐥呰櫕瀹虫娴?
- `weather_analysis`: 澶╂皵鍒嗘瀽
- `soil_analysis`: 鍦熷￥鍒嗘瀽

### 鑾峰彇鍒嗘瀽缁撴灉

```http
GET /api/analysis/results/{analysisId}
Authorization: Bearer <token>
```

**鍝嶅簲绀轰緥**:
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
          "description": "妫€娴嬪埌姘偉涓嶈冻",
          "recommendation": "寤鸿澧炲姞姘偉鏂界敤閲?
        }
      ],
      "recommendations": [
        "澧炲姞姘偉鏂界敤閲?,
        "璋冩暣鐏屾簤棰戠巼",
        "鐩戞祴鍦熷￥pH鍊?
      ]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:32:00Z"
  }
}
```

## 绯荤粺閰嶇疆API

### 鑾峰彇绯荤粺閰嶇疆

```http
GET /api/config/system
Authorization: Bearer <token>
```

### 鏇存柊绯荤粺閰嶇疆

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

### 鑾峰彇宸¤鐐归厤缃?

```http
GET /api/config/patrol-points
Authorization: Bearer <token>
```

### 娣诲姞宸¤鐐?

```http
POST /api/config/patrol-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "宸¤鐐?",
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

## 鐢ㄦ埛绠＄悊API

### 鑾峰彇鐢ㄦ埛鍒楄〃

```http
GET /api/users
Authorization: Bearer <token>
```

### 鍒涘缓鐢ㄦ埛

```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "name": "鏂扮敤鎴?,
  "email": "user@example.com",
  "role": "operator"
}
```

### 鏇存柊鐢ㄦ埛

```http
PUT /api/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏇存柊鍚庣殑鐢ㄦ埛鍚?,
  "email": "updated@example.com",
  "role": "admin"
}
```

## 閿欒澶勭悊

### 閿欒鍝嶅簲鏍煎紡

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "杈撳叆鍙傛暟楠岃瘉澶辫触",
    "details": [
      {
        "field": "username",
        "message": "鐢ㄦ埛鍚嶄笉鑳戒负绌?
      }
    ]
  }
}
```

### 甯歌閿欒浠ｇ爜

- `AUTHENTICATION_ERROR`: 璁よ瘉澶辫触
- `AUTHORIZATION_ERROR`: 鏉冮檺涓嶈冻
- `VALIDATION_ERROR`: 鍙傛暟楠岃瘉澶辫触
- `NOT_FOUND`: 璧勬簮涓嶅瓨鍦?
- `CONFLICT`: 璧勬簮鍐茬獊
- `INTERNAL_ERROR`: 鏈嶅姟鍣ㄥ唴閮ㄩ敊璇?

### HTTP鐘舵€佺爜

- `200`: 鎴愬姛
- `201`: 鍒涘缓鎴愬姛
- `400`: 璇锋眰閿欒
- `401`: 鏈璇?
- `403`: 鏉冮檺涓嶈冻
- `404`: 璧勬簮涓嶅瓨鍦?
- `409`: 璧勬簮鍐茬獊
- `500`: 鏈嶅姟鍣ㄩ敊璇?

## 瀹炴椂閫氫俊

### WebSocket杩炴帴

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// 鐩戝惉璁惧鐘舵€佸彉鍖?
socket.on('device-status-change', (data) => {
  console.log('璁惧鐘舵€佸彉鍖?', data);
});

// 鐩戝惉浼犳劅鍣ㄦ暟鎹?
socket.on('sensor-data', (data) => {
  console.log('浼犳劅鍣ㄦ暟鎹?', data);
});

// 鐩戝惉AI鍒嗘瀽缁撴灉
socket.on('analysis-result', (data) => {
  console.log('鍒嗘瀽缁撴灉:', data);
});
```

### 浜嬩欢绫诲瀷

- `device-status-change`: 璁惧鐘舵€佸彉鍖?
- `sensor-data`: 浼犳劅鍣ㄦ暟鎹洿鏂?
- `camera-control`: 鎽勫儚澶存帶鍒跺懡浠?
- `analysis-result`: AI鍒嗘瀽缁撴灉
- `alert`: 鍛婅閫氱煡

## 閫熺巼闄愬埗

API璇锋眰鍙楀埌閫熺巼闄愬埗锛岄粯璁ら檺鍒朵负锛?
- 姣忎釜IP姣忓垎閽熸渶澶?00涓姹?
- 璁よ瘉鎺ュ彛姣忓垎閽熸渶澶?0涓姹?

瓒呰繃闄愬埗鏃惰繑鍥?29鐘舵€佺爜銆?

## 鐗堟湰鎺у埗

API鐗堟湰閫氳繃URL璺緞鎺у埗锛?
- 褰撳墠鐗堟湰: `/api/v1/`
- 鏈潵鐗堟湰: `/api/v2/`

## 鏀寔

濡傛湁闂锛岃鑱旂郴锛?
- 閭: support@aicam.com
- 鏂囨。: https://docs.aicam.com
- 闂鍙嶉: https://github.com/aicam/issues 
