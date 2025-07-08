const fs = require('fs');
const path = require('path');

function createMissingDirectories() {
  console.log('📁 创建缺失的目录...');
  
  const missingDirs = [
    '脚本/启动脚本',
    '脚本/部署脚本', 
    '脚本/维护脚本',
    '脚本/测试脚本'
  ];
  
  for (const dir of missingDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 创建目录: ${dir}`);
    }
  }
}

function createMissingFiles() {
  console.log('\n📄 创建缺失的文件...');
  
  // 创建脚本目录的README
  const scriptsReadme = `# 脚本目录说明

此目录包含项目相关的各种脚本文件。

## 脚本分类
- 启动脚本/: 项目启动相关的脚本
- 部署脚本/: 部署和运维相关的脚本
- 维护脚本/: 代码维护和修复脚本
- 测试脚本/: 测试相关的脚本

## 更新说明
- 创建时间: ${new Date().toLocaleString()}
- 标准化版本: v1.0.0
`;

  const scriptsReadmePath = '脚本/README.md';
  if (!fs.existsSync(scriptsReadmePath)) {
    fs.writeFileSync(scriptsReadmePath, scriptsReadme);
    console.log('✅ 创建脚本README文件');
  }
  
  // 创建项目管理目录的README
  const projectReadme = `# 项目管理目录说明

此目录包含项目管理的相关文档和报告。

## 目录结构
- 进度报告/: 项目进度和状态报告
- 计划文档/: 项目计划和规划文档
- 验收文档/: 项目验收和总结文档

## 更新说明
- 创建时间: ${new Date().toLocaleString()}
- 标准化版本: v1.0.0
`;

  const projectReadmePath = '项目管理/README.md';
  if (!fs.existsSync(projectReadmePath)) {
    fs.writeFileSync(projectReadmePath, projectReadme);
    console.log('✅ 创建项目管理README文件');
  }
  
  // 创建目录结构报告
  const structureReport = {
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',
    directories: {},
    files: {},
    statistics: {
      totalDirectories: 0,
      totalFiles: 0
    }
  };
  
  // 统计目录和文件
  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          structureReport.statistics.totalDirectories++;
          structureReport.directories[relativeItemPath] = {
            type: 'directory',
            size: 0,
            created: stat.birthtime,
            modified: stat.mtime
          };
          scanDirectory(fullPath, relativeItemPath);
        } else {
          structureReport.statistics.totalFiles++;
          structureReport.files[relativeItemPath] = {
            type: 'file',
            size: stat.size,
            created: stat.birthtime,
            modified: stat.mtime
          };
        }
      }
    } catch (error) {
      console.log(`⚠️  跳过扫描目录: ${dirPath} (${error.message})`);
    }
  }
  
  scanDirectory('.');
  
  const structureReportPath = '项目管理/进度报告/目录结构报告.json';
  if (!fs.existsSync(structureReportPath)) {
    fs.writeFileSync(structureReportPath, JSON.stringify(structureReport, null, 2));
    console.log('✅ 创建目录结构报告');
  }
}

function moveScriptsToCorrectDirectories() {
  console.log('\n📦 移动脚本到正确的目录...');
  
  // 检查并移动脚本文件
  const scriptMoves = [
    {
      source: 'scripts/standardize-directory-structure.js',
      target: '脚本/维护脚本/standardize-directory-structure.js'
    },
    {
      source: 'scripts/完善部署配置.js',
      target: '脚本/维护脚本/完善部署配置.js'
    },
    {
      source: 'scripts/最终验收.js',
      target: '脚本/测试脚本/最终验收.js'
    },
    {
      source: 'scripts/修复验收问题.js',
      target: '脚本/维护脚本/修复验收问题.js'
    }
  ];
  
  for (const move of scriptMoves) {
    if (fs.existsSync(move.source) && !fs.existsSync(move.target)) {
      try {
        fs.renameSync(move.source, move.target);
        console.log(`✅ 移动脚本: ${move.source} → ${move.target}`);
      } catch (error) {
        console.log(`⚠️  跳过移动: ${move.source} (${error.message})`);
      }
    }
  }
}

function createTestScripts() {
  console.log('\n🧪 创建测试脚本...');
  
  const testScripts = {
    '脚本/测试脚本/run-tests.js': `const { execSync } = require('child_process');

console.log('🧪 运行项目测试...');

try {
  // 运行前端测试
  console.log('运行前端测试...');
  execSync('cd 源代码/前端 && npm test -- --passWithNoTests', { stdio: 'inherit' });
  
  // 运行后端测试
  console.log('运行后端测试...');
  execSync('cd 源代码/后端 && npm test', { stdio: 'inherit' });
  
  console.log('✅ 所有测试通过！');
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}
`,
    '脚本/测试脚本/health-check.js': `const http = require('http');

const services = [
  { name: '前端', url: 'http://localhost:3000', path: '/' },
  { name: '后端', url: 'http://localhost:8000', path: '/api/health' },
  { name: 'AI服务', url: 'http://localhost:8001', path: '/health' }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(\`\${service.url}\${service.path}\`, (res) => {
      if (res.statusCode === 200) {
        console.log(\`✅ \${service.name} 服务正常\`);
        resolve(true);
      } else {
        console.log(\`❌ \${service.name} 服务异常 (状态码: \${res.statusCode})\`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log(\`❌ \${service.name} 服务不可达\`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(\`⏰ \${service.name} 服务超时\`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🏥 开始健康检查...\\n');
  
  const results = await Promise.all(services.map(checkService));
  const allHealthy = results.every(result => result);
  
  if (allHealthy) {
    console.log('\\n🎉 所有服务健康！');
  } else {
    console.log('\\n⚠️  部分服务异常');
    process.exit(1);
  }
}

main();
`
  };
  
  for (const [filePath, content] of Object.entries(testScripts)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 创建测试脚本: ${filePath}`);
    }
  }
}

function createStartupScripts() {
  console.log('\n🚀 创建启动脚本...');
  
  const startupScripts = {
    '脚本/启动脚本/start-dev.sh': `#!/bin/bash

echo "🚀 启动开发环境..."

# 启动后端服务
echo "启动后端服务..."
cd 源代码/后端
npm install
npm run dev &

# 启动前端服务
echo "启动前端服务..."
cd ../前端
npm install
npm start &

echo "✅ 开发环境启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8000"
`,
    '脚本/启动脚本/start-prod.sh': `#!/bin/bash

echo "🚀 启动生产环境..."

# 使用Docker Compose启动
docker-compose -f 配置/部署配置/docker-compose.yml up -d

echo "✅ 生产环境启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8000"
echo "AI服务地址: http://localhost:8001"
`
  };
  
  for (const [filePath, content] of Object.entries(startupScripts)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      try {
        fs.chmodSync(filePath, '755');
      } catch (error) {
        console.log(`⚠️  无法设置执行权限: ${filePath}`);
      }
      console.log(`✅ 创建启动脚本: ${filePath}`);
    }
  }
}

function main() {
  console.log('🔧 开始修复验收问题...\n');
  
  try {
    // 1. 创建缺失的目录
    createMissingDirectories();
    
    // 2. 创建缺失的文件
    createMissingFiles();
    
    // 3. 移动脚本到正确目录
    moveScriptsToCorrectDirectories();
    
    // 4. 创建测试脚本
    createTestScripts();
    
    // 5. 创建启动脚本
    createStartupScripts();
    
    console.log('\n🎉 验收问题修复完成！');
    console.log('📋 修复内容:');
    console.log('   - 创建了缺失的脚本目录');
    console.log('   - 创建了缺失的README文件');
    console.log('   - 生成了目录结构报告');
    console.log('   - 移动了脚本到正确位置');
    console.log('   - 创建了测试和启动脚本');
    
    console.log('\n💡 建议重新运行验收检查: node 脚本/测试脚本/最终验收.js');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  createMissingDirectories,
  createMissingFiles,
  moveScriptsToCorrectDirectories,
  createTestScripts,
  createStartupScripts
}; 