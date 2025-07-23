import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * 初始化检查组件
 * 
 * 此组件用于检查系统是否需要初始化，并在需要时重定向到初始化页面
 * 应该在应用的根组件中使用
 */
const InitializationCheck = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // 获取API基础URL
        const API_BASE = process.env.REACT_APP_API_URL || '/api';
        
        // 检查初始化状态
        const response = await axios.get(`${API_BASE}/system/init-status`);
        const { initializationRequired } = response.data;
        
        // 如果需要初始化，重定向到初始化页面
        if (initializationRequired) {
          navigate('/initialize');
        }
      } catch (error) {
        console.error('Failed to check initialization status:', error);
        // 发生错误时，出于安全考虑，默认重定向到初始化页面
        navigate('/initialize');
      } finally {
        setChecking(false);
      }
    };
    
    checkInitialization();
  }, [navigate]);
  
  // 在检查过程中可以显示加载指示器
  if (checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>
          <h2>加载中...</h2>
          <p>正在检查系统状态</p>
        </div>
      </div>
    );
  }
  
  return children;
};

export default InitializationCheck;
