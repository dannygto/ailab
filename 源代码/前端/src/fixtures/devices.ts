export const deviceFixtures = [
  {
    id: '1',
    name: 'Test Device 1',
    type: 'sensor',
    status: 'online',
    lastSeen: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Test Device 2',
    type: 'actuator',
    status: 'offline',
    lastSeen: new Date().toISOString()
  }
];

export default deviceFixtures;
