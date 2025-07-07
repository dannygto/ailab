// 新增API路由测试脚本
// 测试实验模板库、智能指导系统和仪器设备远程接入系统的API

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const baseUrl = 'http://localhost:3002';

// 彩色输出函数
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 打印结果
function printResult(test, success, message, data = null) {
  const color = success ? colors.green : colors.red;
  const status = success ? 'PASS' : 'FAIL';
  console.log(`${color}[${status}]${colors.reset} ${test}: ${message}`);
  if (data && !success) {
    console.log(`${colors.yellow}Response:${colors.reset}`, data);
  }
}

// 测试执行函数
async function runTest(test, url, method = 'GET', body = null) {
  try {
    console.log(`${colors.blue}Testing${colors.reset} ${method} ${url}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(baseUrl + url, options);
    const data = await response.json();
    
    // 健康检查API有特殊格式
    if (url === '/api/health' && data.status === 'healthy') {
      printResult(test, true, 'Health check successful');
      return data;
    }
    
    if (response.ok && (data.success || data.status === 'healthy')) {
      printResult(test, true, 'Request successful');
      return data;
    } else {
      printResult(test, false, `Request failed with status ${response.status}`, data);
      return null;
    }
  } catch (error) {
    printResult(test, false, `Error: ${error.message}`);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log(`${colors.magenta}===== 人工智能辅助实验平台 API 测试 =====${colors.reset}`);
  console.log(`${colors.cyan}测试时间: ${new Date().toLocaleString()}${colors.reset}`);
  console.log('');
  
  // 测试健康检查
  await runTest('Health Check', '/api/health');
  
  // 测试实验模板库API
  console.log(`\n${colors.magenta}===== 实验模板库API测试 =====${colors.reset}`);
  const templatesResponse = await runTest('Get Templates', '/api/templates');
  
  if (templatesResponse && templatesResponse.data && templatesResponse.data.data.length > 0) {
    const templateId = templatesResponse.data.data[0].id;
    await runTest('Get Template Detail', `/api/templates/${templateId}`);
  }
  
  await runTest('Create Template', '/api/templates', 'POST', {
    name: '测试实验模板',
    description: '这是一个API测试创建的实验模板',
    subject: '综合',
    grade: 'middle',
    difficulty: 'beginner',
    duration: 30,
    tags: ['测试', 'API', '自动化']
  });
  
  // 测试智能指导系统API
  console.log(`\n${colors.magenta}===== 智能指导系统API测试 =====${colors.reset}`);
  const suggestionsResponse = await runTest('Get Guidance Suggestions', '/api/guidance/suggestions');
  
  await runTest('Generate AI Guidance', '/api/guidance/generate', 'POST', {
    experimentType: '物理实验',
    currentStage: '数据收集',
    learningStatus: 'progressing',
    context: '正在测量不同物体的密度，但结果有些偏差'
  });
  
  // 测试仪器设备远程接入系统API
  console.log(`\n${colors.magenta}===== 仪器设备远程接入系统API测试 =====${colors.reset}`);
  const devicesResponse = await runTest('Get Devices', '/api/devices');
  
  if (devicesResponse && devicesResponse.data && devicesResponse.data.data.length > 0) {
    const deviceId = devicesResponse.data.data[0].id;
    await runTest('Get Device Detail', `/api/devices/${deviceId}`);
    
    await runTest('Send Command', `/api/devices/${deviceId}/commands`, 'POST', {
      command: 'test',
      parameters: {
        action: 'ping'
      }
    });
  }
  
  console.log(`\n${colors.magenta}===== 测试完成 =====${colors.reset}`);
}

// 运行测试
runTests().catch(error => {
  console.error(`${colors.red}Test error:${colors.reset}`, error);
});
