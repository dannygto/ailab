#!/usr/bin/env node

/**
 * AI助手测试脚本
 * 专门用于测试AICAM平台的AI助手功能
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const readline = require('readline');

console.log('🤖 AICAM平台 - AI助手功能测试');
console.log('='.repeat(60));

// 测试配置
const BACKEND_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 15000;

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
      reject(new Error('请求超时'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// 测试服务健康状态
async function testServiceHealth() {
  console.log('📊 测试后端服务健康状态...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.statusCode === 200 && response.data) {
      console.log('✅ 后端服务运行正常');
      console.log(`   状态: ${response.data.status || '健康'}`);
      return true;
    } else {
      throw new Error(`服务状态异常: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ 后端服务未启动或异常');
    console.error(`   错误: ${error.message}`);
    console.error('   提示: 请先运行 "npm start" 或 VS Code 任务 "Start Backend Only"');
    return false;
  }
}

// 测试AI助手对话
async function testAIAssistant(message) {
  console.log(`\n💬 测试AI助手对话: "${message}"`);
  try {
    // 先尝试主接口
    const response = await makeRequest(`${BACKEND_URL}/api/ai-assistant/chat`, {
      method: 'POST',
      body: {
        message,
        modelId: 'deepseek-chat',
        context: {
          userId: 'test-user',
          sessionId: `test-session-${Date.now()}`,
          role: 'student'
        }
      }
    });
    
    if (response.statusCode === 200 && response.data) {
      // 检查响应格式
      const content = response.data.message || response.data.content || response.data.response;
      if (content) {
        console.log('✅ AI助手回复成功:');
        console.log('-'.repeat(60));
        console.log(content);
        console.log('-'.repeat(60));
        
        // 显示建议
        const suggestions = response.data.suggestions || [];
        if (suggestions.length > 0) {
          console.log('\n📋 建议问题:');
          suggestions.forEach((sugg, i) => {
            console.log(`   ${i+1}. ${sugg.text} (${sugg.category || 'general'})`);
          });
        }
        
        return true;
      } else {
        console.log('⚠️ AI助手返回空回复');
        console.log(`   完整响应: ${JSON.stringify(response.data)}`);
        return false;
      }
    } else {
      // 尝试备用接口
      console.log('⚠️ 主接口失败，尝试备用接口...');
      const fallbackResponse = await makeRequest(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        body: { message, modelId: 'deepseek-chat' }
      });
      
      if (fallbackResponse.statusCode === 200 && fallbackResponse.data) {
        const content = fallbackResponse.data.content || fallbackResponse.data.response;
        if (content) {
          console.log('✅ AI助手回复成功 (备用接口):');
          console.log('-'.repeat(60));
          console.log(content);
          console.log('-'.repeat(60));
          return true;
        }
      }
      
      console.log('❌ 所有AI接口测试失败');
      return false;
    }
  } catch (error) {
    console.error('❌ AI助手测试异常');
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

// 交互式测试
async function startInteractiveTest() {
  console.log('\n🔄 开始交互式测试...');
  console.log('   (输入 "exit" 退出测试)');
  
  const sessionId = `test-session-${Date.now()}`;
  
  const askQuestion = () => {
    rl.question('\n请输入要发送给AI助手的消息: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('👋 结束测试');
        rl.close();
        return;
      }
      
      try {
        console.log('发送请求中...');
        const response = await makeRequest(`${BACKEND_URL}/api/ai-assistant/chat`, {
          method: 'POST',
          body: {
            message: input,
            modelId: 'deepseek-chat',
            context: {
              userId: 'test-user',
              sessionId: sessionId,
              role: 'student'
            }
          }
        });
        
        if (response.statusCode === 200 && response.data) {
          const content = response.data.message || response.data.content || response.data.response;
          if (content) {
            console.log('\n🤖 AI助手:');
            console.log('-'.repeat(60));
            console.log(content);
            console.log('-'.repeat(60));
            
            // 显示建议
            const suggestions = response.data.suggestions || [];
            if (suggestions.length > 0) {
              console.log('\n📋 建议问题:');
              suggestions.forEach((sugg, i) => {
                console.log(`   ${i+1}. ${sugg.text}`);
              });
            }
          } else {
            console.log('⚠️ AI助手返回空回复');
          }
        } else {
          console.log('❌ 请求失败:', response.statusCode);
        }
      } catch (error) {
        console.error('❌ 请求异常:', error.message);
      }
      
      // 继续询问
      askQuestion();
    });
  };
  
  askQuestion();
}

// 主函数
async function main() {
  try {
    // 测试服务健康状态
    const isHealthy = await testServiceHealth();
    if (!isHealthy) {
      console.log('⛔ 由于服务不可用，终止测试');
      process.exit(1);
    }
    
    // 测试简单对话
    await testAIAssistant('你好，请简单介绍一下你可以提供哪些帮助？');
    
    // 测试学科相关对话
    await testAIAssistant('请推荐一个适合初中生的物理实验');
    
    // 启动交互式测试
    await startInteractiveTest();
    
  } catch (error) {
    console.error('❌ 测试过程发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
