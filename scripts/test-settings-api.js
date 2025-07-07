#!/usr/bin/env node

/**
 * 设置API测试脚本
 * 测试系统设置相关的API端点
 */

const http = require('http');

// 测试配置
const PORT = 3002;
const HOST = 'localhost';

// 测试API端点
const API_ENDPOINTS = [
  // 获取所有设置
  { 
    url: '/api/settings', 
    method: 'GET', 
    description: '获取所有设置'
  },
  
  // 主题设置
  { 
    url: '/api/settings/theme', 
    method: 'GET', 
    description: '获取主题设置'
  },
  
  // 更新主题设置
  {
    url: '/api/settings/theme',
    method: 'PUT',
    description: '更新主题设置',
    body: {
      primaryColor: '#2196f3',
      darkMode: true,
      fontSize: 'large'
    }
  },
  
  // 获取更新后的主题设置
  { 
    url: '/api/settings/theme', 
    method: 'GET', 
    description: '获取更新后的主题设置'
  },
  
  // 数据设置
  { 
    url: '/api/settings/data', 
    method: 'GET', 
    description: '获取数据设置'
  },
  
  // 更新数据设置
  {
    url: '/api/settings/data',
    method: 'PUT',
    description: '更新数据设置',
    body: {
      defaultPageSize: 20,
      autoRefresh: true,
      refreshInterval: 60
    }
  },
  
  // 获取更新后的数据设置
  { 
    url: '/api/settings/data', 
    method: 'GET', 
    description: '获取更新后的数据设置'
  },
  
  // 重置所有设置
  {
    url: '/api/settings/reset',
    method: 'POST',
    description: '重置所有设置'
  },
  
  // 获取重置后的设置
  { 
    url: '/api/settings', 
    method: 'GET', 
    description: '获取重置后的所有设置'
  }
];

/**
 * 发送HTTP请求
 */
function sendRequest(options, body = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ 
            statusCode: res.statusCode, 
            error: `响应不是有效的JSON: ${e.message}`,
            raw: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ error: `请求失败: ${error.message}` });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

/**
 * 测试单个API端点
 */
async function testEndpoint(endpoint) {
  const url = typeof endpoint.url === 'function' ? endpoint.url() : endpoint.url;
  console.log(`\n测试: ${endpoint.description} (${endpoint.method} ${url})`);
  
  const options = {
    hostname: HOST,
    port: PORT,
    path: url,
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const result = await sendRequest(options, endpoint.body);
  
  if (result.error) {
    console.log(`❌ ${result.error}`);
    if (result.raw) {
      console.log(`原始响应: ${result.raw.substring(0, 150)}...`);
    }
    return;
  }
  
  if (result.statusCode >= 200 && result.statusCode < 300) {
    console.log(`✅ 状态码: ${result.statusCode}`);
    console.log(`✅ 响应格式正确`);
    console.log('响应数据:', JSON.stringify(result.data).substring(0, 200) + '...');
  } else {
    console.log(`❌ 状态码: ${result.statusCode}`);
    console.log(`❌ 错误信息: ${JSON.stringify(result.data)}`);
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('\n=== 系统设置API测试开始 ===\n');
  
  for (const endpoint of API_ENDPOINTS) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n=== 系统设置API测试完成 ===\n');
}

// 开始执行测试
runTests();
