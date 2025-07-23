import { HttpRestDeviceAdapter } from './adapters/http-rest-adapter.js';
import { DeviceConnectionEventType } from './types.js';
async function testHttpRestAdapter() {
    console.log('======= 开始测试HTTP/REST协议适配器 =======');
    const httpAdapter = new HttpRestDeviceAdapter();
    await httpAdapter.initialize();
    httpAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
        console.log(`设备已连接: ${event.deviceId}, 时间: ${event.timestamp}`);
    });
    httpAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
        console.log(`设备已断开连接: ${event.deviceId}, 时间: ${event.timestamp}`);
    });
    httpAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
        console.log(`设备错误: ${event.deviceId}, 错误: ${event.error?.message}, 时间: ${event.timestamp}`);
    });
    httpAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
        console.log(`设备数据接收: ${event.deviceId}, 数据:`, event.data);
    });
    const restDeviceId = 'rest-device-1';
    const restConfig = {
        connectionType: 'http',
        mode: 'http',
        parameters: {
            baseUrl: 'http://api.example.com/device',
            timeout: 5000,
            retryCount: 3,
            retryDelay: 1000,
            autoReconnect: true,
            reconnectInterval: 5000,
            heartbeatPath: '/ping',
            heartbeatInterval: 30000,
            debug: true,
            auth: {
                type: 'api-key',
                token: 'api-key-12345',
                apiKeyName: 'X-Device-API-Key',
                apiKeyLocation: 'header'
            },
            headers: {
                'X-Custom-Header': 'custom-value'
            },
            endpointMap: {
                getStatus: {
                    path: '/status',
                    method: 'GET',
                    expectedStatus: [200]
                },
                getSensorData: {
                    path: '/sensors',
                    method: 'GET',
                    queryParams: ['type'],
                    expectedStatus: [200]
                },
                getSensorById: {
                    path: '/sensors/{sensorId}',
                    method: 'GET',
                    pathParams: ['sensorId'],
                    expectedStatus: [200]
                },
                setParameter: {
                    path: '/parameters',
                    method: 'POST',
                    contentType: 'application/json',
                    bodyFields: ['name', 'value'],
                    expectedStatus: [200, 201]
                },
                restart: {
                    path: '/control/restart',
                    method: 'POST',
                    expectedStatus: [202]
                },
                shutdown: {
                    path: '/control/shutdown',
                    method: 'POST',
                    expectedStatus: [202]
                }
            },
            dataTransformers: {
                sensorDataTransformer: `
          // 将API响应转换为标准格式
          return data.map(sensor => ({
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
            value: sensor.reading.value,
            unit: sensor.reading.unit,
            timestamp: sensor.reading.timestamp,
            status: sensor.status
          }));
        `
            }
        }
    };
    console.log('连接到HTTP/REST设备...');
    const restConnected = await httpAdapter.connect(restDeviceId, restConfig);
    console.log(`HTTP/REST连接结果: ${restConnected}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('读取设备状态...');
    try {
        const statusData = await httpAdapter.sendCommand(restDeviceId, {
            id: 'cmd-1',
            deviceId: restDeviceId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            command: 'getStatus',
            parameters: {}
        });
        console.log('设备状态:', statusData);
    }
    catch (error) {
        console.error('读取设备状态失败:', error);
    }
    console.log('读取温度传感器数据...');
    try {
        const sensorData = await httpAdapter.sendCommand(restDeviceId, {
            id: 'cmd-2',
            deviceId: restDeviceId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            command: 'getSensorData',
            parameters: {
                type: 'temperature'
            }
        });
        console.log('传感器数据:', sensorData);
    }
    catch (error) {
        console.error('读取传感器数据失败:', error);
    }
    console.log('设置设备参数...');
    try {
        const setResult = await httpAdapter.sendCommand(restDeviceId, {
            id: 'cmd-3',
            deviceId: restDeviceId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            command: 'setParameter',
            parameters: {
                name: 'sampleRate',
                value: 1000
            }
        });
        console.log('设置结果:', setResult);
    }
    catch (error) {
        console.error('设置设备参数失败:', error);
    }
    console.log('等待数据接收事件...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('断开HTTP/REST设备连接...');
    await httpAdapter.disconnect(restDeviceId);
    console.log('======= HTTP/REST协议适配器测试完成 =======');
}
testHttpRestAdapter().catch(console.error);
//# sourceMappingURL=http-rest-test.js.map