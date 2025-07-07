#!/usr/bin/env node

/**
 * API综合测试脚本
 * 测试所有主要API端点
 */

const http = require('http');
const child_process = require('child_process');
const path = require('path');

// 清除终端
console.clear();

console.log(`
╭───────────────────────────────────────────────╮
│                                               │
│   AICAM 系统 API 综合测试                     │
│                                               │
│   测试时间: ${new Date().toLocaleString()}    │
│                                               │
╰───────────────────────────────────────────────╯
`);

// 测试脚本路径
const testScripts = [
  'test-api-endpoints.js',
  'test-experiment-api.js',
  'test-settings-api.js'
];

// 运行单个测试脚本
async function runTestScript(scriptName) {
  console.log(`\n\n📋 运行测试脚本: ${scriptName}...\n`);
  
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = child_process.spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ 测试脚本 ${scriptName} 成功完成！`);
      } else {
        console.log(`\n❌ 测试脚本 ${scriptName} 失败，退出代码: ${code}`);
      }
      resolve(code === 0);
    });
  });
}

// 运行所有测试脚本
async function runAllTests() {
  console.log('\n开始运行所有API测试...\n');
  
  let successCount = 0;
  
  for (const script of testScripts) {
    const success = await runTestScript(script);
    if (success) successCount++;
  }
  
  console.log(`\n\n测试完成汇总：成功 ${successCount}/${testScripts.length}`);
  
  if (successCount === testScripts.length) {
    console.log(`
╭───────────────────────────────────────────────╮
│                                               │
│   🎉 所有 API 测试全部通过！                  │
│                                               │
│   API 对应关系修复成功                        │
│                                               │
╰───────────────────────────────────────────────╯
    `);
  } else {
    console.log(`
╭───────────────────────────────────────────────╮
│                                               │
│   ⚠️ 部分 API 测试未通过                      │
│                                               │
│   请检查控制台输出查看详情                    │
│                                               │
╰───────────────────────────────────────────────╯
    `);
  }
}

// 开始执行测试
runAllTests();
