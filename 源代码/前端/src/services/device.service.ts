import { Box } from '@mui/material';
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
 * �豸����������
 * �ṩ�豸��ѯ����ء����Ƶ���ع���
 */
export class deviceservice {
  private apiService: apiService;
  
  constructor(apiService: apiService) {
    this.apiService = apiService;
  }
  
  /**
   * ��ȡ�豸�б�
   */
  async getdevices(params?: GetdevicesParams): Promise<Device[]> {
    return this.apiService.get('/devices', params);
  }
  
  /**
   * ��ȡ�豸����
   */
  async getDeviceById(id: string): Promise<Device> {
    return this.apiService.get(`/devices/${id}`);
  }
  
  /**
   * �����豸״̬
   */
  async updatedevicestatus(id: string, status: string, metadata?: any): Promise<Device> {
    return this.apiService.put(`/devices/${id}/status`, { status, metadata });
  }
  
  /**
   * �����豸����
   */
  async sendCommand(deviceId: string, params: SendDeviceCommandParams): Promise<DeviceCommand> {
    return this.apiService.post(`/devices/${deviceId}/commands`, params);
  }
  
  /**
   * ��ȡ�豸������ʷ
   */
  async getDeviceCommands(deviceId: string, limit?: number): Promise<DeviceCommand[]> {
    return this.apiService.get(`/devices/${deviceId}/commands`, { limit });
  }
  
  /**
   * ��ȡ�豸����
   */
  async getDeviceData(deviceId: string, params?: GetDeviceDataParams): Promise<DeviceDataPoint[]> {
    return this.apiService.get(`/devices/${deviceId}/data`, params);
  }
  
  /**
   * �����豸�Ự
   */
  async createSession(deviceId: string, params: CreatedevicesessionParams): Promise<devicesession> {
    return this.apiService.post(`/devices/${deviceId}/sessions`, params);
  }
  
  /**
   * �����豸�Ự
   */
  async endSession(sessionId: string, notes?: string): Promise<devicesession> {
    return this.apiService.put(`/devices/sessions/${sessionId}/end`, { notes });
  }
  
  /**
   * �����豸ԤԼ
   */
  async createReservation(deviceId: string, params: CreateDeviceReservationParams): Promise<DeviceReservation> {
    return this.apiService.post(`/devices/${deviceId}/reservations`, params);
  }
  
  /**
   * ��ȡ�豸ԤԼ
   */
  async getDeviceReservations(params?: GetDeviceReservationsParams): Promise<DeviceReservation[]> {
    return this.apiService.get(`/devices/reservations`, params);
  }
  
  /**
   * ��ȡ�豸�������
   */
  async getDeviceMonitoringData(deviceId: string): Promise<DeviceMonitoringData> {
    return this.apiService.get(`/devices/${deviceId}/monitoring`);
  }
  
  /**
   * �����豸����
   */
  async updateDeviceConfiguration(deviceId: string, config: Record<string, any>): Promise<Device> {
    return this.apiService.put(`/devices/${deviceId}/configuration`, config);
  }
  
  /**
   * �����豸
   */
  async restartDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    return this.apiService.post(`/devices/${deviceId}/restart`);
  }
}
