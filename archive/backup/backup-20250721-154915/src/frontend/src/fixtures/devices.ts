export const deviceFixtures = [
  {
    id: '1',
    name: 'Test Device 1',
    type: 'sensor',
    status: 'online',
    location: '实验室A',
    lastSeen: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Test Device 2',
    type: 'actuator',
    status: 'offline',
    location: '实验室B',
    lastSeen: new Date().toISOString()
  }
];

export default deviceFixtures;
