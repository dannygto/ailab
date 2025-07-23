/**
 * 数据库索引优化脚本
 *
 * 该脚本用于优化MongoDB数据库索引，提高查询性能
 * 主要针对高频查询和大数据量集合添加适当的索引
 *
 * 使用方法:
 * 1. 确保已连接到MongoDB
 * 2. 执行 node db-index-optimizer.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// 性能监控记录
const performanceLog = [];

// 定义MongoDB连接URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ailab';

// 记录执行时间的工具函数
const measureQueryTime = async (queryName, queryFn) => {
  console.log(`执行查询: ${queryName}`);
  const startTime = Date.now();
  try {
    await queryFn();
    const endTime = Date.now();
    const duration = endTime - startTime;
    performanceLog.push({
      query: queryName,
      duration,
      timestamp: new Date().toISOString()
    });
    console.log(`查询 ${queryName} 执行时间: ${duration}ms`);
    return duration;
  } catch (error) {
    console.error(`查询 ${queryName} 执行失败:`, error);
    throw error;
  }
};

// 运行测试查询
const runTestQueries = async (models) => {
  const { Experiment, Device, Team, User, Template, Activity } = models;

  // 用户查询测试
  await measureQueryTime('查询所有用户', async () => {
    await User.find({}).limit(100);
  });

  await measureQueryTime('按用户名查询', async () => {
    await User.find({ name: /admin/ });
  });

  // 设备查询测试
  await measureQueryTime('查询所有设备', async () => {
    await Device.find({}).limit(100);
  });

  await measureQueryTime('按设备状态查询', async () => {
    await Device.find({ status: 'online' });
  });

  // 实验查询测试
  await measureQueryTime('查询所有实验', async () => {
    await Experiment.find({}).limit(100);
  });

  await measureQueryTime('按创建者查询实验', async () => {
    const users = await User.find({}).limit(5);
    if (users.length > 0) {
      await Experiment.find({ creator: users[0]._id });
    }
  });

  // 团队查询测试
  await measureQueryTime('查询所有团队', async () => {
    await Team.find({}).limit(100);
  });

  // 活动记录查询测试
  await measureQueryTime('查询团队活动记录', async () => {
    const teams = await Team.find({}).limit(5);
    if (teams.length > 0) {
      await Activity.find({ team: teams[0]._id }).sort({ createdAt: -1 }).limit(50);
    }
  });
};

// 创建索引
const createIndexes = async (models) => {
  console.log('开始创建索引...');

  try {
    // 用户集合索引
    await models.User.collection.createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { name: 1 }, background: true },
      { key: { createdAt: -1 }, background: true }
    ]);
    console.log('用户集合索引创建成功');

    // 设备集合索引
    await models.Device.collection.createIndexes([
      { key: { name: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { lastSeen: -1 }, background: true },
      { key: { type: 1, status: 1 }, background: true }
    ]);
    console.log('设备集合索引创建成功');

    // 实验集合索引
    await models.Experiment.collection.createIndexes([
      { key: { creator: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { template: 1 }, background: true },
      { key: { devices: 1 }, background: true },
      { key: { tags: 1 }, background: true }
    ]);
    console.log('实验集合索引创建成功');

    // 模板集合索引
    await models.Template.collection.createIndexes([
      { key: { creator: 1 }, background: true },
      { key: { category: 1 }, background: true },
      { key: { isPublic: 1 }, background: true },
      { key: { tags: 1 }, background: true }
    ]);
    console.log('模板集合索引创建成功');

    // 团队集合索引
    await models.Team.collection.createIndexes([
      { key: { 'members.user': 1 }, background: true },
      { key: { createdBy: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { 'settings.isPrivate': 1 }, background: true }
    ]);
    console.log('团队集合索引创建成功');

    // 活动记录集合索引 (已在模型中定义，这里确认一下)
    await models.Activity.collection.createIndexes([
      { key: { team: 1, createdAt: -1 }, background: true },
      { key: { team: 1, user: 1, createdAt: -1 }, background: true },
      { key: { team: 1, resourceType: 1, resourceId: 1 }, background: true },
      { key: { activityType: 1 }, background: true }
    ]);
    console.log('活动记录集合索引创建成功');

    // 权限集合索引
    await models.Permission.collection.createIndexes([
      { key: { user: 1 }, background: true },
      { key: { resource: 1, resourceType: 1 }, background: true },
      { key: { action: 1 }, background: true },
      { key: { user: 1, resource: 1, resourceType: 1, action: 1 }, unique: true, background: true }
    ]);
    console.log('权限集合索引创建成功');

    console.log('所有索引创建完成！');
  } catch (error) {
    console.error('创建索引时出错:', error);
    throw error;
  }
};

// 获取索引信息
const getIndexInfo = async (models) => {
  console.log('获取集合索引信息...');
  const indexInfo = {};

  for (const [modelName, model] of Object.entries(models)) {
    const indexes = await model.collection.indexes();
    indexInfo[modelName] = indexes;
    console.log(`${modelName}集合的索引:`, indexes.length);
  }

  return indexInfo;
};

// 分析查询性能
const analyzePerformance = async (models) => {
  console.log('开始性能分析...');

  // 运行测试查询 - 优化前
  console.log('运行优化前测试查询...');
  await runTestQueries(models);
  const beforeOptimization = [...performanceLog];
  performanceLog.length = 0;

  // 创建索引
  await createIndexes(models);

  // 运行测试查询 - 优化后
  console.log('运行优化后测试查询...');
  await runTestQueries(models);
  const afterOptimization = [...performanceLog];

  // 计算性能提升
  const performanceReport = beforeOptimization.map((before, index) => {
    const after = afterOptimization[index];
    const improvement = before.duration > 0
      ? ((before.duration - after.duration) / before.duration * 100).toFixed(2)
      : 0;

    return {
      query: before.query,
      beforeMs: before.duration,
      afterMs: after.duration,
      improvementPercent: `${improvement}%`
    };
  });

  return performanceReport;
};

// 保存性能报告
const savePerformanceReport = (report) => {
  const reportPath = path.join(__dirname, '../reports/db-performance-report.json');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    reportPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      report
    }, null, 2)
  );

  console.log(`性能报告已保存到: ${reportPath}`);
};

// 主函数
const main = async () => {
  console.log('开始数据库索引优化...');
  console.log(`连接到数据库: ${MONGODB_URI}`);

  try {
    // 连接到MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 导入模型
    const models = {
      User: mongoose.model('User'),
      Device: mongoose.model('Device'),
      Experiment: mongoose.model('Experiment'),
      Template: mongoose.model('Template'),
      Team: mongoose.model('Team'),
      Activity: mongoose.model('Activity'),
      Permission: mongoose.model('Permission')
    };

    // 获取优化前的索引信息
    const beforeIndexInfo = await getIndexInfo(models);

    // 分析性能并创建索引
    const performanceReport = await analyzePerformance(models);

    // 获取优化后的索引信息
    const afterIndexInfo = await getIndexInfo(models);

    // 保存性能报告
    savePerformanceReport({
      performance: performanceReport,
      indexesBefore: beforeIndexInfo,
      indexesAfter: afterIndexInfo
    });

    console.log('数据库索引优化完成！');
  } catch (error) {
    console.error('索引优化失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
};

// 执行主函数
main().catch(console.error);
