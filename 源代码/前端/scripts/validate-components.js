#!/usr/bin/env node

/**
 * 组件类型检查测试脚本
 * 
 * 此脚本会运行TypeScript检查，确保所有组件类型正确
 * 它会生成一个报告，显示任何类型错误
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.bright}${colors.blue}=== 人工智能辅助实验平台组件验证 ===${colors.reset}\n`);
console.log(`${colors.blue}开始验证组件类型正确性...${colors.reset}\n`);

// 定义要检查的组件文件
const componentsToCheck = [
  'src/pages/experiments/ExperimentCreate.tsx',
  'src/pages/experiments/components/ExperimentTypeSelect.tsx',
  'src/pages/experiments/components/ExperimentMethodSelect.tsx',
  'src/pages/experiments/components/ExperimentResourceSelect.tsx',
  'src/pages/experiments/components/AIAssistanceSelect.tsx',
  'src/pages/experiments/components/BasicInfoForm.tsx',
];

// 创建结果目录
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

const reportFile = path.join(resultsDir, 'component-validation-report.txt');
const reportStream = fs.createWriteStream(reportFile, { flags: 'w' });

// 写入报告头
reportStream.write('人工智能辅助实验平台组件验证报告\n');
reportStream.write('===================================\n\n');
reportStream.write(`生成时间: ${new Date().toLocaleString()}\n\n`);

// 类型检查单个文件
function checkFile(filePath) {
  console.log(`${colors.yellow}检查文件: ${filePath}${colors.reset}`);
  reportStream.write(`## 检查文件: ${filePath}\n\n`);
    try {
    // 运行 TypeScript 编译器检查单个文件，使用我们的验证配置
    const command = `npx tsc --project tsconfig.validate.json --noEmit --skipLibCheck ${filePath}`;
    execSync(command, { stdio: 'pipe' });
    
    console.log(`${colors.green}✓ 文件通过类型检查${colors.reset}`);
    reportStream.write(`状态: ✓ 通过\n\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ 文件存在类型错误${colors.reset}`);
    console.error(error.stdout ? error.stdout.toString() : error.message);
    
    reportStream.write(`状态: ✗ 失败\n\n`);
    reportStream.write(`错误信息:\n\`\`\`\n${error.stdout ? error.stdout.toString() : error.message}\n\`\`\`\n\n`);
    return false;
  }
}

// 检查组件接口一致性
function checkInterfaceConsistency() {
  console.log(`\n${colors.blue}检查组件接口一致性...${colors.reset}`);
  reportStream.write(`## 组件接口一致性检查\n\n`);
  
  // 在这里我们可以添加额外的检查，确保组件接口一致
  // 比如，ExperimentCreate组件与其子组件之间的props传递是否正确
  
  reportStream.write(`未执行接口一致性检查 - 这需要更复杂的静态分析\n\n`);
}

// 检查实验创建流程完整性
function checkExperimentCreateFlow() {
  console.log(`\n${colors.blue}检查实验创建流程完整性...${colors.reset}`);
  reportStream.write(`## 实验创建流程完整性检查\n\n`);
  
  // 在这里我们可以添加对ExperimentCreate组件的流程检查
  // 检查各个步骤是否完整，表单验证是否正确等
  
  // 简单检查文件内容
  const content = fs.readFileSync('src/pages/experiments/ExperimentCreate.tsx', 'utf8');
  
  const checks = [
    { test: /validateCurrentStep/, message: "表单验证函数" },
    { test: /handleSubmit/, message: "表单提交处理" },
    { test: /handleNext/, message: "步骤导航 - 下一步" },
    { test: /handleBack/, message: "步骤导航 - 上一步" },
    { test: /getStepContent/, message: "步骤内容渲染" },
    { test: /setActiveStep/, message: "步骤状态管理" }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const passed = check.test.test(content);
    console.log(`${passed ? colors.green + '✓' : colors.red + '✗'} ${check.message}${colors.reset}`);
    reportStream.write(`${passed ? '✓' : '✗'} ${check.message}\n`);
    allPassed = allPassed && passed;
  });
  
  reportStream.write(`\n总体状态: ${allPassed ? '✓ 通过' : '✗ 失败'}\n\n`);
  
  return allPassed;
}

// 运行所有文件的类型检查
let allPassed = true;
componentsToCheck.forEach(component => {
  const passed = checkFile(component);
  allPassed = allPassed && passed;
  console.log(''); // 添加空行分隔
});

// 运行接口一致性和流程完整性检查
checkInterfaceConsistency();
const flowPassed = checkExperimentCreateFlow();
allPassed = allPassed && flowPassed;

// 总结
console.log(`\n${colors.bright}${colors.blue}=== 验证完成 ===${colors.reset}`);
console.log(`${allPassed ? colors.green + '✓ 所有检查通过' : colors.red + '✗ 存在失败的检查'}\n${colors.reset}`);
console.log(`${colors.blue}详细报告已保存至: ${reportFile}${colors.reset}`);

reportStream.write(`\n## 总结\n\n`);
reportStream.write(`${allPassed ? '✓ 所有检查通过' : '✗ 存在失败的检查'}\n`);
reportStream.end();

// 退出码表示测试结果
process.exit(allPassed ? 0 : 1);
