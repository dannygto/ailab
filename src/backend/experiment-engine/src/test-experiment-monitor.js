// test-experiment-monitor.js - 测试实验监控功能

const axios = require('axios');

// 模拟实验执行数据
const mockExecution = {
  id: 'exec-12345',
  experimentId: 'exp-6789',
  status: 'running',
  progress: 0,
  logs: [],
  metrics: {
    currentLoss: 0,
    currentAccuracy: 0,
    currentValLoss: 0, 
    currentValAccuracy: 0,
    timeElapsed: 0,
    eta: 0
  },
  startedAt: new Date(),
  updatedAt: new Date()
};

// API基础URL
const apiBaseUrl = 'http://localhost:3002/api';

// 模拟执行进度
let progress = 0;
let epoch = 0;
const totalEpochs = 10;

// 模拟实验执行过程
async function simulateExperiment() {
  console.log('开始模拟实验执行过程...');
  
  // 初始化实验执行
  await initExecution();
  
  // 模拟训练过程
  const interval = setInterval(async () => {
    // 更新进度
    progress += 2;
    mockExecution.progress = progress;
    
    if (progress % 10 === 0) {
      epoch++;
      mockExecution.metrics.currentEpoch = epoch;
      
      // 模拟指标变化
      mockExecution.metrics.currentLoss = 2 * Math.exp(-0.2 * epoch) + Math.random() * 0.1;
      mockExecution.metrics.currentAccuracy = 0.5 + 0.05 * epoch - Math.random() * 0.02;
      mockExecution.metrics.currentValLoss = 2.2 * Math.exp(-0.18 * epoch) + Math.random() * 0.15;
      mockExecution.metrics.currentValAccuracy = 0.48 + 0.048 * epoch - Math.random() * 0.03;
      mockExecution.metrics.timeElapsed = epoch * 30;
      mockExecution.metrics.eta = (totalEpochs - epoch) * 30;
      
      // 添加日志
      mockExecution.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `完成Epoch ${epoch}/${totalEpochs}, 损失: ${mockExecution.metrics.currentLoss.toFixed(4)}, 准确率: ${mockExecution.metrics.currentAccuracy.toFixed(4)}`
      });
      
      console.log(`模拟进度: ${progress}%, Epoch: ${epoch}/${totalEpochs}`);
    }
    
    // 偶尔添加一些警告日志
    if (progress % 23 === 0) {
      mockExecution.logs.push({
        timestamp: new Date(),
        level: 'warning',
        message: `学习率下降: 新学习率为 ${0.001 * Math.exp(-0.1 * epoch)}`
      });
    }
    
    // 更新时间
    mockExecution.updatedAt = new Date();
    
    // 向API发送更新
    await updateExecution();
    
    // 检查是否完成
    if (progress >= 100) {
      clearInterval(interval);
      mockExecution.status = 'completed';
      await finalizeExecution();
      console.log('模拟实验已完成!');
    }
  }, 2000);
}

// 初始化实验执行
async function initExecution() {
  try {
    const response = await axios.post(`${apiBaseUrl}/experiments/exec-12345/init`, mockExecution);
    console.log('实验执行初始化:', response.data);
  } catch (error) {
    console.error('初始化错误:', error.message);
    
    // 如果API不存在，则打印模拟数据
    console.log('使用模拟数据:', mockExecution);
  }
}

// 更新实验执行
async function updateExecution() {
  try {
    const response = await axios.put(`${apiBaseUrl}/experiments/exec-12345/update`, mockExecution);
    console.log('实验执行更新:', response.data);
  } catch (error) {
    // 忽略错误，仅用于测试
  }
}

// 完成实验执行
async function finalizeExecution() {
  try {
    mockExecution.status = 'completed';
    const response = await axios.put(`${apiBaseUrl}/experiments/exec-12345/finalize`, mockExecution);
    console.log('实验执行完成:', response.data);
  } catch (error) {
    console.error('完成错误:', error.message);
    
    // 如果API不存在，则打印最终状态
    console.log('最终状态:', mockExecution);
  }
}

// 启动模拟
simulateExperiment();
