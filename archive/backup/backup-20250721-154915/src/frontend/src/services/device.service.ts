import { 
  Device, 
  DeviceDataPoint, 
  DeviceCommand, 
  DeviceReservation, 
  devicesession, 
  GetdevicesParams, 
  GetDeviceDataParams, 
  SendDeviceCommandParams, 
  CreatedevicesessionParams, 
  CreateDeviceReservationParams, 
  GetDeviceReservationsParams, 
  DeviceMonitoringData 
} from '../types/devices';
import { apiService } from '../types/api';

/**
 * 设备管理服务类
 * 提供设备查询、控制、监控等功能
 */
export class deviceservice {
  private apiService: apiService;
  
  constructor(apiService: apiService) {
    this.apiService = apiService;
  }
  
  /**
   * 获取设备列表
   */
  async getdevices(params?: GetdevicesParams): Promise<Device[]> {
    try {
      const response = await this.apiService.get('/devices', params);
      // 确保返回数组
      if (!Array.isArray(response)) {
        console.warn('设备列表API返回数据格式错误，返回空数组');
        return [];
      }
      return response;
    } catch (error) {
      console.error('获取设备列表API调用失败:', error);
      // 返回模拟数据用于开发
      return [];
    }
  }
  
  /**
   * 获取设备详情
   */
  async getDeviceById(id: string): Promise<Device> {
    return this.apiService.get(`/devices/${id}`);
  }
  
  /**
   * 更新设备状态
   */
  async updatedevicestatus(id: string, status: string, metadata?: any): Promise<Device> {
    return this.apiService.put(`/devices/${id}/status`, { status, metadata });
  }
  
  /**
   * 发送设备命令
   */
  async sendCommand(deviceId: string, params: SendDeviceCommandParams): Promise<DeviceCommand> {
    return this.apiService.post(`/devices/${deviceId}/commands`, params);
  }
  
  /**
   * 获取设备命令历史
   */
  async getDeviceCommands(deviceId: string, limit?: number): Promise<DeviceCommand[]> {
    return this.apiService.get(`/devices/${deviceId}/commands`, { limit });
  }
  
  /**
   * 获取设备数据
   */
  async getDeviceData(deviceId: string, params?: GetDeviceDataParams): Promise<DeviceDataPoint[]> {
    return this.apiService.get(`/devices/${deviceId}/data`, params);
  }
  
  /**
   * 创建设备会话
   */
  async createSession(deviceId: string, params: CreatedevicesessionParams): Promise<devicesession> {
    return this.apiService.post(`/devices/${deviceId}/sessions`, params);
  }
  
  /**
   * 结束设备会话
   */
  async endSession(sessionId: string, notes?: string): Promise<devicesession> {
    return this.apiService.put(`/devices/sessions/${sessionId}/end`, { notes });
  }
  
  /**
   * 创建设备预约
   */
  async createReservation(deviceId: string, params: CreateDeviceReservationParams): Promise<DeviceReservation> {
    return this.apiService.post(`/devices/${deviceId}/reservations`, params);
  }
  
  /**
   * 获取设备预约
   */
  async getDeviceReservations(params?: GetDeviceReservationsParams): Promise<DeviceReservation[]> {
    try {
      // 使用正确的API路径，需指定设备ID
      // 如果没有指定设备ID，则获取所有预约
      const deviceId = params?.deviceId || 'all';
      const response = await this.apiService.get(`/devices/${deviceId}/reservations`, params);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('获取设备预约列表失败:', error);
      // 返回空数组，避免页面崩溃
      return [];
    }
  }
  
  /**
   * 获取设备监控数据
   */
  async getDeviceMonitoringData(deviceId: string): Promise<DeviceMonitoringData> {
    return this.apiService.get(`/devices/${deviceId}/monitoring`);
  }
  
  /**
   * 更新设备配置
   */
  async updateDeviceConfiguration(deviceId: string, config: Record<string, any>): Promise<Device> {
    return this.apiService.put(`/devices/${deviceId}/configuration`, config);
  }
  
  /**
   * 重启设备
   */
  async restartDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    return this.apiService.post(`/devices/${deviceId}/restart`);
  }
}
