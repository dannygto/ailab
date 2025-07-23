# 统一API和错误处理更新脚本
# 创建于2025-07-21

param (
    [switch]$Apply = $false
)

$rootPath = "D:\ailab\ailab"
$backupFolder = Join-Path $rootPath "backup-api-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$frontendPath = Join-Path $rootPath "src\frontend"
$servicesPath = Join-Path $frontendPath "src\services"
$utilsPath = Join-Path $frontendPath "src\utils"

# 确认是否应用更改
if (-not $Apply) {
    Write-Host "此脚本将更新API服务类和错误处理机制。" -ForegroundColor Yellow
    Write-Host "它将创建以下内容:" -ForegroundColor Yellow
    Write-Host "1. $utilsPath\errorHandler.ts - 新的错误处理工具" -ForegroundColor Cyan
    Write-Host "2. $servicesPath\api.ts - 更新后的API服务类" -ForegroundColor Cyan
    Write-Host "3. $servicesPath\device.service.ts - 更新后的设备服务类" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "要应用更改，请使用 -Apply 参数运行此脚本。" -ForegroundColor Yellow
    Write-Host "例如: .\update-api-error-handling.ps1 -Apply" -ForegroundColor Yellow
    exit
}

# 创建备份
Write-Host "创建备份文件夹: $backupFolder" -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

# 备份现有文件
$apiFile = Join-Path $servicesPath "api.ts"
$deviceServiceFile = Join-Path $servicesPath "device.service.ts"

if (Test-Path $apiFile) {
    $apiBackupPath = Join-Path $backupFolder "api.ts"
    Copy-Item -Path $apiFile -Destination $apiBackupPath -Force
    Write-Host "已备份: $apiFile -> $apiBackupPath" -ForegroundColor Green
}

if (Test-Path $deviceServiceFile) {
    $deviceServiceBackupPath = Join-Path $backupFolder "device.service.ts"
    Copy-Item -Path $deviceServiceFile -Destination $deviceServiceBackupPath -Force
    Write-Host "已备份: $deviceServiceFile -> $deviceServiceBackupPath" -ForegroundColor Green
}

# 确保工具目录存在
if (-not (Test-Path $utilsPath)) {
    New-Item -ItemType Directory -Force -Path $utilsPath | Out-Null
    Write-Host "已创建工具目录: $utilsPath" -ForegroundColor Green
}

# 应用更改
$newApiFile = Join-Path $servicesPath "api.ts.new"
$newDeviceServiceFile = Join-Path $servicesPath "device.service.ts.new"
$errorHandlerFile = Join-Path $utilsPath "errorHandler.ts"

# 复制新文件到目标位置
if (Test-Path $newApiFile) {
    Copy-Item -Path $newApiFile -Destination $apiFile -Force
    Remove-Item -Path $newApiFile -Force
    Write-Host "已更新API服务类: $apiFile" -ForegroundColor Green
}

if (Test-Path $newDeviceServiceFile) {
    Copy-Item -Path $newDeviceServiceFile -Destination $deviceServiceFile -Force
    Remove-Item -Path $newDeviceServiceFile -Force
    Write-Host "已更新设备服务类: $deviceServiceFile" -ForegroundColor Green
}

# 创建错误处理工具
$errorHandlerContent = @'
/**
 * 统一错误处理工具
 * 为API调用提供统一的错误处理机制
 */
import { message } from 'antd';

/**
 * 错误类型定义
 */
export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  data?: any;
}

/**
 * 错误处理选项
 */
interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  throwError?: boolean;
  context?: string;
}

/**
 * 默认错误处理选项
 */
const defaultOptions: ErrorHandlerOptions = {
  showNotification: true,
  logToConsole: process.env.NODE_ENV !== 'production',
  throwError: false,
  context: '',
};

/**
 * 处理API错误
 * @param error 捕获的错误对象
 * @param options 错误处理选项
 * @returns 格式化后的错误对象
 */
export const handleApiError = (error: any, options: ErrorHandlerOptions = {}): ApiError => {
  const opts = { ...defaultOptions, ...options };

  // 格式化错误对象
  const apiError: ApiError = formatError(error);

  // 添加上下文信息
  if (opts.context) {
    apiError.message = `${opts.context}: ${apiError.message}`;
  }

  // 显示通知
  if (opts.showNotification) {
    showErrorNotification(apiError);
  }

  // 日志输出
  if (opts.logToConsole) {
    // 在生产环境外才输出详细日志
    console.error('[API Error]', apiError);
    if (error?.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  }

  // 是否继续抛出错误
  if (opts.throwError) {
    throw apiError;
  }

  return apiError;
};

/**
 * 格式化错误对象为统一格式
 * @param error 捕获的错误对象
 * @returns 格式化后的错误对象
 */
const formatError = (error: any): ApiError => {
  // 如果是Axios错误
  if (error?.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data?.message || `请求失败 (${status})`,
      code: data?.code,
      data: data
    };
  }

  // 如果是网络错误
  if (error?.request) {
    return {
      status: 0,
      message: '网络连接失败，请检查您的网络连接',
      code: 'NETWORK_ERROR'
    };
  }

  // 其他错误类型
  return {
    message: error?.message || '发生未知错误',
    code: error?.code,
    data: error?.data
  };
};

/**
 * 显示错误通知
 * @param error API错误对象
 */
const showErrorNotification = (error: ApiError) => {
  // 根据错误状态码定制消息
  let errorMessage = error.message;

  // 针对常见HTTP错误提供友好消息
  if (error.status) {
    switch (error.status) {
      case 400:
        errorMessage = error.message || '请求参数错误';
        break;
      case 401:
        errorMessage = '用户未登录或会话已过期，请重新登录';
        break;
      case 403:
        errorMessage = '没有操作权限';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 500:
        errorMessage = '服务器内部错误，请稍后再试';
        break;
      default:
        if (error.status >= 500) {
          errorMessage = '服务器错误，请联系管理员';
        } else if (error.status >= 400) {
          errorMessage = '请求错误，请检查输入';
        }
    }
  }

  // 使用Ant Design的消息组件显示错误
  message.error(errorMessage);
};

/**
 * 尝试执行函数并处理可能的错误
 * @param fn 要执行的异步函数
 * @param errorOptions 错误处理选项
 * @returns 函数执行结果Promise
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorOptions: ErrorHandlerOptions = {}
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, errorOptions);
    return null;
  }
};
'@

Set-Content -Path $errorHandlerFile -Value $errorHandlerContent -Encoding UTF8
Write-Host "已创建错误处理工具: $errorHandlerFile" -ForegroundColor Green

Write-Host ""
Write-Host "所有更改已应用完成!" -ForegroundColor Green
Write-Host "请检查以下事项:" -ForegroundColor Yellow
Write-Host "1. 确保安装了antd依赖包 (npm install antd)" -ForegroundColor Yellow
Write-Host "2. 更新导入路径以匹配新的大小写和命名约定" -ForegroundColor Yellow
Write-Host "3. 在types目录中确保存在对应的类型定义" -ForegroundColor Yellow
Write-Host ""
Write-Host "如需恢复原始文件，备份在: $backupFolder" -ForegroundColor Cyan
