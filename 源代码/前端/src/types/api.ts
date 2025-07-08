/**
 * api服务接口定义
 */
export interface apiService {
  /**
   * 发送GET请求
   */
  get<T>(url: string, params?: any): Promise<T>;
  
  /**
   * 发送POST请求
   */
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  
  /**
   * 发送PUT请求
   */
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  
  /**
   * 发送DELETE请求
   */
  delete<T>(url: string, config?: any): Promise<T>;
}
