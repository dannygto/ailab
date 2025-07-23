/**
 * 前端性能监控工具
 *
 * 该工具用于监控和分析前端应用的性能指标，帮助识别性能瓶颈
 * 可以收集页面加载时间、组件渲染时间、API请求时间等关键指标
 */

import { useEffect, useState, useRef } from 'react';

// 性能指标类型
export enum PerformanceMetricType {
  PAGE_LOAD = 'page_load',
  COMPONENT_RENDER = 'component_render',
  API_REQUEST = 'api_request',
  RESOURCE_LOAD = 'resource_load',
  USER_INTERACTION = 'user_interaction',
  CUSTOM = 'custom'
}

// 性能指标接口
export interface PerformanceMetric {
  type: PerformanceMetricType;
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

// 全局性能数据存储
const performanceMetrics: PerformanceMetric[] = [];

/**
 * 记录性能指标
 */
export const recordPerformanceMetric = (
  type: PerformanceMetricType,
  name: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  const metric: PerformanceMetric = {
    type,
    name,
    startTime: Date.now() - duration,
    duration,
    metadata
  };

  performanceMetrics.push(metric);

  // 如果开启了调试模式，在控制台输出性能指标
  if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug_performance') === 'true') {
    console.log(`[性能] ${type}: ${name} - ${duration.toFixed(2)}ms`, metadata);
  }

  // 如果达到一定数量，自动发送到服务器
  if (performanceMetrics.length >= 20) {
    sendPerformanceMetrics();
  }
};

/**
 * 发送性能指标到服务器
 */
export const sendPerformanceMetrics = async () => {
  if (performanceMetrics.length === 0) return;

  const metricsToSend = [...performanceMetrics];
  performanceMetrics.length = 0;

  try {
    // 避免在SSR环境中执行
    if (typeof window === 'undefined') return;

    const API_URL = process.env.REACT_APP_API_URL || '/api';

    await fetch(`${API_URL}/performance-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: metricsToSend,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href
      }),
      // 使用keepalive确保在页面关闭时也能发送
      keepalive: true
    });
  } catch (error) {
    // 发送失败时，将指标重新添加到队列中
    console.error('发送性能指标失败', error);
    performanceMetrics.push(...metricsToSend);
  }
};

/**
 * 测量函数执行时间的装饰器
 */
export const measurePerformance = (
  type: PerformanceMetricType = PerformanceMetricType.CUSTOM,
  name?: string
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const metricName = name || `${target.constructor.name}.${propertyKey}`;
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);

      // 处理异步函数
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          recordPerformanceMetric(type, metricName, endTime - startTime);
        });
      }

      // 处理同步函数
      const endTime = performance.now();
      recordPerformanceMetric(type, metricName, endTime - startTime);
      return result;
    };

    return descriptor;
  };
};

/**
 * 用于测量组件渲染性能的Hook
 */
export const useComponentPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    renderCount.current += 1;

    recordPerformanceMetric(
      PerformanceMetricType.COMPONENT_RENDER,
      componentName,
      renderTime,
      { renderCount: renderCount.current }
    );

    lastRenderTime.current = currentTime;

    return () => {
      // 组件卸载时记录
      if (renderCount.current > 0) {
        recordPerformanceMetric(
          PerformanceMetricType.COMPONENT_RENDER,
          `${componentName} (unmount)`,
          performance.now() - lastRenderTime.current,
          { totalRenderCount: renderCount.current }
        );
      }
    };
  });

  return { renderCount: renderCount.current };
};

/**
 * 用于测量API请求性能的Hook
 */
export const useApiPerformance = () => {
  const measureApiCall = async <T,>(
    apiCallFn: () => Promise<T>,
    name: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await apiCallFn();
      const endTime = performance.now();

      recordPerformanceMetric(
        PerformanceMetricType.API_REQUEST,
        name,
        endTime - startTime
      );

      return result;
    } catch (error) {
      const endTime = performance.now();

      recordPerformanceMetric(
        PerformanceMetricType.API_REQUEST,
        `${name} (error)`,
        endTime - startTime,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      throw error;
    }
  };

  return { measureApiCall };
};

/**
 * 初始化页面加载性能监控
 */
export const initPerformanceMonitoring = () => {
  // 确保只在客户端执行
  if (typeof window === 'undefined') return;

  // 页面加载完成时发送性能指标
  window.addEventListener('load', () => {
    // 使用Performance API获取页面加载指标
    if (performance && performance.timing) {
      const timing = performance.timing;

      // 计算关键性能指标
      const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
      const tcpTime = timing.connectEnd - timing.connectStart;
      const requestTime = timing.responseEnd - timing.requestStart;
      const domProcessingTime = timing.domComplete - timing.domLoading;
      const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      // 记录各项指标
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, 'DNS解析', dnsTime);
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, 'TCP连接', tcpTime);
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, '请求响应', requestTime);
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, 'DOM处理', domProcessingTime);
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, 'DOM内容加载', domContentLoadedTime);
      recordPerformanceMetric(PerformanceMetricType.PAGE_LOAD, '页面完全加载', loadTime);
    }

    // 发送首次加载的性能指标
    setTimeout(() => sendPerformanceMetrics(), 1000);
  });

  // 页面关闭前发送剩余的性能指标
  window.addEventListener('beforeunload', () => {
    sendPerformanceMetrics();
  });

  // 监听资源加载性能
  if (performance && performance.getEntriesByType) {
    // 获取已加载的资源
    const resources = performance.getEntriesByType('resource');

    for (const resource of resources) {
      if (resource instanceof PerformanceResourceTiming) {
        recordPerformanceMetric(
          PerformanceMetricType.RESOURCE_LOAD,
          resource.name.split('/').pop() || resource.name,
          resource.duration,
          {
            initiatorType: resource.initiatorType,
            size: resource.transferSize,
            url: resource.name
          }
        );
      }
    }

    // 监听未来的资源加载
    if (PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            recordPerformanceMetric(
              PerformanceMetricType.RESOURCE_LOAD,
              entry.name.split('/').pop() || entry.name,
              entry.duration,
              {
                initiatorType: (entry as PerformanceResourceTiming).initiatorType,
                size: (entry as PerformanceResourceTiming).transferSize,
                url: entry.name
              }
            );
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }
};

/**
 * 性能监控上下文提供者组件
 */
export const PerformanceMonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initPerformanceMonitoring();
      setIsInitialized(true);
    }

    return () => {
      // 页面卸载时发送剩余指标
      sendPerformanceMetrics();
    };
  }, [isInitialized]);

  return <>{children}</>;
};

// 导出所有性能监控工具
const PerformanceMonitoring = {
  recordPerformanceMetric,
  sendPerformanceMetrics,
  measurePerformance,
  useComponentPerformance,
  useApiPerformance,
  initPerformanceMonitoring,
  PerformanceMonitoringProvider
};

export default PerformanceMonitoring;
