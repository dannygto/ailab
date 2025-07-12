const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { 
  checkInitializationRequired, 
  getInitializationConfig, 
  updateInitializationConfig, 
  resetInitialization 
} = require('../utils/initialization');

// 检查系统初始化状态
router.get('/init-status', async (req, res) => {
  try {
    // 获取初始化配置
    const config = await getInitializationConfig();
    const initRequired = await checkInitializationRequired();
    
    // 获取数据库连接字符串
    const dbUri = process.env.MONGODB_URI;
    
    // 初始化状态
    const status = {
      initializationRequired: initRequired,
      environment: config.steps.environment,
      database: config.steps.database,
      initialData: config.steps.initialData,
      adminAccount: config.steps.adminAccount,
      systemConfig: config.steps.systemConfig
    };
    
    // 如果配置显示未初始化，检查实际状态
    if (initRequired) {
      // 检查数据库连接
      try {
        const client = new MongoClient(dbUri);
        await client.connect();
        
        // 检查初始数据
        const db = client.db();
        const schoolsCount = await db.collection('schools').countDocuments();
        const adminCount = await db.collection('users').countDocuments({ role: 'admin' });
        const configCount = await db.collection('system_config').countDocuments();
        
        // 更新状态
        status.database = true;
        status.initialData = schoolsCount > 0;
        status.adminAccount = adminCount > 0;
        status.systemConfig = configCount > 0;
        
        // 更新配置文件以反映实际状态
        await updateInitializationConfig({
          steps: {
            environment: true,
            database: true,
            initialData: status.initialData,
            adminAccount: status.adminAccount,
            systemConfig: status.systemConfig
          }
        });
        
        await client.close();
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        status.database = false;
      }
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error checking init status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 初始化环境
router.post('/initialize/environment', async (req, res) => {
  try {
    // 在真实应用中，这里可以做更多的环境检查
    // 例如检查Node.js版本、必要的系统依赖等
    
    await updateInitializationConfig({
      steps: {
        environment: true
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Environment initialization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 初始化数据库
router.post('/initialize/database', async (req, res) => {
  try {
    const dbUri = process.env.MONGODB_URI;
    
    // 连接数据库
    const client = new MongoClient(dbUri);
    await client.connect();
    
    // 创建必要的集合
    const db = client.db();
    const collections = ['users', 'schools', 'experiments', 'reports', 'system_config'];
    
    for (const collection of collections) {
      // 检查集合是否存在
      const collExists = await db.listCollections({ name: collection }).hasNext();
      if (!collExists) {
        await db.createCollection(collection);
      }
    }
    
    await client.close();
    
    await updateInitializationConfig({
      steps: {
        database: true
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 初始化基础数据
router.post('/initialize/data', async (req, res) => {
  try {
    const dbUri = process.env.MONGODB_URI;
    
    // 连接数据库
    const client = new MongoClient(dbUri);
    await client.connect();
    
    const db = client.db();
    
    // 初始化学校数据
    const schoolsCollection = db.collection('schools');
    const schoolsCount = await schoolsCollection.countDocuments();
    
    if (schoolsCount === 0) {
      // 添加示例学校
      const schoolsData = [
        {
          name: "示范第一实验学校",
          code: "SFYS001",
          address: "北京市海淀区学院路123号",
          contactPerson: "张校长",
          phone: "010-12345678",
          email: "principal@school1.edu.cn",
          type: "public",
          level: "K12",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "未来科技实验学校",
          code: "WKYS002",
          address: "上海市浦东新区张江高科技园区789号",
          contactPerson: "李校长",
          phone: "021-87654321",
          email: "principal@school2.edu.cn",
          type: "private",
          level: "K12",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "创新实验中学",
          code: "CXZX003",
          address: "广州市天河区天河路456号",
          contactPerson: "王校长",
          phone: "020-56781234",
          email: "principal@school3.edu.cn",
          type: "public",
          level: "middle",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await schoolsCollection.insertMany(schoolsData);
    }
    
    // 初始化系统配置
    const configCollection = db.collection('system_config');
    const configCount = await configCollection.countDocuments();
    
    if (configCount === 0) {
      await configCollection.insertOne({
        siteName: "AI实验平台",
        siteDescription: "人工智能实验教学平台",
        maintenanceMode: false,
        allowRegistration: true,
        defaultExperimentDuration: 45, // 分钟
        maxFileUploadSize: 50, // MB
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await client.close();
    
    await updateInitializationConfig({
      steps: {
        initialData: true
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Data initialization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建管理员账户
router.post('/create-admin', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证输入
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: '所有字段都是必填的' });
    }
    
    const dbUri = process.env.MONGODB_URI;
    
    // 连接数据库
    const client = new MongoClient(dbUri);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // 检查用户名或邮箱是否已存在
    const existingUser = await usersCollection.findOne({
      $or: [
        { username },
        { email }
      ]
    });
    
    if (existingUser) {
      await client.close();
      return res.status(400).json({ success: false, message: '用户名或邮箱已被使用' });
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建管理员用户
    const newAdmin = {
      username,
      password: hashedPassword,
      email,
      role: 'admin',
      firstName: '管理员',
      lastName: '用户',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await usersCollection.insertOne(newAdmin);
    
    // 更新系统配置，标记初始化完成
    const configCollection = db.collection('system_config');
    await configCollection.updateOne(
      {},
      { $set: { initialized: true, initializedAt: new Date() } }
    );
    
    await client.close();
    
    await updateInitializationConfig({
      steps: {
        adminAccount: true,
        systemConfig: true
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 重置初始化状态（仅用于测试和开发）
router.post('/reset-initialization', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      success: false, 
      message: '生产环境不允许此操作' 
    });
  }
  
  try {
    const config = await resetInitialization();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Reset initialization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
