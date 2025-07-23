/**
 * 状态徽章组件
 * 用于显示各种状态的彩色徽章
 */
import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { DeviceStatus, ExperimentStatus, ResourceStatus } from '../../types/devices';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: string;
  type?: 'device' | 'experiment' | 'resource' | 'user' | 'generic';
  customColors?: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'>;
}

/**
 * 状态徽章组件
 * 根据不同类型的状态自动显示对应颜色的徽章
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'generic',
  customColors = {},
  ...chipProps
}) => {
  // 根据状态类型选择对应的颜色
  const getColor = (): ChipProps['color'] => {
    // 如果提供了自定义颜色映射，则优先使用
    if (customColors[status]) {
      return customColors[status];
    }

    // 根据状态类型选择对应的颜色
    switch (type) {
      case 'device':
        return getDeviceStatusColor(status);
      case 'experiment':
        return getExperimentStatusColor(status);
      case 'resource':
        return getResourceStatusColor(status);
      case 'user':
        return getUserStatusColor(status);
      default:
        return getGenericStatusColor(status);
    }
  };

  // 设备状态颜色
  const getDeviceStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case DeviceStatus.ONLINE:
      case DeviceStatus.ACTIVE:
      case DeviceStatus.AVAILABLE:
        return 'success';
      case DeviceStatus.OFFLINE:
      case DeviceStatus.ERROR:
        return 'error';
      case DeviceStatus.MAINTENANCE:
        return 'warning';
      case DeviceStatus.RESERVED:
      case DeviceStatus.IN_USE:
        return 'info';
      default:
        return 'default';
    }
  };

  // 实验状态颜色
  const getExperimentStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case ExperimentStatus.COMPLETED:
      case ExperimentStatus.PUBLISHED:
        return 'success';
      case ExperimentStatus.CANCELLED:
      case ExperimentStatus.FAILED:
        return 'error';
      case ExperimentStatus.SCHEDULED:
      case ExperimentStatus.DRAFT:
        return 'warning';
      case ExperimentStatus.IN_PROGRESS:
        return 'info';
      default:
        return 'default';
    }
  };

  // 资源状态颜色
  const getResourceStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case ResourceStatus.AVAILABLE:
        return 'success';
      case ResourceStatus.EXPIRED:
      case ResourceStatus.DAMAGED:
      case ResourceStatus.OUT_OF_STOCK:
        return 'error';
      case ResourceStatus.LOW_STOCK:
        return 'warning';
      case ResourceStatus.RESERVED:
      case ResourceStatus.IN_USE:
        return 'info';
      default:
        return 'default';
    }
  };

  // 用户状态颜色
  const getUserStatusColor = (status: string): ChipProps['color'] => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
        return 'success';
      case 'suspended':
      case 'banned':
      case 'blocked':
        return 'error';
      case 'pending':
      case 'approval':
        return 'warning';
      case 'away':
      case 'inactive':
        return 'info';
      default:
        return 'default';
    }
  };

  // 通用状态颜色
  const getGenericStatusColor = (status: string): ChipProps['color'] => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('success') ||
        statusLower.includes('complete') ||
        statusLower.includes('active') ||
        statusLower.includes('online') ||
        statusLower.includes('available')) {
      return 'success';
    }

    if (statusLower.includes('error') ||
        statusLower.includes('fail') ||
        statusLower.includes('expired') ||
        statusLower.includes('reject') ||
        statusLower.includes('danger')) {
      return 'error';
    }

    if (statusLower.includes('warn') ||
        statusLower.includes('pending') ||
        statusLower.includes('wait') ||
        statusLower.includes('maintain')) {
      return 'warning';
    }

    if (statusLower.includes('process') ||
        statusLower.includes('running') ||
        statusLower.includes('progress') ||
        statusLower.includes('update')) {
      return 'info';
    }

    return 'default';
  };

  // 获取状态的显示文本
  const getStatusLabel = (): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ').toLowerCase();
  };

  return (
    <Chip
      size="small"
      label={getStatusLabel()}
      color={getColor()}
      {...chipProps}
    />
  );
};

export { StatusBadge };
