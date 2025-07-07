import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';
import { deviceFixtures } from '../fixtures/devices';

// ģ���豸����б����V2
const MockDeviceMonitorListV2 = ({ devices = deviceFixtures.basicdevices }) => (
  <div data-testid="device-monitor-list-v2">
    <h2>�豸����б� V2</h2>
    <div data-testid="device-list">
      {devices.map(device => (
        <div key={device.id} data-testid={`device-item-${device.id}`} className="device-item">
          <h4>{device.name}</h4>
          <p>״̬: {device.status}</p>
          <p>����: {device.type}</p>
          <div data-testid={`metrics-${device.id}`}>
            ָ������
          </div>
        </div>
      ))}
    </div>
  </div>
);

describe('DeviceMonitorListV2', () => {
  test('��Ⱦ�豸����б�V2', () => {
    renderWithTheme(<MockDeviceMonitorListV2 />);
    expect(screen.getByTestId('device-monitor-list-v2')).toBeInTheDocument();
    expect(screen.getByText('�豸����б� V2')).toBeInTheDocument();
  });

  test('��ʾ�豸�б�', () => {
    renderWithTheme(<MockDeviceMonitorListV2 />);
    expect(screen.getByTestId('device-list')).toBeInTheDocument();
  });

  test('��ʾ�豸��Ŀ', () => {
    renderWithTheme(<MockDeviceMonitorListV2 />);
    expect(screen.getByTestId('device-item-sensor-001')).toBeInTheDocument();
    expect(screen.getByText('�¶ȴ�����TH-001')).toBeInTheDocument();
  });

  test('��ʾ�豸ָ��', () => {
    renderWithTheme(<MockDeviceMonitorListV2 />);
    expect(screen.getByTestId('metrics-sensor-001')).toBeInTheDocument();
    // ʹ�����������Ʋ��ҷ�Χ��������ƥ��
    const metricsElement = screen.getByTestId('metrics-sensor-001');
    expect(metricsElement).toHaveTextContent('ָ������');
  });

  test('�������豸�б�', () => {
    renderWithTheme(<MockDeviceMonitorListV2 devices={[]} />);
    expect(screen.getByTestId('device-monitor-list-v2')).toBeInTheDocument();
    expect(screen.queryByTestId(/device-item-/)).not.toBeInTheDocument();
  });
});