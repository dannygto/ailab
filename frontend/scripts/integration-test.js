// 整合测试脚本 - 验证第一阶段核心功能
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// 测试配置
const config = {
  frontendPort: 3001,
  backendPort: 3002,
  testTimeout: 60000, // 60秒超时
  componentsToTest: [
    'ExperimentCreate',
    'ExperimentList',
    'ExperimentDetail',
    'ResourceManagement',
    'DataCollectionAnalysis',
    'AdvancedDataAnalysis',
    'AIAssistant'
  ]
};

// 记录测试结果
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  startTime: Date.now(),
  endTime: null,
  details: []
};

// 测试助手函数
function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

function logSuccess(message) {
  console.log(`[SUCCESS] ${message}`);
}

function logError(message) {
  console.log(`[ERROR] ${message}`);
}

function logWarning(message) {
  console.log(`[WARNING] ${message}`);
}

// 执行命令并返回Promise
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    logInfo(`执行命令: ${command}`);
    
    const childProcess = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
    
    // 实时输出
    if (options.liveOutput) {
      childProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
      childProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    }
  });
}

// 验证TypeScript编译
async function testTypeScriptCompilation() {
  testResults.total++;
  
  try {
    logInfo('正在验证TypeScript编译...');
    const result = await execCommand('npx tsc --noEmit', { 
      liveOutput: false, 
      cwd: path.resolve(__dirname, '..')
    });
    
    // 检查是否有错误
    if (result.stderr && result.stderr.includes('error')) {
      throw new Error('TypeScript编译失败');
    }
    
    logSuccess('TypeScript编译验证通过');
    testResults.passed++;
    testResults.details.push({
      name: 'TypeScript编译',
      status: 'passed',
      duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
    });
    
    return true;
  } catch (error) {
    logError(`TypeScript编译验证失败: ${error.message || error}`);
    if (error.stdout) logError(error.stdout);
    if (error.stderr) logError(error.stderr);
    
    testResults.failed++;
    testResults.details.push({
      name: 'TypeScript编译',
      status: 'failed',
      error: error.message || String(error),
      duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
    });
    
    return false;
  }
}

// 验证组件测试
async function runComponentTests() {
  for (const component of config.componentsToTest) {
    testResults.total++;
    
    try {
      logInfo(`正在测试组件: ${component}...`);
      const testFile = `__tests__/${component}.test.tsx`;
      
      // 检查测试文件是否存在
      if (!fs.existsSync(path.resolve(__dirname, '..', testFile))) {
        logWarning(`测试文件 ${testFile} 不存在，跳过测试`);
        testResults.skipped++;
        testResults.details.push({
          name: `组件测试: ${component}`,
          status: 'skipped',
          reason: '测试文件不存在'
        });
        continue;
      }
      
      // 运行测试
      const result = await execCommand(`npx jest ${testFile} --verbose`, {
        liveOutput: true,
        cwd: path.resolve(__dirname, '..')
      });
      
      if (result.stderr && result.stderr.includes('FAIL')) {
        throw new Error(`${component} 测试失败`);
      }
      
      logSuccess(`组件 ${component} 测试通过`);
      testResults.passed++;
      testResults.details.push({
        name: `组件测试: ${component}`,
        status: 'passed',
        duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
      });
    } catch (error) {
      logError(`组件 ${component} 测试失败: ${error.message || error}`);
      testResults.failed++;
      testResults.details.push({
        name: `组件测试: ${component}`,
        status: 'failed',
        error: error.message || String(error),
        duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
      });
    }
  }
}

// 验证端到端功能
async function testEndToEndFunctions() {
  const e2eFunctions = [
    { name: '健康检查API', command: 'curl http://localhost:3002/api/health' },
    { name: '资源API', command: 'curl http://localhost:3002/api/resources' },
    { name: '实验类型API', command: 'curl http://localhost:3002/api/experiment-types' }
  ];
  
  for (const func of e2eFunctions) {
    testResults.total++;
    
    try {
      logInfo(`正在测试端到端功能: ${func.name}...`);
      const result = await execCommand(func.command);
      
      // 简单验证结果
      if (!result.stdout || result.stdout.includes('error') || result.stdout.includes('Error')) {
        throw new Error(`${func.name} 测试失败: 响应异常`);
      }
      
      logSuccess(`端到端功能 ${func.name} 测试通过`);
      testResults.passed++;
      testResults.details.push({
        name: `端到端功能: ${func.name}`,
        status: 'passed',
        duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
      });
    } catch (error) {
      logError(`端到端功能 ${func.name} 测试失败: ${error.message || error}`);
      testResults.failed++;
      testResults.details.push({
        name: `端到端功能: ${func.name}`,
        status: 'failed',
        error: error.message || String(error),
        duration: `${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`
      });
    }
  }
}

// 生成测试报告
function generateTestReport() {
  testResults.endTime = Date.now();
  const totalDuration = ((testResults.endTime - testResults.startTime) / 1000).toFixed(2);
  
  const report = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      duration: `${totalDuration}s`,
      timestamp: new Date().toISOString()
    },
    details: testResults.details
  };
    // 输出摘要
  console.log('\n' + '='.repeat(50));
  console.log('测试摘要:');
  console.log(`总测试数: ${report.summary.total}`);
  console.log(`通过: ${report.summary.passed}`);
  console.log(`失败: ${report.summary.failed}`);
  console.log(`跳过: ${report.summary.skipped}`);
  console.log(`总耗时: ${report.summary.duration}`);
  console.log('='.repeat(50) + '\n');
  
  // 将报告写入文件
  const reportPath = path.resolve(__dirname, '../test-reports');
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }
  
  const reportFile = path.join(reportPath, `integration-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  logInfo(`测试报告已保存到: ${reportFile}`);
}

// 主函数
async function runTests() {
  try {
    logInfo('开始运行整合测试...');
    
    // 1. 验证TypeScript编译
    const tsCompiled = await testTypeScriptCompilation();
    
    // 2. 运行组件测试
    await runComponentTests();
    
    // 3. 验证端到端功能
    await testEndToEndFunctions();
    
    // 4. 生成测试报告
    generateTestReport();
    
    // 返回测试是否全部通过
    return testResults.failed === 0;
  } catch (error) {
    logError(`测试过程中发生未处理错误: ${error.message || error}`);
    return false;
  }
}

// 执行测试
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
