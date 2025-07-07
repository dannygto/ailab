import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { deviceFixtures } from '../fixtures/devices';

// �򵥵�ģ���豸������
const DeviceMonitor = ({ devices = deviceFixtures.basicdevices }) => (
  <div data-testid="device-monitor">
    <h2>�豸���</h2>
    <div className="device-list">
      {devices.map(device => (
        <div key={device.id} data-testid={`device-${device.id}`} className="device-item">
          <h4>{device.name}</h4>
          <div className="status">״̬: {device.status}</div>
        </div>
      ))}
    </div>
  </div>
);

describe('DeviceMonitor', () => {
  test('��Ⱦ�豸������', () => {
    render(<DeviceMonitor />);
    expect(screen.getByTestId('device-monitor')).toBeInTheDocument();
    expect(screen.getByText('�豸���')).toBeInTheDocument();
  });
  
  test('��ʾ�豸�б�', () => {
    render(<DeviceMonitor />);
    expect(screen.getByTestId('device-sensor-001')).toBeInTheDocument();
    expect(screen.getByText('�¶ȴ�����TH-001')).toBeInTheDocument();
  });
  
  test('�������豸�б�', () => {
    render(<DeviceMonitor devices={[]} />);
    expect(screen.getByTestId('device-monitor')).toBeInTheDocument();
    expect(screen.queryByTestId(/device-sensor-/)).not.toBeInTheDocument();
  });
});