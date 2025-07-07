#!/usr/bin/env node

/**
 * 实验控制API测试脚本
 * 测试实验相关的API端点
 */

const http = require('http');

// 测试配置
const PORT = 3002;
const HOST = 'localhost';

// 测试用实验ID
let TEST_EXPERIMENT_ID = null;

// 测试API端点
const API_ENDPOINTS = [
  // 实验创建和获取
  { 
    url: '/api/experiments', 
    method: 'POST', 
    description: '创建实验',
    body: {
      title: '测试实验',
      description: '这是一个API测试创建的实验',
      type: 'test'
    },
    handler: (data) => {
      if (data.success && data.data && data.data.id) {
        TEST_EXPERIMENT_ID = data.data.id;
        console.log(`✅ 保存了测试实验ID: ${TEST_EXPERIMENT_ID}`);
      }
    }
  },
  
  // 实验列表
  { 
    url: '/api/experiments', 
    method: 'GET', 
    description: '获取实验列表'
  },
  
  // 实验详情
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}`, 
    method: 'GET', 
    description: '获取实验详情',
    skipIfNoId: true
  },
  
  // 实验控制
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}/start`, 
    method: 'POST', 
    description: '启动实验',
    skipIfNoId: true
  },
  
  // 实验执行状态
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}/execution`, 
    method: 'GET', 
    description: '获取实验执行状态',
    skipIfNoId: true
  },
  
  // 实验日志
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}/logs`, 
    method: 'GET', 
    description: '获取实验日志',
    skipIfNoId: true
  },
  
  // 实验指标
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}/metrics`, 
    method: 'GET', 
    description: '获取实验指标',
    skipIfNoId: true
  },
  
  // 停止实验
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}/stop`, 
    method: 'POST', 
    description: '停止实验',
    skipIfNoId: true
  },
  
  // 删除实验
  { 
    url: () => `/api/experiments/${TEST_EXPERIMENT_ID}`, 
    method: 'DELETE', 
    description: '删除实验',
    skipIfNoId: true
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
  // 检查是否需要跳过此测试
  if (endpoint.skipIfNoId && !TEST_EXPERIMENT_ID) {
    console.log(`\n⚠️ 跳过测试: ${endpoint.description} (需要实验ID但未设置)`);
    return;
  }
  
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
    
    // 如果有自定义处理函数
    if (endpoint.handler) {
      endpoint.handler(result.data);
    }
  } else {
    console.log(`❌ 状态码: ${result.statusCode}`);
    console.log(`❌ 错误信息: ${JSON.stringify(result.data)}`);
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('\n=== 实验控制API测试开始 ===\n');
  
  for (const endpoint of API_ENDPOINTS) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n=== 实验控制API测试完成 ===\n');
}

// 开始执行测试
runTests();
