const fs = require('fs');
const path = require('path');

const securityConfig = {
  scanDirectories: [
    '源代码/前端',
    '源代码/后端',
    '源代码/AI服务',
    '配置'
  ],
  sensitivePatterns: [
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi
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
      const lines = content.split('\n');
      
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
      console.log('⚠️  无法扫描文件: ' + filePath);
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
    console.log('\n🔍 安全扫描结果:');
    console.log('扫描文件数: ' + this.scannedFiles);
    console.log('发现问题数: ' + this.issues.length);
    
    if (this.issues.length > 0) {
      console.log('\n⚠️  发现的安全问题:');
      this.issues.forEach((issue, index) => {
        console.log((index + 1) + '. ' + issue.file + ':' + issue.line);
        console.log('   内容: ' + issue.content);
        console.log('   类型: ' + issue.type + ' (严重程度: ' + issue.severity + ')\n');
      });
    } else {
      console.log('✅ 未发现安全问题');
    }
    
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

const scanner = new SecurityScanner();

console.log('🔒 开始安全扫描...');
securityConfig.scanDirectories.forEach(dir => {
  console.log('扫描目录: ' + dir);
  scanner.scanDirectory(dir);
});

scanner.generateReport();
