// 简单的API连接测试
const testApiConnection = async () => {
  try {
    // console.log removed
    
    // 直接使用fetch测试
    const response = await fetch('http://localhost:3002/api/health');
    const data = await response.json();
    
    // console.log removed
    return true;
  } catch (error) {
    console.error('API连接失败:', error);
    return false;
  }
};

// 执行测试
testApiConnection();

