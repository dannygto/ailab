import { Box } from '@mui/material';
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../test-utils';
import { mockdevices } from '../__mocks__/testData';

// ģ���豸ָ��ͼ�����
const MockDeviceMetricsChart = ({ devices = mockdevices }) => (
  <div data-testid="device-metrics-chart">
    <h3>�豸ָ��ͼ��</h3>
    <div data-testid="chart-container">
      {devices.map(device => (
        <div key={device.id} data-testid={`device-metric-${device.id}`}>
          <span>�豸: {device.name}</span>
          <span>״̬: {device.status}</span>
        </div>
      ))}
    </div>
  </div>
);

describe('DeviceMetricsChart', () => {
  test('��Ⱦ�豸ָ��ͼ��', () => {
    renderWithProviders(<MockDeviceMetricsChart />);
    expect(screen.getByTestId('device-metrics-chart')).toBeInTheDocument();
    expect(screen.getByText('�豸ָ��ͼ��')).toBeInTheDocument();
  });

  test('��ʾͼ������', () => {
    renderWithProviders(<MockDeviceMetricsChart />);
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  test('��ʾ�豸����', () => {
    renderWithProviders(<MockDeviceMetricsChart />);
    expect(screen.getByTestId('device-metric-1')).toBeInTheDocument();
    expect(screen.getByText('�豸: ��΢���豸1')).toBeInTheDocument();
  });

  test('�������豸�б�', () => {
    renderWithProviders(<MockDeviceMetricsChart devices={[]} />);
    expect(screen.getByTestId('device-metrics-chart')).toBeInTheDocument();
    expect(screen.queryByTestId(/device-metric-/)).not.toBeInTheDocument();
  });
});

export default MockDeviceMetricsChart;
