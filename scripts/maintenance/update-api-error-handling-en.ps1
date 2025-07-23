# API Error Handling Update Script
# Created on 2025-07-21

param (
    [switch]$Apply = $false
)

$rootPath = "D:\ailab\ailab"
$backupFolder = Join-Path $rootPath "backup-api-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$frontendPath = Join-Path $rootPath "src\frontend"
$servicesPath = Join-Path $frontendPath "src\services"
$utilsPath = Join-Path $frontendPath "src\utils"

# Confirm whether to apply changes
if (-not $Apply) {
    Write-Host "This script will update the API service class and error handling mechanism." -ForegroundColor Yellow
    Write-Host "It will create the following:" -ForegroundColor Yellow
    Write-Host "1. $utilsPath\errorHandler.ts - New error handling utility" -ForegroundColor Cyan
    Write-Host "2. $servicesPath\api.ts - Updated API service class" -ForegroundColor Cyan
    Write-Host "3. $servicesPath\device.service.ts - Updated device service class" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To apply the changes, run this script with the -Apply parameter." -ForegroundColor Yellow
    Write-Host "Example: .\update-api-error-handling-en.ps1 -Apply" -ForegroundColor Yellow
    exit
}

# Create backup
Write-Host "Creating backup folder: $backupFolder" -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

# Backup existing files
$apiFile = Join-Path $servicesPath "api.ts"
$deviceServiceFile = Join-Path $servicesPath "device.service.ts"

if (Test-Path $apiFile) {
    $apiBackupPath = Join-Path $backupFolder "api.ts"
    Copy-Item -Path $apiFile -Destination $apiBackupPath -Force
    Write-Host "Backed up: $apiFile -> $apiBackupPath" -ForegroundColor Green
}

if (Test-Path $deviceServiceFile) {
    $deviceServiceBackupPath = Join-Path $backupFolder "device.service.ts"
    Copy-Item -Path $deviceServiceFile -Destination $deviceServiceBackupPath -Force
    Write-Host "Backed up: $deviceServiceFile -> $deviceServiceBackupPath" -ForegroundColor Green
}

# Ensure utils directory exists
if (-not (Test-Path $utilsPath)) {
    New-Item -ItemType Directory -Force -Path $utilsPath | Out-Null
    Write-Host "Created utils directory: $utilsPath" -ForegroundColor Green
}

# Apply changes
$newApiFile = Join-Path $servicesPath "api.ts.new"
$newDeviceServiceFile = Join-Path $servicesPath "device.service.ts.new"
$errorHandlerFile = Join-Path $utilsPath "errorHandler.ts"

# Copy new files to destination
if (Test-Path $newApiFile) {
    Copy-Item -Path $newApiFile -Destination $apiFile -Force
    Remove-Item -Path $newApiFile -Force
    Write-Host "Updated API service class: $apiFile" -ForegroundColor Green
}

if (Test-Path $newDeviceServiceFile) {
    Copy-Item -Path $newDeviceServiceFile -Destination $deviceServiceFile -Force
    Remove-Item -Path $newDeviceServiceFile -Force
    Write-Host "Updated device service class: $deviceServiceFile" -ForegroundColor Green
}

# Create error handler utility
$errorHandlerContent = @'
/**
 * Unified Error Handling Utility
 * Provides a unified error handling mechanism for API calls
 */
import { message } from 'antd';

/**
 * Error type definition
 */
export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  data?: any;
}

/**
 * Error handler options
 */
interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  throwError?: boolean;
  context?: string;
}

/**
 * Default error handler options
 */
const defaultOptions: ErrorHandlerOptions = {
  showNotification: true,
  logToConsole: process.env.NODE_ENV !== 'production',
  throwError: false,
  context: '',
};

/**
 * Handle API errors
 * @param error The caught error object
 * @param options Error handling options
 * @returns Formatted error object
 */
export const handleApiError = (error: any, options: ErrorHandlerOptions = {}): ApiError => {
  const opts = { ...defaultOptions, ...options };

  // Format error object
  const apiError: ApiError = formatError(error);

  // Add context information
  if (opts.context) {
    apiError.message = `${opts.context}: ${apiError.message}`;
  }

  // Show notification
  if (opts.showNotification) {
    showErrorNotification(apiError);
  }

  // Log output
  if (opts.logToConsole) {
    // Only output detailed logs outside production environment
    console.error('[API Error]', apiError);
    if (error?.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  }

  // Whether to continue throwing error
  if (opts.throwError) {
    throw apiError;
  }

  return apiError;
};

/**
 * Format error object to unified format
 * @param error The caught error object
 * @returns Formatted error object
 */
const formatError = (error: any): ApiError => {
  // If it's an Axios error
  if (error?.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data?.message || `Request failed (${status})`,
      code: data?.code,
      data: data
    };
  }

  // If it's a network error
  if (error?.request) {
    return {
      status: 0,
      message: 'Network connection failed, please check your network connection',
      code: 'NETWORK_ERROR'
    };
  }

  // Other error types
  return {
    message: error?.message || 'Unknown error occurred',
    code: error?.code,
    data: error?.data
  };
};

/**
 * Show error notification
 * @param error API error object
 */
const showErrorNotification = (error: ApiError) => {
  // Customize message based on error status code
  let errorMessage = error.message;

  // Provide friendly messages for common HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        errorMessage = error.message || 'Request parameter error';
        break;
      case 401:
        errorMessage = 'User not logged in or session expired, please log in again';
        break;
      case 403:
        errorMessage = 'No operation permission';
        break;
      case 404:
        errorMessage = 'Requested resource does not exist';
        break;
      case 500:
        errorMessage = 'Internal server error, please try again later';
        break;
      default:
        if (error.status >= 500) {
          errorMessage = 'Server error, please contact administrator';
        } else if (error.status >= 400) {
          errorMessage = 'Request error, please check input';
        }
    }
  }

  // Use Ant Design's message component to display error
  message.error(errorMessage);
};

/**
 * Try to execute a function and handle possible errors
 * @param fn The async function to execute
 * @param errorOptions Error handling options
 * @returns Function execution result Promise
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
Write-Host "Created error handling utility: $errorHandlerFile" -ForegroundColor Green

Write-Host ""
Write-Host "All changes have been applied!" -ForegroundColor Green
Write-Host "Please check the following:" -ForegroundColor Yellow
Write-Host "1. Ensure the antd dependency package is installed (npm install antd)" -ForegroundColor Yellow
Write-Host "2. Update import paths to match new casing and naming conventions" -ForegroundColor Yellow
Write-Host "3. Ensure corresponding type definitions exist in the types directory" -ForegroundColor Yellow
Write-Host ""
Write-Host "To restore original files, backup is at: $backupFolder" -ForegroundColor Cyan
