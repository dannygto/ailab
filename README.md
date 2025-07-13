# AILAB 平台

## 项目概述

AILAB是一个全面的AI实验教学平台，为K12教育提供丰富的AI实验资源和工具。平台支持多种教学场景，帮助学生通过实践掌握AI基础知识和应用技能。

## 技术架构

- **前端**: React + TypeScript
- **后端**: Node.js + Express
- **AI服务**: Python + FastAPI
- **数据库**: MongoDB
- **缓存**: Redis

## 目录结构

```
ailab/
├── src/                  # 源代码
│   ├── frontend/        # 前端代码 (React)
│   ├── backend/         # 后端代码 (Node.js)
│   └── ai-service/      # AI服务代码 (Python)
├── docs/                # 项目文档
├── scripts/             # 部署和管理脚本
├── docker/              # Docker配置
├── config/              # 配置文件
├── tests/               # 测试文件
└── README.md            # 项目说明
```

## 快速开始

### Windows开发环境
```powershell
# 启动开发环境
.\start-platform.ps1
```

### Linux生产环境
```bash
# 运行部署脚本
./scripts/deployment/deploy-to-linux.sh

# 启动服务
./start-ailab.sh
```

### Docker部署
```bash
# 使用Docker Compose
cd docker
docker-compose up -d
```

## 服务端口

- **前端**: http://localhost:3000
- **后端API**: http://localhost:3001
- **AI服务**: http://localhost:8001
- **监控服务**: http://localhost:3002

## 文档

详细文档请参考:

- [部署指南](docs/03-部署指南/) - 完整的部署说明
- [开发文档](docs/02-开发文档/) - 开发相关指南
- [API文档](docs/04-API参考/) - API接口文档
- [项目管理](docs/05-项目管理/) - 项目管理信息

## 许可证

[MIT License](LICENSE)

---

**版本**: 3.1.0  
**最后更新**: 2025年7月12日
