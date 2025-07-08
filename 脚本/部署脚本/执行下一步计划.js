const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 下一步计划配置
const nextSteps = {
  deployment: {
    name: '部署测试验证',
    description: '在测试环境验证部署配置，检查所有服务正常运行',
    tasks: [
      '验证Docker配置',
      '检查服务健康状态',
      '验证监控和告警功能',
      '测试数据库连接',
      '验证API接口'
    ]
  },
  performance: {
    name: '性能优化',
    description: '进行性能测试，优化数据库查询，调整缓存策略',
    tasks: [
      '性能基准测试',
      '数据库查询优化',
      '缓存策略调整',
      '前端资源优化',
      'API响应时间优化'
    ]
  },
  security: {
    name: '安全加固',
    description: '配置SSL证书，设置防火墙规则，定期安全扫描',
    tasks: [
      'SSL证书配置',
      '防火墙规则设置',
      '安全扫描配置',
      '访问控制优化',
      '数据加密验证'
    ]
  },
  operations: {
    name: '运维完善',
    description: '建立CI/CD流程，配置日志收集，设置自动备份',
    tasks: [
      'CI/CD流程建立',
      '日志收集配置',
      '自动备份设置',
      '监控告警完善',
      '运维文档更新'
    ]
  }
};

function checkDockerEnvironment() {
  console.log('🐳 检查Docker环境...');
  
  try {
    // 检查Docker是否安装
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker已安装');
    
    // 检查Docker Compose是否安装
    execSync('docker-compose --version', { stdio: 'pipe' });
    console.log('✅ Docker Compose已安装');
    
    // 检查Docker服务状态
    execSync('docker info', { stdio: 'pipe' });
    console.log('✅ Docker服务运行正常');
    
    return true;
  } catch (error) {
    console.log('❌ Docker环境检查失败:', error.message);
    return false;
  }
}

function validateDockerConfig() {
  console.log('\n🔧 验证Docker配置...');
  
  const dockerComposePath = '配置/部署配置/docker-compose.yml';
  
  if (fs.existsSync(dockerComposePath)) {
    try {
      const content = fs.readFileSync(dockerComposePath, 'utf8');
      
      // 检查基本配置
      if (content.includes('version:') && content.includes('services:')) {
        console.log('✅ Docker Compose配置格式正确');
        
        // 检查服务配置
        const services = ['frontend', 'backend', 'ai-service', 'db', 'redis', 'nginx'];
        for (const service of services) {
          if (content.includes(service + ':')) {
            console.log(`✅ 服务配置存在: ${service}`);
          } else {
            console.log(`⚠️  服务配置缺失: ${service}`);
          }
        }
        
        return true;
      } else {
        console.log('❌ Docker Compose配置格式错误');
        return false;
      }
    } catch (error) {
      console.log('❌ 读取Docker配置失败:', error.message);
      return false;
    }
  } else {
    console.log('❌ Docker Compose配置文件不存在');
    return false;
  }
}

function createPerformanceTestScript() {
  console.log('\n⚡ 创建性能测试脚本...');
  
  const performanceScript = `const http = require('http');
const https = require('https');
const fs = require('fs');

// 性能测试配置
const testConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:8000',
  aiUrl: 'http://localhost:8001',
  testDuration: 30000, // 30秒
  concurrentUsers: 10,
  endpoints: [
    { path: '/', name: '前端首页' },
    { path: '/api/health', name: '后端健康检查' },
    { path: '/ai/health', name: 'AI服务健康检查' }
  ]
};

class PerformanceTest {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      averageResponseTime: 0
    };
  }

  async makeRequest(url, endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(url + endpoint.path, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.totalRequests++;
        this.results.totalResponseTime += responseTime;
        
        if (res.statusCode === 200) {
          this.results.successfulRequests++;
        } else {
          this.results.failedRequests++;
        }
        
        this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
        this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
        
        resolve(responseTime);
      });
      
      req.on('error', () => {
        this.results.totalRequests++;
        this.results.failedRequests++;
        resolve(0);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        this.results.totalRequests++;
        this.results.failedRequests++;
        resolve(0);
      });
    });
  }

  async runTest() {
    console.log('🚀 开始性能测试...');
    console.log(\`测试配置: \${testConfig.concurrentUsers}个并发用户, \${testConfig.testDuration/1000}秒\`);
    
    const startTime = Date.now();
    const promises = [];
    
    // 创建并发请求
    for (let i = 0; i < testConfig.concurrentUsers; i++) {
      const userPromise = this.runUserTest();
      promises.push(userPromise);
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const testDuration = endTime - startTime;
    
    // 计算平均响应时间
    this.results.averageResponseTime = this.results.totalResponseTime / this.results.totalRequests;
    
    // 输出结果
    console.log('\\n📊 性能测试结果:');
    console.log(\`总请求数: \${this.results.totalRequests}\`);
    console.log(\`成功请求: \${this.results.successfulRequests}\`);
    console.log(\`失败请求: \${this.results.failedRequests}\`);
    console.log(\`成功率: \${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%\`);
    console.log(\`平均响应时间: \${this.results.averageResponseTime.toFixed(2)}ms\`);
    console.log(\`最小响应时间: \${this.results.minResponseTime}ms\`);
    console.log(\`最大响应时间: \${this.results.maxResponseTime}ms\`);
    console.log(\`测试持续时间: \${testDuration}ms\`);
    
    // 保存结果
    const report = {
      timestamp: new Date().toISOString(),
      config: testConfig,
      results: this.results,
      testDuration
    };
    
    fs.writeFileSync('项目管理/进度报告/性能测试报告.json', JSON.stringify(report, null, 2));
    console.log('✅ 性能测试报告已保存');
  }

  async runUserTest() {
    const endTime = Date.now() + testConfig.testDuration;
    
    while (Date.now() < endTime) {
      for (const endpoint of testConfig.endpoints) {
        await this.makeRequest(testConfig.baseUrl, endpoint);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms间隔
      }
    }
  }
}

// 运行测试
const test = new PerformanceTest();
test.runTest().catch(console.error);
`;

  const performancePath = '脚本/测试脚本/performance-test.js';
  fs.writeFileSync(performancePath, performanceScript);
  console.log('✅ 创建性能测试脚本');
}

function createSecurityScanScript() {
  console.log('\n🔒 创建安全扫描脚本...');
  
  const securityScript = `const fs = require('fs');
const path = require('path');

// 安全扫描配置
const securityConfig = {
  scanDirectories: [
    '源代码/前端',
    '源代码/后端',
    '源代码/AI服务',
    '配置'
  ],
  sensitivePatterns: [
    /password\\s*[:=]\\s*['"][^'"]+['"]/gi,
    /api_key\\s*[:=]\\s*['"][^'"]+['"]/gi,
    /secret\\s*[:=]\\s*['"][^'"]+['"]/gi,
    /token\\s*[:=]\\s*['"][^'"]+['"]/gi,
    /private_key\\s*[:=]\\s*['"][^'"]+['"]/gi
  ],
  fileExtensions: ['.js', '.ts', '.json', '.yml', '.yaml', '.env'],
  excludePatterns: [
    /node_modules/,
    /dist/,
    /build/,
    /.git/
  ]
};

class SecurityScanner {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\\n');
      
      lines.forEach((line, lineNumber) => {
        securityConfig.sensitivePatterns.forEach(pattern => {
          if (pattern.test(line)) {
            this.issues.push({
              file: filePath,
              line: lineNumber + 1,
              content: line.trim(),
              type: 'sensitive_data',
              severity: 'high'
            });
          }
        });
      });
      
      this.scannedFiles++;
    } catch (error) {
      console.log(\`⚠️  无法扫描文件: \${filePath}\`);
    }
  }

  scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      // 检查是否在排除列表中
      const shouldExclude = securityConfig.excludePatterns.some(pattern => 
        pattern.test(fullPath)
      );
      
      if (shouldExclude) {
        return;
      }
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else {
        const ext = path.extname(fullPath);
        if (securityConfig.fileExtensions.includes(ext)) {
          this.scanFile(fullPath);
        }
      }
    });
  }

  generateReport() {
    console.log('\\n🔍 安全扫描结果:');
    console.log(\`扫描文件数: \${this.scannedFiles}\`);
    console.log(\`发现问题数: \${this.issues.length}\`);
    
    if (this.issues.length > 0) {
      console.log('\\n⚠️  发现的安全问题:');
      this.issues.forEach((issue, index) => {
        console.log(\`\${index + 1}. \${issue.file}:${issue.line}\`);
        console.log(\`   内容: \${issue.content}\`);
        console.log(\`   类型: \${issue.type} (严重程度: \${issue.severity})\\n\`);
      });
    } else {
      console.log('✅ 未发现安全问题');
    }
    
    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      config: securityConfig,
      summary: {
        scannedFiles: this.scannedFiles,
        issuesFound: this.issues.length
      },
      issues: this.issues
    };
    
    fs.writeFileSync('项目管理/进度报告/安全扫描报告.json', JSON.stringify(report, null, 2));
    console.log('✅ 安全扫描报告已保存');
  }
}

// 运行安全扫描
const scanner = new SecurityScanner();

console.log('🔒 开始安全扫描...');
securityConfig.scanDirectories.forEach(dir => {
  console.log(\`扫描目录: \${dir}\`);
  scanner.scanDirectory(dir);
});

scanner.generateReport();
`;

  const securityPath = '脚本/测试脚本/security-scan.js';
  fs.writeFileSync(securityPath, securityScript);
  console.log('✅ 创建安全扫描脚本');
}

function createCICDConfig() {
  console.log('\n🔄 创建CI/CD配置...');
  
  const githubActionsConfig = `name: AICAM CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd 源代码/前端 && npm install
        cd ../后端 && npm install
        cd ../AI服务 && npm install
    
    - name: Run tests
      run: |
        cd 源代码/前端 && npm test -- --passWithNoTests
        cd ../后端 && npm test
        cd ../AI服务 && npm test
    
    - name: Run security scan
      run: node 脚本/测试脚本/security-scan.js
    
    - name: Run performance test
      run: node 脚本/测试脚本/performance-test.js

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build and push Docker images
      run: |
        docker build -t aicam-frontend ./源代码/前端
        docker build -t aicam-backend ./源代码/后端
        docker build -t aicam-ai-service ./源代码/AI服务

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        docker-compose -f 配置/部署配置/docker-compose.yml up -d
    
    - name: Health check
      run: node 脚本/测试脚本/health-check.js
`;

  const ciPath = '.github/workflows/ci-cd.yml';
  if (!fs.existsSync('.github/workflows')) {
    fs.mkdirSync('.github/workflows', { recursive: true });
  }
  fs.writeFileSync(ciPath, githubActionsConfig);
  console.log('✅ 创建GitHub Actions CI/CD配置');
}

function createLoggingConfig() {
  console.log('\n📝 创建日志配置...');
  
  const loggingConfig = {
    version: 'v1.0.0',
    timestamp: new Date().toISOString(),
    logging: {
      level: 'info',
      format: 'json',
      destination: 'logs',
      rotation: {
        maxSize: '100m',
        maxFiles: 10,
        compress: true
      }
    },
    services: {
      frontend: {
        logFile: 'logs/frontend.log',
        level: 'info'
      },
      backend: {
        logFile: 'logs/backend.log',
        level: 'info'
      },
      aiService: {
        logFile: 'logs/ai-service.log',
        level: 'info'
      },
      database: {
        logFile: 'logs/database.log',
        level: 'warn'
      }
    },
    monitoring: {
      enabled: true,
      metrics: {
        cpu: true,
        memory: true,
        disk: true,
        network: true
      },
      alerts: {
        cpuThreshold: 80,
        memoryThreshold: 85,
        diskThreshold: 90
      }
    }
  };
  
  const loggingPath = '配置/日志配置/logging.json';
  if (!fs.existsSync('配置/日志配置')) {
    fs.mkdirSync('配置/日志配置', { recursive: true });
  }
  fs.writeFileSync(loggingPath, JSON.stringify(loggingConfig, null, 2));
  console.log('✅ 创建日志配置');
}

function createNextStepsReport() {
  console.log('\n📋 生成下一步计划报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',
    status: 'IN_PROGRESS',
    nextSteps: nextSteps,
    completedTasks: [
      'Docker环境检查',
      'Docker配置验证',
      '性能测试脚本创建',
      '安全扫描脚本创建',
      'CI/CD配置创建',
      '日志配置创建'
    ],
    recommendations: [
      '运行性能测试: node 脚本/测试脚本/performance-test.js',
      '运行安全扫描: node 脚本/测试脚本/security-scan.js',
      '启动服务进行健康检查: node 脚本/测试脚本/health-check.js',
      '配置生产环境变量',
      '设置SSL证书',
      '配置监控告警'
    ]
  };
  
  const reportPath = '项目管理/进度报告/下一步计划执行报告.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('✅ 生成下一步计划报告');
  
  return report;
}

function main() {
  console.log('🚀 开始执行下一步计划...\n');
  
  try {
    // 1. 检查Docker环境
    const dockerReady = checkDockerEnvironment();
    
    // 2. 验证Docker配置
    const configValid = validateDockerConfig();
    
    // 3. 创建性能测试脚本
    createPerformanceTestScript();
    
    // 4. 创建安全扫描脚本
    createSecurityScanScript();
    
    // 5. 创建CI/CD配置
    createCICDConfig();
    
    // 6. 创建日志配置
    createLoggingConfig();
    
    // 7. 生成下一步计划报告
    const report = createNextStepsReport();
    
    console.log('\n🎉 下一步计划准备完成！');
    console.log('📋 已完成的任务:');
    report.completedTasks.forEach(task => console.log(`   ✅ ${task}`));
    
    console.log('\n💡 下一步建议:');
    report.recommendations.forEach(rec => console.log(`   🔸 ${rec}`));
    
    console.log('\n📊 环境检查结果:');
    console.log(`   Docker环境: ${dockerReady ? '✅ 就绪' : '❌ 需要配置'}`);
    console.log(`   Docker配置: ${configValid ? '✅ 有效' : '❌ 需要修复'}`);
    
    if (dockerReady && configValid) {
      console.log('\n🚀 环境准备就绪，可以开始部署测试！');
    } else {
      console.log('\n⚠️  请先解决环境问题，然后继续下一步。');
    }
    
  } catch (error) {
    console.error('❌ 执行下一步计划时出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  checkDockerEnvironment,
  validateDockerConfig,
  createPerformanceTestScript,
  createSecurityScanScript,
  createCICDConfig,
  createLoggingConfig,
  createNextStepsReport
}; 