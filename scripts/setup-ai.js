#!/usr/bin/env node

/**
 * AI配置助手
 * 帮助用户快速配置火山方舟和DeepSeek API密钥
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🤖 人工智能辅助实验平台 - AI配置助手');
console.log('='.repeat(50));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('本助手将帮助您配置AI服务的API密钥');
  console.log('支持的AI服务：');
  console.log('  1. 火山方舟（豆包）- 支持多模态对话');
  console.log('  2. DeepSeek - 专注编程和推理');
  console.log('');

  // 检查当前配置
  const envPath = path.join(process.cwd(), '.env');
  let currentConfig = {};
  
  if (fs.existsSync(envPath)) {
    console.log('✅ 发现现有配置文件: .env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const arkMatch = envContent.match(/ARK_API_KEY=(.+)/);
    const deepseekMatch = envContent.match(/DEEPSEEK_API_KEY=(.+)/);
    
    if (arkMatch) {
      currentConfig.ark = arkMatch[1].replace(/"/g, '');
      console.log(`   火山方舟API密钥: ${currentConfig.ark.substring(0, 8)}...`);
    }
    
    if (deepseekMatch) {
      currentConfig.deepseek = deepseekMatch[1].replace(/"/g, '');
      console.log(`   DeepSeek API密钥: ${currentConfig.deepseek.substring(0, 8)}...`);
    }
    console.log('');
  }

  // 获取新配置
  const newConfig = {};

  console.log('🔥 配置火山方舟（豆包）API密钥');
  console.log('   获取地址: https://console.volcengine.com/ark');
  const arkKey = await question(`   请输入火山方舟API密钥 ${currentConfig.ark ? '(回车保持现有)' : ''}: `);
  if (arkKey.trim()) {
    newConfig.ark = arkKey.trim();
  } else if (currentConfig.ark) {
    newConfig.ark = currentConfig.ark;
  }

  console.log('');
  console.log('🤖 配置DeepSeek API密钥');
  console.log('   获取地址: https://platform.deepseek.com/api_keys');
  const deepseekKey = await question(`   请输入DeepSeek API密钥 ${currentConfig.deepseek ? '(回车保持现有)' : ''}: `);
  if (deepseekKey.trim()) {
    newConfig.deepseek = deepseekKey.trim();
  } else if (currentConfig.deepseek) {
    newConfig.deepseek = currentConfig.deepseek;
  }

  console.log('');

  // 生成配置内容
  const envContent = `# 人工智能辅助实验平台环境配置
# 生成时间: ${new Date().toLocaleString()}

# ==================== AI服务配置 ====================
# 火山方舟（豆包）API密钥
ARK_API_KEY=${newConfig.ark || 'your-ark-api-key-here'}

# DeepSeek API密钥  
DEEPSEEK_API_KEY=${newConfig.deepseek || 'your-deepseek-api-key-here'}

# ==================== 基础配置 ====================
NODE_ENV=development
PORT=3000

# ==================== 前端配置 ====================
FRONTEND_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# ==================== 安全配置 ====================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
`;

  // 写入配置文件
  fs.writeFileSync(envPath, envContent);
  console.log('✅ 配置已保存到 .env 文件');

  // 也更新backend目录的.env
  const backendEnvPath = path.join(process.cwd(), 'backend', '.env');
  if (fs.existsSync(path.join(process.cwd(), 'backend'))) {
    fs.writeFileSync(backendEnvPath, envContent);
    console.log('✅ 配置已同步到 backend/.env');
  }

  console.log('');
  console.log('📋 配置摘要:');
  if (newConfig.ark) {
    console.log(`   🔥 火山方舟: ${newConfig.ark.substring(0, 8)}...`);
  } else {
    console.log('   🔥 火山方舟: ❌ 未配置');
  }
  
  if (newConfig.deepseek) {
    console.log(`   🤖 DeepSeek: ${newConfig.deepseek.substring(0, 8)}...`);
  } else {
    console.log('   🤖 DeepSeek: ❌ 未配置');
  }

  console.log('');
  console.log('🚀 下一步:');
  console.log('   1. 启动服务: npm start');
  console.log('   2. 测试AI: npm run test:ai');
  console.log('   3. 访问平台: http://localhost:3001');

  rl.close();
}

main().catch(console.error);
