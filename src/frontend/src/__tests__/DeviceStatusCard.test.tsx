import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardContent, Box } from '@mui/material';
import { renderWithTheme } from '../test-utils';
import { deviceFixtures } from '../fixtures/devices';

// ģ���豸״̬��Ƭ���
const MockDeviceStatusCard = ({ device = deviceFixtures[0] }) => (
  <Card data-testid="device-status-card">
    <CardContent>
      <h3 data-testid="device-name">{device.name}</h3>
      <div data-testid="device-status">
        <span>״̬: </span>
        <span className={`status-${device.status}`}>{device.status}</span>
      </div>
      <div data-testid="device-type">����: {device.type}</div>
      <div data-testid="device-location">λ��: {device.location}</div>
    </CardContent>
  </Card>
);

describe('DeviceStatusCard', () => {
  test('��Ⱦ�豸״̬��Ƭ', () => {
    renderWithTheme(<MockDeviceStatusCard />);
    expect(screen.getByTestId('device-status-card')).toBeInTheDocument();
  });

  test('��ʾ�豸����', () => {
    renderWithTheme(<MockDeviceStatusCard />);
    expect(screen.getByTestId('device-name')).toBeInTheDocument();
    expect(screen.getByText('�¶ȴ�����TH-001')).toBeInTheDocument();
  });

  test('��ʾ�豸״̬', () => {
    renderWithTheme(<MockDeviceStatusCard />);
    expect(screen.getByTestId('device-status')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  test('��ʾ�豸��Ϣ', () => {
    renderWithTheme(<MockDeviceStatusCard />);
    expect(screen.getByTestId('device-type')).toBeInTheDocument();
    expect(screen.getByTestId('device-location')).toBeInTheDocument();
  });

  test('�����Զ����豸', () => {
    const customDevice = {
      id: '999',
      name: '�����豸',
      status: 'offline' as const,
      type: '��������',
      location: '����λ��',
      lastSeen: new Date().toISOString()
    };
    renderWithTheme(<MockDeviceStatusCard device={customDevice} />);
    expect(screen.getByText('�����豸')).toBeInTheDocument();
    expect(screen.getByText('offline')).toBeInTheDocument();
  });
});

export default MockDeviceStatusCard;
