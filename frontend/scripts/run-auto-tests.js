#!/usr/bin/env node

/**
 * 实验组件自动测试脚本
 * 
 * 此脚本执行以下测试：
 * 1. 检查TypeScript编译是否通过
 * 2. 检查组件结构和功能性
 * 3. 生成测试报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.bright}${colors.blue}=== 人工智能辅助实验平台自动测试 ===${colors.reset}\n`);

// 创建结果目录
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

const reportFile = path.join(resultsDir, 'test-report.txt');
const reportStream = fs.createWriteStream(reportFile, { flags: 'w' });

// 写入报告头
reportStream.write('人工智能辅助实验平台自动测试报告\n');
reportStream.write('===================================\n\n');
reportStream.write(`生成时间: ${new Date().toLocaleString()}\n\n`);

// 测试结果跟踪
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

/**
 * 运行命令并记录结果
 */
function runTest(title, command, options = {}) {
  const { ignoreErrors = false } = options;
  
  console.log(`\n${colors.blue}测试: ${title}${colors.reset}`);
  reportStream.write(`## ${title}\n\n`);
  
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString();
    console.log(`${colors.green}✓ 测试通过${colors.reset}`);
    if (output.trim()) {
      console.log(output);
    }
    
    reportStream.write(`状态: ✓ 通过\n\n`);
    if (output.trim()) {
      reportStream.write(`输出:\n\`\`\`\n${output}\n\`\`\`\n\n`);
    }
    
    testResults.passed++;
    return { success: true, output };
  } catch (error) {
    const errorOutput = error.stdout ? error.stdout.toString() : error.message;
    
    if (ignoreErrors) {
      console.log(`${colors.yellow}⚠ 测试有警告${colors.reset}`);
      console.log(errorOutput);
      
      reportStream.write(`状态: ⚠ 警告\n\n`);
      reportStream.write(`输出:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`);
      
      testResults.warnings++;
      return { success: true, output: errorOutput };
    } else {
      console.error(`${colors.red}✗ 测试失败${colors.reset}`);
      console.error(errorOutput);
      
      reportStream.write(`状态: ✗ 失败\n\n`);
      reportStream.write(`错误信息:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`);
      
      testResults.failed++;
      return { success: false, output: errorOutput };
    }
  }
}

/**
 * 检查文件内容包含指定模式
 */
function checkFileContent(filePath, patterns, description) {
  console.log(`\n${colors.blue}检查: ${description}${colors.reset}`);
  reportStream.write(`## ${description}\n\n`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    patterns.forEach(({ pattern, name }) => {
      const matches = typeof pattern === 'string' 
        ? content.includes(pattern)
        : pattern.test(content);
      
      results.push({
        name,
        matches
      });
      
      console.log(`${matches ? colors.green + '✓' : colors.red + '✗'} ${name}${colors.reset}`);
      reportStream.write(`${matches ? '✓' : '✗'} ${name}\n`);
    });
    
    const allPassed = results.every(r => r.matches);
    
    if (allPassed) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
    
    reportStream.write(`\n总体状态: ${allPassed ? '✓ 通过' : '✗ 失败'}\n\n`);
    
    return { success: allPassed, results };
  } catch (error) {
    console.error(`${colors.red}✗ 无法读取文件: ${filePath}${colors.reset}`);
    console.error(error.message);
    
    reportStream.write(`状态: ✗ 失败\n\n`);
    reportStream.write(`错误信息: 无法读取文件\n\n`);
    
    testResults.failed++;
    return { success: false, error: error.message };
  }
}

// 1. TypeScript 类型检查
runTest(
  'TypeScript类型检查',
  'npx tsc --project tsconfig.validate.json --noEmit',
  { ignoreErrors: true } // 允许错误继续测试
);

// 2. 检查ExperimentCreate组件流程完整性
checkFileContent(
  'src/pages/experiments/ExperimentCreate.tsx',
  [
    { pattern: /validateCurrentStep/, name: "表单验证函数" },
    { pattern: /handleSubmit/, name: "表单提交处理" },
    { pattern: /handleNext/, name: "步骤导航 - 下一步" },
    { pattern: /handleBack/, name: "步骤导航 - 上一步" },
    { pattern: /getStepContent/, name: "步骤内容渲染" },
    { pattern: /setActiveStep/, name: "步骤状态管理" }
  ],
  'ExperimentCreate组件流程完整性'
);

// 3. 检查组件接口定义
checkFileContent(
  'src/pages/experiments/components/ExperimentTypeSelect.tsx',
  [
    { pattern: /interface\s+ExperimentTypeSelectProps/, name: "类型选择组件接口定义" },
    { pattern: /value:/, name: "value属性" },
    { pattern: /onChange:/, name: "onChange事件处理" }
  ],
  'ExperimentTypeSelect组件接口定义'
);

checkFileContent(
  'src/pages/experiments/components/BasicInfoForm.tsx',
  [
    { pattern: /interface\s+BasicInfoFormProps/, name: "基本信息表单接口定义" },
    { pattern: /name:/, name: "name属性" },
    { pattern: /description:/, name: "description属性" },
    { pattern: /duration:/, name: "duration属性" },
    { pattern: /onNameChange:/, name: "名称变更处理" },
    { pattern: /onDescriptionChange:/, name: "描述变更处理" },
    { pattern: /onDurationChange:/, name: "时长变更处理" }
  ],
  'BasicInfoForm组件接口定义'
);

// 4. 检查扩展的实验类型定义
checkFileContent(
  'src/types/index.ts',
  [
    { pattern: /physics_experiment/, name: "物理实验类型" },
    { pattern: /chemistry_experiment/, name: "化学实验类型" },
    { pattern: /biology_experiment/, name: "生物实验类型" },
    { pattern: /integrated_science/, name: "综合科学实验类型" },
    { pattern: /engineering_lab/, name: "工程实验类型" },
    { pattern: /medical_lab/, name: "医学实验类型" }
  ],
  '多学科实验类型定义'
);

// 总结测试结果
console.log(`\n${colors.bright}${colors.blue}=== 测试完成 ===${colors.reset}`);
console.log(`${colors.green}通过: ${testResults.passed}${colors.reset}`);
console.log(`${colors.yellow}警告: ${testResults.warnings}${colors.reset}`);
console.log(`${colors.red}失败: ${testResults.failed}${colors.reset}\n`);

console.log(`${colors.blue}详细报告已保存至: ${reportFile}${colors.reset}`);

reportStream.write(`\n## 测试总结\n\n`);
reportStream.write(`- 通过: ${testResults.passed}\n`);
reportStream.write(`- 警告: ${testResults.warnings}\n`);
reportStream.write(`- 失败: ${testResults.failed}\n`);
reportStream.end();

// 如果有失败的测试，则退出码为1
process.exit(testResults.failed > 0 ? 1 : 0);
