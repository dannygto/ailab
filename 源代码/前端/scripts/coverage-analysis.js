// 测试覆盖率分析和报告脚本
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
  cyan: '\x1b[36m'
};

// 测试覆盖率阈值
const coverageThresholds = {
  statements: 70,
  branches: 70,
  functions: 70,
  lines: 70
};

// 日志函数
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

// 运行测试覆盖率
async function runCoverageTest() {
  console.log(`${colors.bright}${colors.blue}=== AICAM平台测试覆盖率分析 ===${colors.reset}\n`);
  
  try {
    logInfo('正在运行测试覆盖率分析...');
    
    const command = 'npm run test:coverage';
    logInfo(`执行命令: ${command}`);
    
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..')
    });
    
    console.log(output);
    
    // 解析覆盖率结果
    await analyzeCoverageResults();
    
    logSuccess('测试覆盖率分析完成');
    return true;
    
  } catch (error) {
    logError(`测试覆盖率分析失败: ${error.message}`);
    
    // 如果是因为没有测试文件，给出提示
    if (error.message.includes('No tests found')) {
      logWarning('当前项目中没有找到测试文件');
      logInfo('建议运行: npm run test:unit 来创建基础测试');
    }
    
    return false;
  }
}

// 分析覆盖率结果
async function analyzeCoverageResults() {
  const coverageDir = path.join(__dirname, '../coverage');
  const lcovInfoPath = path.join(coverageDir, 'lcov-report', 'index.html');
  const coverageJsonPath = path.join(coverageDir, 'coverage-final.json');
  
  // 检查覆盖率文件是否存在
  if (!fs.existsSync(coverageDir)) {
    logWarning('覆盖率报告目录不存在');
    return;
  }
  
  logInfo('分析覆盖率数据...');
  
  // 读取覆盖率摘要
  const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
  if (fs.existsSync(coverageSummaryPath)) {
    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    displayCoverageSummary(summary);
  } else {
    logWarning('覆盖率摘要文件不存在');
  }
  
  // 检查覆盖率报告
  if (fs.existsSync(lcovInfoPath)) {
    logSuccess(`HTML覆盖率报告生成成功: ${lcovInfoPath}`);
  }
  
  if (fs.existsSync(coverageJsonPath)) {
    logSuccess(`JSON覆盖率数据生成成功: ${coverageJsonPath}`);
  }
}

// 显示覆盖率摘要
function displayCoverageSummary(summary) {
  console.log(`\n${colors.bright}覆盖率摘要:${colors.reset}`);
  
  if (summary.total) {
    const total = summary.total;
    
    const metrics = [
      { name: '语句覆盖率', key: 'statements', value: total.statements },
      { name: '分支覆盖率', key: 'branches', value: total.branches },
      { name: '函数覆盖率', key: 'functions', value: total.functions },
      { name: '行覆盖率', key: 'lines', value: total.lines }
    ];
    
    metrics.forEach(metric => {
      if (metric.value) {
        const pct = metric.value.pct || 0;
        const threshold = coverageThresholds[metric.key];
        const status = pct >= threshold ? '✓' : '✗';
        const color = pct >= threshold ? colors.green : colors.red;
        
        console.log(`  ${color}${status} ${metric.name}: ${pct}%${colors.reset} (阈值: ${threshold}%)`);
        console.log(`    覆盖: ${metric.value.covered || 0}, 总计: ${metric.value.total || 0}`);
      }
    });
  }
  
  // 显示低覆盖率文件
  showLowCoverageFiles(summary);
}

// 显示低覆盖率文件
function showLowCoverageFiles(summary) {
  const lowCoverageFiles = [];
  
  Object.keys(summary).forEach(filePath => {
    if (filePath === 'total') return;
    
    const fileData = summary[filePath];
    if (fileData.statements && fileData.statements.pct < coverageThresholds.statements) {
      lowCoverageFiles.push({
        file: filePath,
        statements: fileData.statements.pct,
        branches: fileData.branches.pct,
        functions: fileData.functions.pct,
        lines: fileData.lines.pct
      });
    }
  });
  
  if (lowCoverageFiles.length > 0) {
    console.log(`\n${colors.yellow}${colors.bright}需要关注的低覆盖率文件:${colors.reset}`);
    lowCoverageFiles.slice(0, 10).forEach(file => {
      console.log(`  ${colors.yellow}${file.file}${colors.reset}`);
      console.log(`    语句: ${file.statements}%, 分支: ${file.branches}%, 函数: ${file.functions}%, 行: ${file.lines}%`);
    });
    
    if (lowCoverageFiles.length > 10) {
      console.log(`  ... 还有 ${lowCoverageFiles.length - 10} 个文件`);
    }
  }
}

// 生成覆盖率改进建议
function generateImprovementSuggestions() {
  console.log(`\n${colors.bright}覆盖率改进建议:${colors.reset}`);
  
  const suggestions = [
    '1. 为核心业务组件添加单元测试',
    '2. 增加边界条件和错误处理的测试用例',
    '3. 为工具函数和服务类添加测试',
    '4. 增加组件交互和状态变化的测试',
    '5. 添加异步操作和API调用的测试',
    '6. 为复杂的条件分支添加测试覆盖',
    '7. 使用测试驱动开发(TDD)方法',
    '8. 定期审查和重构测试代码'
  ];
  
  suggestions.forEach(suggestion => {
    console.log(`  ${colors.cyan}${suggestion}${colors.reset}`);
  });
}

// 运行基础测试检查
async function runBasicTestCheck() {
  console.log(`\n${colors.bright}基础测试体系检查:${colors.reset}`);
  
  // 检查测试文件数量
  const testDirs = [
    path.join(__dirname, '../__tests__'),
    path.join(__dirname, '../src/**/*.test.ts'),
    path.join(__dirname, '../src/**/*.test.tsx'),
    path.join(__dirname, '../src/**/*.spec.ts'),
    path.join(__dirname, '../src/**/*.spec.tsx')
  ];
  
  let testFileCount = 0;
  
  // 检查__tests__目录
  const testsDir = path.join(__dirname, '../__tests__');
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir);
    testFileCount += testFiles.filter(file => 
      file.endsWith('.test.tsx') || 
      file.endsWith('.test.ts') || 
      file.endsWith('.spec.tsx') || 
      file.endsWith('.spec.ts')
    ).length;
  }
  
  console.log(`  测试文件数量: ${testFileCount}`);
  
  // 检查测试配置
  const jestConfigPath = path.join(__dirname, '../jest.config.json');
  const setupTestsPath = path.join(__dirname, '../src/setupTests.ts');
  
  console.log(`  Jest配置: ${fs.existsSync(jestConfigPath) ? '✓' : '✗'}`);
  console.log(`  测试环境设置: ${fs.existsSync(setupTestsPath) ? '✓' : '✗'}`);
  
  // 检查测试工具
  const testUtilsPath = path.join(__dirname, '../src/test-utils.tsx');
  console.log(`  测试工具: ${fs.existsSync(testUtilsPath) ? '✓' : '✗'}`);
  
  // 给出建议
  if (testFileCount < 5) {
    logWarning('测试文件数量较少，建议增加更多测试用例');
  } else {
    logSuccess(`发现 ${testFileCount} 个测试文件`);
  }
}

// 主函数
async function main() {
  try {
    // 运行基础测试检查
    await runBasicTestCheck();
    
    // 运行覆盖率测试
    const success = await runCoverageTest();
    
    // 生成改进建议
    generateImprovementSuggestions();
    
    return success;
  } catch (error) {
    logError(`执行失败: ${error.message}`);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Coverage analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { runCoverageTest, analyzeCoverageResults };
