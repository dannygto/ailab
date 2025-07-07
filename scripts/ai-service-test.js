// ai-service-test.js - 测试增强型AI服务接口
// 用法: node ai-service-test.js

const fetch = require('node-fetch');
const readline = require('readline');

// 创建readline接口，用于交互式测试
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// 打印带颜色的消息
function printColored(message, color) {
  console.log(color + message + colors.reset);
}

// 打印标题
function printHeader(title) {
  console.log('\n' + colors.bg.blue + colors.fg.white + ' ' + title + ' ' + colors.reset + '\n');
}

// 打印成功消息
function printSuccess(message) {
  console.log(colors.fg.green + '✓ ' + message + colors.reset);
}

// 打印错误消息
function printError(message) {
  console.log(colors.fg.red + '✗ ' + message + colors.reset);
}

// 打印警告消息
function printWarning(message) {
  console.log(colors.fg.yellow + '⚠ ' + message + colors.reset);
}

// 打印信息消息
function printInfo(message) {
  console.log(colors.fg.cyan + 'ℹ ' + message + colors.reset);
}

// 发送API请求
async function sendRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    printInfo(`发送 ${method} 请求到 ${url}`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      printSuccess('请求成功');
      return data;
    } else {
      printError(`请求失败: ${data.message || response.statusText}`);
      return data;
    }
  } catch (error) {
    printError(`请求错误: ${error.message}`);
    throw error;
  }
}

// 测试AI服务健康状态
async function testAIServiceHealth() {
  printHeader('测试AI服务健康状态');
  try {
    const result = await sendRequest('/ai/health');
    console.log('健康状态结果:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    printError(`健康检查失败: ${error.message}`);
    return null;
  }
}

// 测试文本分类
async function testTextClassification() {
  printHeader('测试文本分类');
  
  const text = '这个实验探索了光合作用速率与光照强度的关系。研究发现，在适宜温度下，光合作用速率随光照强度增加而增加，直到达到饱和点。';
  
  try {
    const result = await sendRequest('/ai/text-classification', 'POST', {
      text,
      multiLabel: false
    });
    console.log('文本分类结果:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    printError(`文本分类失败: ${error.message}`);
    return null;
  }
}

// 测试文本摘要
async function testTextSummary() {
  printHeader('测试文本摘要');
  
  const text = `光合作用是绿色植物利用光能将二氧化碳和水转化为有机物的过程。这个实验探索了光合作用速率与光照强度的关系。
我们使用了不同的光照强度，从100到1000μmol/(m²·s)，测量了植物的光合作用速率。
实验数据显示，在温度保持在25°C的条件下，光合作用速率随光照强度的增加而增加，直到光照强度达到约800μmol/(m²·s)时，光合作用速率达到饱和。
这表明，在光照强度较低时，光是限制光合作用的主要因素；而当光照强度超过饱和点后，其他因素如二氧化碳浓度或酶的活性可能成为限制因素。
这项研究有助于理解植物的生长条件优化，对农业生产具有重要意义。`;
  
  try {
    const result = await sendRequest('/ai/text-summary', 'POST', {
      text,
      maxLength: 100,
      format: 'paragraph'
    });
    console.log('文本摘要结果:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    printError(`文本摘要失败: ${error.message}`);
    return null;
  }
}

// 测试语义搜索
async function testSemanticSearch() {
  printHeader('测试语义搜索');
  
  const query = '光照对植物生长的影响';
  
  try {
    const result = await sendRequest('/ai/semantic-search', 'POST', {
      query,
      limit: 5,
      includeMetadata: true
    });
    console.log('语义搜索结果:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    printError(`语义搜索失败: ${error.message}`);
    return null;
  }
}

// 显示菜单并处理用户选择
function showMenu() {
  printHeader('AICAM AI服务测试工具');
  console.log('请选择要测试的功能:');
  console.log('1. 测试AI服务健康状态');
  console.log('2. 测试文本分类');
  console.log('3. 测试文本摘要');
  console.log('4. 测试语义搜索');
  console.log('5. 运行所有测试');
  console.log('0. 退出');
  
  rl.question('\n请输入选项编号: ', async (answer) => {
    switch (answer.trim()) {
      case '1':
        await testAIServiceHealth();
        setTimeout(showMenu, 1000);
        break;
      case '2':
        await testTextClassification();
        setTimeout(showMenu, 1000);
        break;
      case '3':
        await testTextSummary();
        setTimeout(showMenu, 1000);
        break;
      case '4':
        await testSemanticSearch();
        setTimeout(showMenu, 1000);
        break;
      case '5':
        printHeader('运行所有测试');
        await testAIServiceHealth();
        await testTextClassification();
        await testTextSummary();
        await testSemanticSearch();
        setTimeout(showMenu, 1000);
        break;
      case '0':
        printInfo('谢谢使用，再见！');
        rl.close();
        break;
      default:
        printWarning('无效的选项，请重新选择');
        setTimeout(showMenu, 500);
        break;
    }
  });
}

// 启动测试工具
printHeader('AICAM增强型AI服务接口测试工具');
printInfo('版本: 1.0.0');
printInfo('日期: 2025-07-05');
printInfo(`使用的API基础URL: ${API_BASE_URL}`);
console.log('\n按回车键继续...');

rl.question('', () => {
  showMenu();
});

// 处理退出
rl.on('close', () => {
  process.exit(0);
});
