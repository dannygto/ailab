import {
  Device,
  DeviceDataPoint,
  DeviceCommand,
  DeviceReservation,
  DeviceSession,
  GetDevicesParams,
  GetDeviceDataParams,
  SendDeviceCommandParams,
  CreateDeviceSessionParams,
  CreateDeviceReservationParams,
  GetDeviceReservationsParams,
  DeviceMonitoringData
} from '../types';
import { ApiService } from './api';

/**
 * 设备管理服务类
 * 提供设备查询、控制、监控等功能
 */
export class DeviceService {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  /**
   * 获取设备列表
   * @param params 查询参数
   * @returns 设备列表响应
   */
  async getDevices(params?: GetDevicesParams) {
    return this.apiService.getDevices(params);
  }

  /**
   * 获取单个设备详情
   * @param deviceId 设备ID
   * @returns 设备详情响应
   */
  async getDevice(deviceId: string) {
    return this.apiService.getDevice(deviceId);
  }

  /**
   * 创建新设备
   * @param deviceData 设备数据
   * @returns 创建的设备响应
   */
  async createDevice(deviceData: Partial<Device>) {
    return this.apiService.createDevice(deviceData);
  }

  /**
   * 更新设备信息
   * @param deviceId 设备ID
   * @param deviceData 更新的设备数据
   * @returns 更新后的设备响应
   */
  async updateDevice(deviceId: string, deviceData: Partial<Device>) {
    return this.apiService.updateDevice(deviceId, deviceData);
  }

  /**
   * 删除设备
   * @param deviceId 设备ID
   * @returns 删除操作响应
   */
  async deleteDevice(deviceId: string) {
    return this.apiService.deleteDevice(deviceId);
  }

  /**
   * 批量删除设备
   * @param deviceIds 设备ID数组
   * @returns 批量删除操作响应
   */
  async deleteDevices(deviceIds: string[]) {
    return this.apiService.deleteDevices(deviceIds);
  }

  /**
   * 批量更新设备标签
   * @param deviceIds 设备ID数组
   * @param tags 标签数组
   * @returns 批量标签更新操作响应
   */
  async updateDevicesTags(deviceIds: string[], tags: string[]) {
    return this.apiService.updateDevicesTags(deviceIds, tags);
  }

  /**
   * 批量归档设备
   * @param deviceIds 设备ID数组
   * @returns 批量归档操作响应
   */
  async archiveDevices(deviceIds: string[]) {
    return this.apiService.archiveDevices(deviceIds);
  }

  /**
   * 获取设备数据
   * @param deviceId 设备ID
   * @param params 查询参数
   * @returns 设备数据点列表响应
   */
  async getDeviceData(deviceId: string, params: GetDeviceDataParams) {
    return this.apiService.getDeviceData(deviceId, params);
  }

  /**
   * 发送设备命令
   * @param deviceId 设备ID
   * @param params 命令参数
   * @returns 命令执行响应
   */
  async sendDeviceCommand(deviceId: string, params: SendDeviceCommandParams) {
    return this.apiService.sendDeviceCommand(deviceId, params);
  }

  /**
   * 获取设备命令历史
   * @param deviceId 设备ID
   * @returns 命令历史列表响应
   */
  async getDeviceCommands(deviceId: string) {
    return this.apiService.getDeviceCommands(deviceId);
  }

  /**
   * 检查设备连接状态
   * @param deviceId 设备ID
   * @returns 连接状态响应
   */
  async checkDeviceConnection(deviceId: string) {
    return this.apiService.checkDeviceConnection(deviceId);
  }

  /**
   * 创建设备预约
   * @param params 预约参数
   * @returns 预约创建响应
   */
  async createDeviceReservation(params: CreateDeviceReservationParams) {
    return this.apiService.createDeviceReservation(params);
  }

  /**
   * 获取设备预约列表
   * @param params 查询参数
   * @returns 预约列表响应
   */
  async getDeviceReservations(params: GetDeviceReservationsParams) {
    return this.apiService.getDeviceReservations(params);
  }

  /**
   * 取消设备预约
   * @param reservationId 预约ID
   * @returns 取消预约操作响应
   */
  async cancelDeviceReservation(reservationId: string) {
    return this.apiService.cancelDeviceReservation(reservationId);
  }

  /**
   * 获取设备监控数据
   * @param deviceId 设备ID
   * @returns 监控数据响应
   */
  async getDeviceMonitoringData(deviceId: string) {
    return this.apiService.getDeviceMonitoringData(deviceId);
  }
}

export default DeviceService;
