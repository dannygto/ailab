// Mock device data for testing
export const mockDevices = [
  {
    id: 'device-1',
    name: 'Test Device 1',
    type: 'camera',
    status: 'online',
    lastSeen: new Date().toISOString(),
    location: 'Lab A',
    model: 'CAM-2000',
    serialNumber: 'SN001',
    firmware: '1.0.0',
    health: 'good',
    metrics: {
      cpu: 45,
      memory: 60,
      storage: 30,
      temperature: 35,
      uptime: 86400
    }
  },
  {
    id: 'device-2',
    name: 'Test Device 2',
    type: 'sensor',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    location: 'Lab B',
    model: 'SEN-1000',
    serialNumber: 'SN002',
    firmware: '1.1.0',
    health: 'warning',
    metrics: {
      cpu: 80,
      memory: 75,
      storage: 45,
      temperature: 42,
      uptime: 43200
    }
  }
];

export const mockDevice = mockDevices[0];

export default mockDevices;
