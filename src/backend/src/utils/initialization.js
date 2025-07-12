/**
 * 初始化配置文件
 * 
 * 此文件用于控制系统是否需要进入初始化流程
 * 当INITIALIZATION_REQUIRED设置为true时，系统会自动跳转到初始化页面
 */

const INITIALIZATION_FILE_PATH = process.env.INITIALIZATION_FILE_PATH || '/app/data/initialization.json';
const fs = require('fs');
const path = require('path');

/**
 * 检查系统是否需要初始化
 * @returns {Promise<boolean>} 是否需要初始化
 */
async function checkInitializationRequired() {
  try {
    // 确保目录存在
    const dirPath = path.dirname(INITIALIZATION_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 检查初始化文件是否存在
    if (!fs.existsSync(INITIALIZATION_FILE_PATH)) {
      // 文件不存在，创建默认配置，需要初始化
      const defaultConfig = {
        initialized: false,
        createdAt: new Date().toISOString(),
        steps: {
          environment: false,
          database: false,
          initialData: false,
          adminAccount: false,
          systemConfig: false
        }
      };
      
      fs.writeFileSync(INITIALIZATION_FILE_PATH, JSON.stringify(defaultConfig, null, 2));
      return true;
    }
    
    // 读取初始化文件
    const config = JSON.parse(fs.readFileSync(INITIALIZATION_FILE_PATH, 'utf8'));
    return !config.initialized;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    // 出错时默认需要初始化
    return true;
  }
}

/**
 * 获取初始化配置
 * @returns {Promise<Object>} 初始化配置
 */
async function getInitializationConfig() {
  try {
    if (!fs.existsSync(INITIALIZATION_FILE_PATH)) {
      await checkInitializationRequired();
    }
    
    return JSON.parse(fs.readFileSync(INITIALIZATION_FILE_PATH, 'utf8'));
  } catch (error) {
    console.error('Error getting initialization config:', error);
    return {
      initialized: false,
      createdAt: new Date().toISOString(),
      steps: {
        environment: false,
        database: false,
        initialData: false,
        adminAccount: false,
        systemConfig: false
      }
    };
  }
}

/**
 * 更新初始化配置
 * @param {Object} updates 要更新的配置
 * @returns {Promise<Object>} 更新后的配置
 */
async function updateInitializationConfig(updates) {
  try {
    const config = await getInitializationConfig();
    const newConfig = { ...config, ...updates };
    
    // 如果所有步骤都完成，标记整个初始化为完成
    if (updates.steps) {
      const { environment, database, initialData, adminAccount, systemConfig } = newConfig.steps;
      if (environment && database && initialData && adminAccount && systemConfig) {
        newConfig.initialized = true;
        newConfig.completedAt = new Date().toISOString();
      }
    }
    
    fs.writeFileSync(INITIALIZATION_FILE_PATH, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch (error) {
    console.error('Error updating initialization config:', error);
    throw error;
  }
}

/**
 * 重置初始化状态
 * @returns {Promise<Object>} 重置后的配置
 */
async function resetInitialization() {
  try {
    const defaultConfig = {
      initialized: false,
      createdAt: new Date().toISOString(),
      resetAt: new Date().toISOString(),
      steps: {
        environment: false,
        database: false,
        initialData: false,
        adminAccount: false,
        systemConfig: false
      }
    };
    
    fs.writeFileSync(INITIALIZATION_FILE_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  } catch (error) {
    console.error('Error resetting initialization:', error);
    throw error;
  }
}

module.exports = {
  checkInitializationRequired,
  getInitializationConfig,
  updateInitializationConfig,
  resetInitialization
};
