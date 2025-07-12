/**
 * 生产环境数据库初始化脚本
 * 
 * 功能：
 * 1. 创建必要的数据库集合
 * 2. 初始化系统角色和权限
 * 3. 创建初始管理员账号
 * 4. 导入基础数据（默认校区、基础模板等）
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 环境变量配置
require('dotenv').config({ path: path.join(__dirname, '../../配置/环境配置/.env.production') });

// 数据库配置
const config = {
  // 从环境变量读取数据库连接信息，使用默认值作为备选
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aicam',
  adminUser: {
    username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'admin@2025',
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@aicam.example.com',
    name: '系统管理员'
  },
  defaultSchool: {
    name: '总校区',
    code: 'HQ',
    address: '北京市海淀区中关村',
    status: 'active'
  },
  // 是否强制执行（覆盖现有数据）
  forceInitialize: process.argv.includes('--force')
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logPrefix = {
    info: '📄',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[type] || '📄';
  
  console.log(`${logPrefix} [${timestamp}] ${message}`);
}

// 记录到文件
function logToFile(message, type = 'info') {
  const logDir = path.join(__dirname, '../../logs');
  
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'db-initialization.log');
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  fs.appendFileSync(logFile, logLine);
}

// 记录消息
function logMessage(message, type = 'info') {
  log(message, type);
  logToFile(message, type);
}

// 初始化数据库连接
async function connectToDatabase() {
  logMessage('连接到数据库...');
  
  try {
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    logMessage('数据库连接成功', 'success');
    
    const db = client.db();
    return { client, db };
  } catch (error) {
    logMessage(`数据库连接失败: ${error.message}`, 'error');
    throw error;
  }
}

// 检查数据库是否已初始化
async function checkDatabaseInitialized(db) {
  try {
    const usersCollection = db.collection('users');
    const adminUser = await usersCollection.findOne({ username: config.adminUser.username });
    
    if (adminUser) {
      if (config.forceInitialize) {
        logMessage('检测到现有数据，但由于指定了--force参数，将继续初始化', 'warning');
        return false;
      } else {
        logMessage('数据库已初始化，发现管理员账号', 'warning');
        return true;
      }
    }
    
    logMessage('数据库未初始化，开始初始化过程');
    return false;
  } catch (error) {
    logMessage(`检查数据库状态失败: ${error.message}`, 'error');
    return false;
  }
}

// 创建必要的集合
async function createCollections(db) {
  logMessage('创建必要的数据库集合...');
  
  const requiredCollections = [
    'users',            // 用户集合
    'roles',            // 角色集合
    'permissions',      // 权限集合
    'schools',          // 校区集合
    'experiments',      // 实验集合
    'templates',        // 模板集合
    'resources',        // 资源集合
    'devices',          // 设备集合
    'logs',             // 日志集合
    'settings',         // 系统设置
    'notifications'     // 通知集合
  ];
  
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map(c => c.name);
  
  for (const collectionName of requiredCollections) {
    if (!existingCollectionNames.includes(collectionName)) {
      await db.createCollection(collectionName);
      logMessage(`创建集合: ${collectionName}`, 'success');
    } else {
      logMessage(`集合已存在: ${collectionName}`, 'info');
    }
  }
  
  logMessage('所有必要集合已创建', 'success');
}

// 初始化系统角色和权限
async function initializeRolesAndPermissions(db) {
  logMessage('初始化系统角色和权限...');
  
  // 基本权限定义
  const basicPermissions = [
    { code: 'dashboard:view', name: '查看仪表盘', description: '允许用户查看系统仪表盘' },
    { code: 'experiments:view', name: '查看实验', description: '允许用户查看实验列表和详情' },
    { code: 'experiments:create', name: '创建实验', description: '允许用户创建新实验' },
    { code: 'experiments:edit', name: '编辑实验', description: '允许用户编辑实验' },
    { code: 'experiments:delete', name: '删除实验', description: '允许用户删除实验' },
    { code: 'templates:view', name: '查看模板', description: '允许用户查看模板列表和详情' },
    { code: 'templates:create', name: '创建模板', description: '允许用户创建新模板' },
    { code: 'templates:edit', name: '编辑模板', description: '允许用户编辑模板' },
    { code: 'templates:delete', name: '删除模板', description: '允许用户删除模板' },
    { code: 'resources:view', name: '查看资源', description: '允许用户查看资源列表和详情' },
    { code: 'resources:upload', name: '上传资源', description: '允许用户上传新资源' },
    { code: 'resources:delete', name: '删除资源', description: '允许用户删除资源' },
    { code: 'devices:view', name: '查看设备', description: '允许用户查看设备列表和详情' },
    { code: 'devices:control', name: '控制设备', description: '允许用户控制设备' },
    { code: 'settings:view', name: '查看设置', description: '允许用户查看系统设置' },
    { code: 'settings:edit', name: '编辑设置', description: '允许用户编辑系统设置' },
    { code: 'users:view', name: '查看用户', description: '允许用户查看用户列表和详情' },
    { code: 'users:create', name: '创建用户', description: '允许用户创建新用户' },
    { code: 'users:edit', name: '编辑用户', description: '允许用户编辑用户信息' },
    { code: 'users:delete', name: '删除用户', description: '允许用户删除用户' },
    { code: 'roles:manage', name: '管理角色', description: '允许用户管理角色和权限' },
    { code: 'schools:view', name: '查看校区', description: '允许用户查看校区列表和详情' },
    { code: 'schools:create', name: '创建校区', description: '允许用户创建新校区' },
    { code: 'schools:edit', name: '编辑校区', description: '允许用户编辑校区信息' },
    { code: 'schools:delete', name: '删除校区', description: '允许用户删除校区' }
  ];
  
  // 系统角色定义
  const systemRoles = [
    {
      code: 'admin',
      name: '系统管理员',
      description: '拥有系统所有权限的超级管理员',
      permissions: basicPermissions.map(p => p.code),
      isSystem: true
    },
    {
      code: 'school_admin',
      name: '校区管理员',
      description: '管理特定校区的管理员',
      permissions: basicPermissions.map(p => p.code).filter(p => !p.startsWith('schools:')),
      isSystem: true
    },
    {
      code: 'teacher',
      name: '教师',
      description: '教师用户，可以创建和管理实验',
      permissions: [
        'dashboard:view',
        'experiments:view', 'experiments:create', 'experiments:edit', 'experiments:delete',
        'templates:view', 'templates:create', 'templates:edit',
        'resources:view', 'resources:upload',
        'devices:view', 'devices:control'
      ],
      isSystem: true
    },
    {
      code: 'student',
      name: '学生',
      description: '学生用户，可以参与实验',
      permissions: [
        'dashboard:view',
        'experiments:view',
        'templates:view',
        'resources:view',
        'devices:view'
      ],
      isSystem: true
    }
  ];
  
  // 创建权限
  const permissionsCollection = db.collection('permissions');
  
  for (const permission of basicPermissions) {
    const existingPermission = await permissionsCollection.findOne({ code: permission.code });
    
    if (!existingPermission) {
      permission.createdAt = new Date();
      permission.updatedAt = new Date();
      await permissionsCollection.insertOne(permission);
      logMessage(`创建权限: ${permission.name}`, 'success');
    } else {
      logMessage(`权限已存在: ${permission.name}`, 'info');
    }
  }
  
  // 创建角色
  const rolesCollection = db.collection('roles');
  
  for (const role of systemRoles) {
    const existingRole = await rolesCollection.findOne({ code: role.code });
    
    if (!existingRole) {
      role.createdAt = new Date();
      role.updatedAt = new Date();
      await rolesCollection.insertOne(role);
      logMessage(`创建角色: ${role.name}`, 'success');
    } else {
      // 更新现有角色的权限
      await rolesCollection.updateOne(
        { code: role.code },
        { $set: { permissions: role.permissions, updatedAt: new Date() } }
      );
      logMessage(`更新角色权限: ${role.name}`, 'info');
    }
  }
  
  logMessage('角色和权限初始化完成', 'success');
}

// 创建初始管理员账号
async function createAdminUser(db) {
  logMessage('创建初始管理员账号...');
  
  const usersCollection = db.collection('users');
  const rolesCollection = db.collection('roles');
  
  // 获取管理员角色ID
  const adminRole = await rolesCollection.findOne({ code: 'admin' });
  
  if (!adminRole) {
    throw new Error('管理员角色不存在，请先初始化角色');
  }
  
  // 检查管理员是否已存在
  const existingAdmin = await usersCollection.findOne({ username: config.adminUser.username });
  
  if (existingAdmin) {
    if (config.forceInitialize) {
      // 删除现有管理员
      await usersCollection.deleteOne({ username: config.adminUser.username });
      logMessage('删除现有管理员账号', 'warning');
    } else {
      logMessage('管理员账号已存在，跳过创建', 'info');
      return;
    }
  }
  
  // 创建新管理员用户
  const hashedPassword = await bcrypt.hash(config.adminUser.password, 10);
  
  const adminUser = {
    username: config.adminUser.username,
    password: hashedPassword,
    email: config.adminUser.email,
    name: config.adminUser.name,
    roleId: adminRole._id,
    status: 'active',
    isSystemAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await usersCollection.insertOne(adminUser);
  logMessage(`管理员账号创建成功: ${config.adminUser.username}`, 'success');
}

// 创建默认校区
async function createDefaultSchool(db) {
  logMessage('创建默认校区...');
  
  const schoolsCollection = db.collection('schools');
  
  // 检查默认校区是否已存在
  const existingSchool = await schoolsCollection.findOne({ code: config.defaultSchool.code });
  
  if (existingSchool) {
    logMessage('默认校区已存在，跳过创建', 'info');
    return;
  }
  
  // 创建默认校区
  const defaultSchool = {
    ...config.defaultSchool,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await schoolsCollection.insertOne(defaultSchool);
  logMessage(`默认校区创建成功: ${config.defaultSchool.name}`, 'success');
}

// 导入基础系统设置
async function importSystemSettings(db) {
  logMessage('导入基础系统设置...');
  
  const settingsCollection = db.collection('settings');
  
  // 基础系统设置
  const systemSettings = [
    {
      key: 'system.name',
      value: 'AICAM智能实验平台',
      description: '系统名称',
      category: 'system',
      isPublic: true
    },
    {
      key: 'system.version',
      value: '1.0.0',
      description: '系统版本',
      category: 'system',
      isPublic: true
    },
    {
      key: 'system.logo',
      value: '/static/logo.png',
      description: '系统Logo',
      category: 'system',
      isPublic: true
    },
    {
      key: 'security.passwordPolicy',
      value: JSON.stringify({
        minLength: 8,
        requireNumbers: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSpecialChars: true
      }),
      description: '密码策略',
      category: 'security',
      isPublic: false
    },
    {
      key: 'notification.email',
      value: JSON.stringify({
        enabled: false,
        smtpServer: '',
        smtpPort: 587,
        username: '',
        password: '',
        fromEmail: 'noreply@aicam.example.com'
      }),
      description: '邮件通知设置',
      category: 'notification',
      isPublic: false
    }
  ];
  
  for (const setting of systemSettings) {
    const existingSetting = await settingsCollection.findOne({ key: setting.key });
    
    if (!existingSetting) {
      setting.createdAt = new Date();
      setting.updatedAt = new Date();
      await settingsCollection.insertOne(setting);
      logMessage(`创建系统设置: ${setting.key}`, 'success');
    } else {
      logMessage(`系统设置已存在: ${setting.key}`, 'info');
    }
  }
  
  logMessage('基础系统设置导入完成', 'success');
}

// 主函数：初始化数据库
async function initializeDatabase() {
  let client;
  
  try {
    // 连接数据库
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;
    
    // 检查数据库是否已初始化
    const isInitialized = await checkDatabaseInitialized(db);
    
    if (isInitialized && !config.forceInitialize) {
      logMessage('数据库已初始化，如需重新初始化请使用--force参数', 'warning');
      return;
    }
    
    // 执行初始化步骤
    await createCollections(db);
    await initializeRolesAndPermissions(db);
    await createAdminUser(db);
    await createDefaultSchool(db);
    await importSystemSettings(db);
    
    logMessage('数据库初始化成功完成！', 'success');
    
  } catch (error) {
    logMessage(`数据库初始化失败: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // 关闭数据库连接
    if (client) {
      await client.close();
      logMessage('数据库连接已关闭');
    }
  }
}

// 执行初始化
initializeDatabase();
