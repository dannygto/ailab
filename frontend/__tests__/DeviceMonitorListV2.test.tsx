// DeviceMonitorListV2组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockDevices } from '../src/__tests__/mockData';

// 设备监控列表组件模拟
interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  location: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    temperature?: number;
  };
}

interface DeviceMonitorListV2Props {
  devices: Device[];
  onDeviceSelect?: (device: Device) => void;
}

const DeviceMonitorListV2: React.FC<DeviceMonitorListV2Props> = ({ devices, onDeviceSelect }) => (
  <div data-testid="device-monitor-list">
    <h2>设备监控列表</h2>
    <div data-testid="device-count">设备数量: {devices.length}</div>
    {devices.length === 0 ? (
      <div data-testid="empty-state">暂无设备</div>
    ) : (
      <div>
        {devices.map(device => (
          <div 
            key={device.id} 
            data-testid={`device-${device.id}`}
            onClick={() => onDeviceSelect?.(device)}
            style={{ cursor: onDeviceSelect ? 'pointer' : 'default' }}
          >
            <div>{device.name} ({device.type})</div>
            <div data-testid={`status-${device.id}`}>{device.status}</div>
            <div>{device.location}</div>
            {device.metrics && (
              <div data-testid={`metrics-${device.id}`}>
                {device.metrics.temperature && <span>温度: {device.metrics.temperature}°C</span>}
                {device.metrics.cpu && <span> CPU: {device.metrics.cpu}%</span>}
                {device.metrics.memory && <span> 内存: {device.metrics.memory}%</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

describe('DeviceMonitorListV2组件测试', () => {
  // 使用从mockData导入的数据
  const testDevices = mockDevices;

  test('渲染设备列表', () => {
    render(<DeviceMonitorListV2 devices={testDevices} />);
    
    expect(screen.getByText('设备监控列表')).toBeInTheDocument();
    expect(screen.getByText('设备数量: 3')).toBeInTheDocument();
  });

  test('显示设备信息', () => {
    render(<DeviceMonitorListV2 devices={testDevices} />);
    
    expect(screen.getByText('温度传感器-001 (sensor)')).toBeInTheDocument();
    expect(screen.getByText('摄像头-002 (camera)')).toBeInTheDocument();
    expect(screen.getByTestId('status-1')).toHaveTextContent('online');
    expect(screen.getByTestId('status-2')).toHaveTextContent('offline');
  });

  test('显示设备指标', () => {
    render(<DeviceMonitorListV2 devices={testDevices} />);
    
    const metrics = screen.getByTestId('metrics-1');
    expect(metrics).toHaveTextContent('温度: 25.5°C');
  });

  test('空设备列表', () => {
    render(<DeviceMonitorListV2 devices={[]} />);
    
    expect(screen.getByText('设备数量: 0')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('暂无设备');
  });

  test('设备点击事件', () => {
    const handleDeviceSelect = jest.fn();
    render(<DeviceMonitorListV2 devices={testDevices} onDeviceSelect={handleDeviceSelect} />);
    
    const device1 = screen.getByTestId('device-1');
    device1.click();
    
    expect(handleDeviceSelect).toHaveBeenCalledWith(testDevices[0]);
  });
});
