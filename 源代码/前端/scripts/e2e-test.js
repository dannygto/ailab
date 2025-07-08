// 端到端测试脚本
const fetch = require('node-fetch');
const path = require('path');

// 测试配置
const config = {
  backendUrl: 'http://localhost:3002',
  frontendUrl: 'http://localhost:3001',
  testTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000
};

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 测试结果统计
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: Date.now(),
  details: []
};

// 工具函数
function logInfo(message) {
  console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

// HTTP请求工具
async function makeRequest(url, options = {}) {
  const defaultOptions = {
    timeout: config.testTimeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'AICAM-E2E-Test/1.0.0'
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    return { 
      ok: response.ok, 
      status: response.status, 
      data 
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// 等待服务启动
async function waitForService(url, serviceName, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await makeRequest(`${url}/api/health`);
      if (response.ok) {
        logSuccess(`${serviceName} is ready`);
        return true;
      }
    } catch (error) {
      logInfo(`Waiting for ${serviceName}... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
  throw new Error(`${serviceName} failed to start within timeout`);
}

// 测试用例定义
const testCases = [
  {
    name: '后端健康检查',
    test: async () => {
      const response = await makeRequest(`${config.backendUrl}/api/health`);
      if (!response.ok || response.data.status !== 'healthy') {
        throw new Error('Backend health check failed');
      }
      return '后端服务健康状态正常';
    }
  },
  {
    name: '实验模板API测试',
    test: async () => {
      // 获取模板列表
      const listResponse = await makeRequest(`${config.backendUrl}/api/templates`);
      if (!listResponse.ok) {
        throw new Error('Failed to fetch templates');
      }

      // 创建测试模板
      const createData = {
        name: 'E2E测试模板',
        subject: '物理',
        grade: 'middle',
        difficulty: 'beginner',
        duration: 60,
        description: '端到端测试用模板'
      };

      const createResponse = await makeRequest(`${config.backendUrl}/api/templates`, {
        method: 'POST',
        body: JSON.stringify(createData)
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create template');
      }

      return '实验模板API功能正常';
    }
  },
  {
    name: '设备管理API测试',
    test: async () => {
      // 获取设备列表
      const response = await makeRequest(`${config.backendUrl}/api/devices`);
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      return '设备管理API功能正常';
    }
  },
  {
    name: 'AI助手API测试',
    test: async () => {
      // 测试AI模型列表
      const modelsResponse = await makeRequest(`${config.backendUrl}/api/ai/models`);
      if (!modelsResponse.ok) {
        throw new Error('Failed to fetch AI models');
      }

      // 测试AI健康检查
      const healthResponse = await makeRequest(`${config.backendUrl}/api/ai/health`);
      if (!healthResponse.ok) {
        throw new Error('AI service health check failed');
      }

      return 'AI助手API功能正常';
    }
  },
  {
    name: '数据分析API测试',
    test: async () => {
      // 测试数据源列表
      const response = await makeRequest(`${config.backendUrl}/api/data-sources`);
      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }

      return '数据分析API功能正常';
    }
  },
  {
    name: '用户认证流程测试',
    test: async () => {
      // 测试游客访问
      const guestResponse = await makeRequest(`${config.backendUrl}/api/guest/access`);
      if (!guestResponse.ok) {
        throw new Error('Guest access failed');
      }

      return '用户认证流程正常';
    }
  }
];

// 运行单个测试
async function runTest(testCase) {
  testResults.total++;
  const startTime = Date.now();

  try {
    logInfo(`正在执行测试: ${testCase.name}`);
    const result = await testCase.test();
    const duration = Date.now() - startTime;
    
    testResults.passed++;
    testResults.details.push({
      name: testCase.name,
      status: 'passed',
      duration: `${duration}ms`,
      message: result
    });
    
    logSuccess(`✓ ${testCase.name} - ${result}`);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    testResults.failed++;
    testResults.details.push({
      name: testCase.name,
      status: 'failed',
      duration: `${duration}ms`,
      error: error.message
    });
    
    logError(`✗ ${testCase.name} - ${error.message}`);
  }
}

// 生成测试报告
function generateReport() {
  const totalDuration = Date.now() - testResults.startTime;
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  console.log(`\n${colors.bright}${colors.cyan}=== 端到端测试报告 ===${colors.reset}`);
  console.log(`${colors.cyan}执行时间: ${new Date().toLocaleString()}${colors.reset}`);
  console.log(`${colors.cyan}总耗时: ${totalDuration}ms${colors.reset}`);
  console.log(`${colors.cyan}成功率: ${successRate}%${colors.reset}\n`);

  console.log(`${colors.bright}测试结果统计:${colors.reset}`);
  console.log(`  总测试数: ${testResults.total}`);
  console.log(`  ${colors.green}通过: ${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}失败: ${testResults.failed}${colors.reset}\n`);

  if (testResults.details.length > 0) {
    console.log(`${colors.bright}详细结果:${colors.reset}`);
    testResults.details.forEach(detail => {
      const statusIcon = detail.status === 'passed' ? '✓' : '✗';
      const statusColor = detail.status === 'passed' ? colors.green : colors.red;
      
      console.log(`  ${statusColor}${statusIcon} ${detail.name}${colors.reset} (${detail.duration})`);
      if (detail.message) {
        console.log(`    ${detail.message}`);
      }
      if (detail.error) {
        console.log(`    ${colors.red}错误: ${detail.error}${colors.reset}`);
      }
    });
  }

  // 保存JSON报告
  const reportPath = path.join(__dirname, '../test-reports');
  const fs = require('fs');
  
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const reportFile = path.join(reportPath, `e2e-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  const reportData = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      duration: totalDuration,
      timestamp: new Date().toISOString()
    },
    details: testResults.details
  };

  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  logInfo(`测试报告已保存: ${reportFile}`);
}

// 主测试函数
async function runE2ETests() {
  console.log(`${colors.bright}${colors.blue}=== AICAM平台端到端测试 ===${colors.reset}\n`);
  
  try {
    // 等待后端服务启动
    logInfo('检查后端服务状态...');
    await waitForService(config.backendUrl, '后端服务');

    // 运行所有测试用例
    logInfo('开始执行端到端测试...\n');
    for (const testCase of testCases) {
      await runTest(testCase);
      // 测试间隔，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 生成报告
    generateReport();

    // 返回测试结果
    return testResults.failed === 0;

  } catch (error) {
    logError(`测试执行异常: ${error.message}`);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runE2ETests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runE2ETests, testCases };
