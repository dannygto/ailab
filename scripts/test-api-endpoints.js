#!/usr/bin/env node

/**
 * API测试脚本
 * 测试前后端API对应问题修复
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002/api';

// 测试API端点
const API_ENDPOINTS = [
  // 实验相关API
  { url: '/experiments', method: 'GET', description: '获取实验列表' },
  
  // 设置相关API
  { url: '/settings', method: 'GET', description: '获取所有设置' },
  { url: '/settings/theme', method: 'GET', description: '获取主题设置' },
  { url: '/settings/data', method: 'GET', description: '获取数据设置' }
];

/**
 * 测试单个API端点
 */
function testEndpoint(endpoint) {
  console.log(`\n测试: ${endpoint.description} (${endpoint.method} ${endpoint.url})`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/api${endpoint.url}`,
      method: endpoint.method
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ 状态码: ${res.statusCode}`);
            console.log(`✅ 响应格式正确`);
            console.log('响应数据示例:', JSON.stringify(jsonData).substring(0, 150) + '...');
          } else {
            console.log(`❌ 状态码: ${res.statusCode}`);
            console.log(`❌ 错误信息: ${jsonData.error || JSON.stringify(jsonData)}`);
          }
        } catch (e) {
          console.log(`❌ 响应不是有效的JSON: ${e.message}`);
          console.log(`原始响应: ${data.substring(0, 150)}...`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('\n=== API 测试开始 ===\n');
  
  for (const endpoint of API_ENDPOINTS) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n=== API 测试完成 ===\n');
}

// 开始执行测试
runTests();
