// DeviceStatusCard组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 设备状态卡片组件模拟
interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  location: string;
  lastUpdate: string;
}

interface DeviceStatusCardProps {
  device: Device;
}

const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ device }) => (
  <div data-testid="device-card">
    <h3>{device.name}</h3>
    <div data-testid="device-status" className={`status-${device.status}`}>
      {device.status === 'online' ? '在线' : device.status === 'offline' ? '离线' : '错误'}
    </div>
    <div>{device.location}</div>
    <div>最后更新: {device.lastUpdate}</div>
  </div>
);

describe('DeviceStatusCard组件测试', () => {
  const mockDevice: Device = {
    id: '1',
    name: '温度传感器-001',
    status: 'online',
    location: '实验室A',
    lastUpdate: '2025-07-03 10:00:00'
  };

  test('渲染设备信息', () => {
    render(<DeviceStatusCard device={mockDevice} />);
    
    expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    expect(screen.getByText('在线')).toBeInTheDocument();
    expect(screen.getByText('实验室A')).toBeInTheDocument();
    expect(screen.getByText('最后更新: 2025-07-03 10:00:00')).toBeInTheDocument();
  });

  test('显示离线状态', () => {
    const offlineDevice = { ...mockDevice, status: 'offline' as const };
    render(<DeviceStatusCard device={offlineDevice} />);
    
    expect(screen.getByText('离线')).toBeInTheDocument();
    const statusElement = screen.getByTestId('device-status');
    expect(statusElement).toHaveClass('status-offline');
  });

  test('显示错误状态', () => {
    const errorDevice = { ...mockDevice, status: 'error' as const };
    render(<DeviceStatusCard device={errorDevice} />);
    
    expect(screen.getByText('错误')).toBeInTheDocument();
    const statusElement = screen.getByTestId('device-status');
    expect(statusElement).toHaveClass('status-error');
  });
});
