#!/usr/bin/env node

/**
 * 自动化测试脚本
 * 提升测试覆盖率，确保代码质量
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  coverageThreshold: 80, // 覆盖率阈值
  testTimeout: 30000, // 测试超时时间
  maxWorkers: 4, // 最大工作进程数
  verbose: true, // 详细输出
  collectCoverage: true, // 收集覆盖率
  coverageReporters: ['text', 'lcov', 'html'], // 覆盖率报告格式
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{test,spec}.{js,jsx,ts,tsx}'
  ]
};

// 测试文件列表
const TEST_FILES = [
  'src/utils/icons.test.ts',
  'src/components/common/BatchOperations.test.tsx',
  'src/components/alerts/AlertManagement.test.tsx',
  'src/components/devices/DeviceMonitor.test.tsx',
  'src/components/experiments/ExperimentList.test.tsx',
  'src/pages/Dashboard.test.tsx',
  'src/services/api.test.ts',
  'src/utils/experimentUtils.test.ts'
];

// 运行单个测试文件
function runTestFile(testFile) {
  console.log(`🧪 运行测试: ${testFile}`);
  
  try {
    const command = `npm test -- ${testFile} --passWithNoTests --coverage --watchAll=false`;
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: TEST_CONFIG.testTimeout,
      stdio: 'pipe'
    });
    
    console.log(`✅ ${testFile} 测试通过`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${testFile} 测试失败`);
    console.log(error.stdout || error.message);
    return { success: false, error: error.message };
  }
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始运行自动化测试...');
  console.log(`📊 覆盖率阈值: ${TEST_CONFIG.coverageThreshold}%`);
  console.log(`⏱️  测试超时: ${TEST_CONFIG.testTimeout}ms`);
  console.log(`👥 最大进程: ${TEST_CONFIG.maxWorkers}`);
  
  const results = [];
  let passedCount = 0;
  let failedCount = 0;
  
  // 运行每个测试文件
  for (const testFile of TEST_FILES) {
    const result = runTestFile(testFile);
    results.push({ file: testFile, ...result });
    
    if (result.success) {
      passedCount++;
    } else {
      failedCount++;
    }
  }
  
  // 生成测试报告
  generateTestReport(results, passedCount, failedCount);
  
  return { passedCount, failedCount, results };
}

// 生成测试报告
function generateTestReport(results, passedCount, failedCount) {
  console.log('\n📋 测试报告');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${passedCount}`);
  console.log(`❌ 失败: ${failedCount}`);
  console.log(`📊 成功率: ${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`);
  
  console.log('\n📝 详细结果:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.file}`);
  });
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, '../test-reports/test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: passedCount + failedCount,
      passed: passedCount,
      failed: failedCount,
      successRate: ((passedCount / (passedCount + failedCount)) * 100).toFixed(1)
    },
    results: results,
    config: TEST_CONFIG
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存到: ${reportPath}`);
}

// 检查覆盖率
function checkCoverage() {
  console.log('\n📊 检查测试覆盖率...');
  
  try {
    const coverageCommand = 'npm test -- --coverage --watchAll=false --passWithNoTests';
    const result = execSync(coverageCommand, { 
      encoding: 'utf8',
      timeout: TEST_CONFIG.testTimeout * 2,
      stdio: 'pipe'
    });
    
    // 解析覆盖率结果
    const coverageMatch = result.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1]);
      console.log(`📈 当前覆盖率: ${coverage}%`);
      
      if (coverage >= TEST_CONFIG.coverageThreshold) {
        console.log(`✅ 覆盖率达标 (≥${TEST_CONFIG.coverageThreshold}%)`);
        return true;
      } else {
        console.log(`⚠️  覆盖率未达标 (<${TEST_CONFIG.coverageThreshold}%)`);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.log('❌ 覆盖率检查失败');
    console.log(error.stdout || error.message);
    return false;
  }
}

// 创建测试文件模板
function createTestTemplate(componentPath) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const testPath = componentPath.replace(/\.(tsx?|jsx?)$/, '.test.$1');
  
  if (fs.existsSync(testPath)) {
    console.log(`⚠️  测试文件已存在: ${testPath}`);
    return;
  }
  
  const testTemplate = `/**
 * ${componentName} 组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ${componentName} from './${componentName}';

// 创建测试主题
const theme = createTheme();

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('${componentName}', () => {
  const defaultProps = {
    // 在这里添加默认属性
  };

  beforeEach(() => {
    // 测试前的设置
  });

  afterEach(() => {
    // 测试后的清理
  });

  it('应该正确渲染组件', () => {
    render(
      <TestWrapper>
        <${componentName} {...defaultProps} />
      </TestWrapper>
    );
    
    // 添加断言
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });

  it('应该处理用户交互', () => {
    render(
      <TestWrapper>
        <${componentName} {...defaultProps} />
      </TestWrapper>
    );
    
    // 添加交互测试
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // 添加断言
    expect(button).toBeInTheDocument();
  });

  it('应该处理异步操作', async () => {
    render(
      <TestWrapper>
        <${componentName} {...defaultProps} />
      </TestWrapper>
    );
    
    // 添加异步测试
    await waitFor(() => {
      expect(screen.getByText('加载完成')).toBeInTheDocument();
    });
  });

  it('应该处理错误状态', () => {
    render(
      <TestWrapper>
        <${componentName} {...defaultProps} error="测试错误" />
      </TestWrapper>
    );
    
    // 添加错误状态测试
    expect(screen.getByText('测试错误')).toBeInTheDocument();
  });
});
`;

  fs.writeFileSync(testPath, testTemplate);
  console.log(`✅ 创建测试文件: ${testPath}`);
}

// 查找需要测试的组件
function findComponentsToTest() {
  const srcPath = path.join(__dirname, '../src');
  const components = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.match(/\.(tsx?|jsx?)$/) && !file.includes('.test.') && !file.includes('.spec.')) {
        const relativePath = path.relative(srcPath, filePath);
        components.push(relativePath);
      }
    }
  }
  
  scanDirectory(srcPath);
  return components;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'run':
      runAllTests();
      break;
    case 'coverage':
      checkCoverage();
      break;
    case 'create-tests':
      const components = findComponentsToTest();
      console.log(`🔍 找到 ${components.length} 个组件需要测试`);
      components.forEach(component => {
        createTestTemplate(path.join(__dirname, '../src', component));
      });
      break;
    case 'full':
      console.log('🚀 运行完整测试流程...');
      runAllTests();
      checkCoverage();
      break;
    default:
      console.log('📖 使用方法:');
      console.log('  node scripts/run-tests.js run        - 运行所有测试');
      console.log('  node scripts/run-tests.js coverage   - 检查覆盖率');
      console.log('  node scripts/run-tests.js create-tests - 创建测试文件');
      console.log('  node scripts/run-tests.js full       - 完整测试流程');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  checkCoverage,
  createTestTemplate,
  findComponentsToTest
}; 