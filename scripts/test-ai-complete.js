#!/usr/bin/env node

/**
 * 完整的AI服务测试脚本
 * 测试简化后的AI服务：火山方舟（豆包）和DeepSeek
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

console.log('🚀 人工智能实验平台 - AI服务完整测试');
console.log('='.repeat(60));

// 测试配置
const BACKEND_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 10000;

// 辅助函数：HTTP请求
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: TEST_TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// 测试步骤
async function testServiceHealth() {
  console.log('📊 测试服务健康状态...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.statusCode === 200 && response.data) {
      console.log('✅ 后端服务运行正常');
      console.log(`   状态: ${response.data.status || '健康'}`);
      console.log(`   时间: ${response.data.timestamp || '未知'}`);
      return true;
    } else {
      throw new Error(`服务状态异常: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ 后端服务未启动或异常');
    console.error(`   错误: ${error.message}`);
    console.error('   提示: 请先运行 "npm start" 或 VS Code 任务 "Start All Services"');
    return false;
  }
}

async function testAIModels() {
  console.log('\n🤖 测试AI模型列表...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/ai/models`);
    
    if (response.statusCode === 200 && response.data && response.data.success) {
      const models = response.data.models || [];
      console.log(`✅ AI模型列表获取成功 (${models.length} 个模型)`);
      
      models.forEach((model, index) => {
        const status = model.available ? '✅ 可用' : '❌ 不可用';
        console.log(`   ${index + 1}. ${model.name} (${model.provider}) ${status}`);
        console.log(`      描述: ${model.description}`);
        console.log(`      端点: ${model.endpoint}`);
        console.log(`      最大token: ${model.maxTokens}`);
        console.log('');
      });
      
      return models;
    } else {
      throw new Error(response.data?.message || `HTTP ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ AI模型列表获取失败');
    console.error(`   错误: ${error.message}`);
    return [];
  }
}

async function testAIConnection(modelId) {
  console.log(`🔗 测试AI模型连接: ${modelId}...`);
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/ai-assistant/test`, {
      method: 'POST',
      body: { modelId }
    });
    
    if (response.statusCode === 200 && response.data) {
      if (response.data.success) {
        console.log(`✅ ${modelId} 连接测试成功`);
        console.log(`   响应: ${response.data.message}`);
        return true;
      } else {
        console.log(`❌ ${modelId} 连接测试失败`);
        console.log(`   原因: ${response.data.message}`);
        return false;
      }
    } else {
      throw new Error(`HTTP ${response.statusCode}`);
    }
  } catch (error) {
    console.error(`❌ ${modelId} 连接测试异常`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

async function testAIChat() {
  console.log('\n💬 测试AI对话功能...');
  try {
    // 先尝试新的AI助手接口
    const response = await makeRequest(`${BACKEND_URL}/api/ai-assistant/chat`, {
      method: 'POST',
      body: {
        message: '你好，请用一句话介绍你的功能',
        modelId: 'deepseek-chat',
        context: {
          userId: 'test-user',
          sessionId: `test-session-${Date.now()}`,
          role: 'student'
        }
      }
    });
    
    if (response.statusCode === 200 && response.data) {
      console.log('✅ AI对话测试成功');
      
      // 显示回复内容
      const aiMessage = response.data.message || response.data.content || response.data.response || '未知响应';
      console.log(`   响应: ${aiMessage}`);
      
      // 显示建议信息
      const suggestions = response.data.suggestions || [];
      if (suggestions.length > 0) {
        console.log('   建议:');
        suggestions.forEach((suggestion, index) => {
          console.log(`     ${index + 1}. ${suggestion.text} (${suggestion.category || 'general'})`);
        });
      }
      
      return true;
    } else {
      // 尝试备用接口
      console.log('⚠️ 主接口失败，尝试备用AI接口...');
      const fallbackResponse = await makeRequest(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        body: {
          message: '你好，请用一句话介绍你的功能',
          modelId: 'deepseek-chat'
        }
      });
      
      if (fallbackResponse.statusCode === 200 && fallbackResponse.data) {
        console.log('✅ AI对话测试成功 (备用接口)');
        console.log(`   响应: ${fallbackResponse.data.content || fallbackResponse.data.response || '未知响应'}`);
        return true;
      } else {
        console.log('❌ AI对话测试失败 (所有接口)');
        console.log(`   状态: ${response.statusCode}`);
        console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ AI对话测试异常');
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

async function runCompleteTest() {
  console.log('开始完整的AI服务测试...\n');
  
  const results = {
    health: false,
    models: [],
    connections: {},
    chat: false
  };
  
  // 1. 测试服务健康状态
  results.health = await testServiceHealth();
  if (!results.health) {
    console.log('\n❌ 测试终止：后端服务未启动');
    return results;
  }
  
  // 2. 测试AI模型列表
  results.models = await testAIModels();
  
  // 3. 测试每个模型的连接
  if (results.models.length > 0) {
    console.log('🔍 测试模型连接...');
    for (const model of results.models) {
      if (model.available) {
        results.connections[model.id] = await testAIConnection(model.id);
      } else {
        console.log(`⏭️  跳过 ${model.id} (API密钥未配置)`);
        results.connections[model.id] = false;
      }
    }
  }
  
  // 4. 测试AI对话
  results.chat = await testAIChat();
  
  // 5. 显示测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📋 测试结果总结');
  console.log('='.repeat(60));
  
  console.log(`🔧 后端服务: ${results.health ? '✅ 正常' : '❌ 异常'}`);
  console.log(`🤖 AI模型数量: ${results.models.length} 个`);
  
  const availableModels = results.models.filter(m => m.available).length;
  const connectedModels = Object.values(results.connections).filter(Boolean).length;
  
  console.log(`📡 可用模型: ${availableModels} 个`);
  console.log(`🔗 连接成功: ${connectedModels} 个`);
  console.log(`💬 对话功能: ${results.chat ? '✅ 正常' : '❌ 异常'}`);
  
  if (results.models.length > 0) {
    console.log('\n模型详情:');
    results.models.forEach(model => {
      const connectionStatus = results.connections[model.id] ? '✅' : '❌';
      const availableStatus = model.available ? '✅' : '❌';
      console.log(`  • ${model.name} (${model.provider})`);
      console.log(`    API密钥: ${availableStatus}  连接: ${connectionStatus}`);
    });
  }
  
  // 6. 建议和下一步
  console.log('\n💡 建议:');
  if (!results.health) {
    console.log('  - 启动后端服务: npm start 或 VS Code 任务 "Start All Services"');
  }
  
  if (availableModels === 0) {
    console.log('  - 配置AI模型API密钥到环境变量:');
    console.log('    ARK_API_KEY=你的火山方舟API密钥');
    console.log('    DEEPSEEK_API_KEY=你的DeepSeek API密钥');
  }
  
  if (results.models.length > 0 && connectedModels === 0) {
    console.log('  - 检查API密钥是否有效');
    console.log('  - 确认网络连接正常');
  }
  
  const overallSuccess = results.health && results.models.length > 0 && connectedModels > 0;
  console.log(`\n🎯 总体状态: ${overallSuccess ? '✅ 成功' : '❌ 需要修复'}`);
  
  return results;
}

// 主函数
async function main() {
  try {
    await runCompleteTest();
  } catch (error) {
    console.error('\n❌ 测试执行异常:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { runCompleteTest };
