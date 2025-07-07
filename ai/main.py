from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import redis.asyncio as redis
from motor.motor_asyncio import AsyncIOMotorClient
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# 导入路由
from routes import analysis, models, health
from core.config import settings
from core.database import init_database, close_database
from core.redis_client import init_redis, close_redis
from core.logger import logger

# 加载环境变量
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("启动AI服务...")
    
    # 初始化数据库连接
    await init_database()
    logger.info("数据库连接初始化完成")
    
    # 初始化Redis连接
    await init_redis()
    logger.info("Redis连接初始化完成")
    
    yield
    
    # 关闭时执行
    logger.info("关闭AI服务...")
    await close_database()
    await close_redis()

# 创建FastAPI应用
app = FastAPI(
    title="AICAM AI服务",
    description="AICAM智能监控系统AI分析与决策服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# 注册路由
app.include_router(health.router, prefix="/health", tags=["健康检查"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["AI分析"])
app.include_router(models.router, prefix="/api/models", tags=["模型管理"])

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "AICAM AI服务运行中",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/info")
async def info():
    """服务信息"""
    return {
        "service": "AICAM AI Service",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "features": [
            "图像分析",
            "传感器数据分析",
            "作物健康检测",
            "环境监测",
            "预测分析"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 