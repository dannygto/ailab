"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceController = exports.DeviceController = void 0;
const device_model_1 = require("../models/device.model");
// 模拟数据
const devices = new Map();
const deviceSessions = new Map();
const deviceReservations = new Map();
const deviceDataPoints = new Map();
const deviceCommands = new Map();
// 初始化一些示例设备
function initializeDevices() {
    const sampleDevices = [
        {
            id: 'dev-001',
            name: '数字显微镜-A1',
            type: device_model_1.DeviceType.MICROSCOPE,
            model: 'DigitalScope X500',
            manufacturer: '光科技器材有限公司',
            description: '高精度数字显微镜，支持远程控制和实时图像传输',
            connectionStatus: device_model_1.DeviceConnectionStatus.ONLINE,
            location: '实验室A-101',
            ipAddress: '192.168.1.101',
            macAddress: '00:1B:44:11:3A:B7',
            firmware: 'v2.5.1',
            lastMaintenance: '2025-01-15T00:00:00Z',
            nextMaintenance: '2025-07-15T00:00:00Z',
            capabilities: ['zoom', 'focus', 'capture', 'illumination', 'streaming'],
            supportedProtocols: ['HTTP', 'RTSP', 'WebRTC'],
            dataFormats: ['JPEG', 'PNG', 'H.264'],
            configuration: {
                maxZoom: 500,
                resolution: '4K',
                framerate: 30
            },
            metadata: {
                purchaseDate: '2024-12-01',
                warranty: '3年'
            },
            createdAt: '2025-01-02T10:00:00Z',
            updatedAt: '2025-06-15T14:30:00Z'
        },
        {
            id: 'dev-002',
            name: '多功能数据采集器-S2',
            type: device_model_1.DeviceType.DATALOGGER,
            model: 'DataCollect Pro',
            manufacturer: '教育科技股份有限公司',
            description: '支持多种传感器的数据采集设备，适用于物理、化学、生物等多学科实验',
            connectionStatus: device_model_1.DeviceConnectionStatus.ONLINE,
            location: '实验室B-203',
            ipAddress: '192.168.1.102',
            macAddress: '00:1B:44:22:5C:D9',
            firmware: 'v3.1.0',
            lastMaintenance: '2025-03-10T00:00:00Z',
            nextMaintenance: '2025-09-10T00:00:00Z',
            capabilities: ['multi-sensor', 'real-time', 'graphing', 'export'],
            supportedProtocols: ['HTTP', 'MQTT', 'WebSocket'],
            dataFormats: ['JSON', 'CSV', 'XML'],
            configuration: {
                samplingRate: 100,
                channels: 8,
                storage: '32GB'
            },
            metadata: {
                purchaseDate: '2025-01-15',
                warranty: '2年'
            },
            createdAt: '2025-02-01T09:15:00Z',
            updatedAt: '2025-06-10T11:20:00Z'
        },
        {
            id: 'dev-003',
            name: '光谱分析仪-P5',
            type: device_model_1.DeviceType.SPECTROSCOPE,
            model: 'SpectrumMaster 2000',
            manufacturer: '精密仪器研究院',
            description: '高精度光谱分析仪，可用于物质成分分析和光学实验',
            connectionStatus: device_model_1.DeviceConnectionStatus.MAINTENANCE,
            location: '实验室C-305',
            ipAddress: '192.168.1.103',
            macAddress: '00:1B:44:33:7E:F1',
            firmware: 'v1.8.2',
            lastMaintenance: '2025-05-20T00:00:00Z',
            nextMaintenance: '2025-11-20T00:00:00Z',
            capabilities: ['spectral-analysis', 'wavelength-calibration', 'peak-detection'],
            supportedProtocols: ['HTTP', 'FTP'],
            dataFormats: ['CSV', 'JSON', 'SPECX'],
            configuration: {
                wavelengthRange: '200-900nm',
                resolution: '0.5nm',
                accuracy: '±0.1nm'
            },
            metadata: {
                purchaseDate: '2024-11-10',
                warranty: '5年'
            },
            createdAt: '2024-12-05T13:40:00Z',
            updatedAt: '2025-05-22T10:15:00Z'
        }
    ];
    // 将示例设备添加到Map中
    sampleDevices.forEach(device => {
        devices.set(device.id, device);
        deviceDataPoints.set(device.id, []);
        deviceCommands.set(device.id, []);
    });
}
// 初始化示例数据
initializeDevices();
class DeviceController {
    constructor() {
        // 获取所有设备
        this.getAllDevices = (req, res) => {
            try {
                const allDevices = Array.from(devices.values());
                // 支持过滤和分页
                const type = req.query.type;
                const status = req.query.status;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // 应用过滤
                let filteredDevices = allDevices;
                if (type) {
                    filteredDevices = filteredDevices.filter(d => d.type === type);
                }
                if (status) {
                    filteredDevices = filteredDevices.filter(d => d.connectionStatus === status);
                }
                // 应用分页
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedDevices = filteredDevices.slice(startIndex, endIndex);
                res.json({
                    success: true,
                    data: {
                        data: paginatedDevices,
                        total: filteredDevices.length,
                        page,
                        limit,
                        totalPages: Math.ceil(filteredDevices.length / limit)
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取设备列表失败'
                });
            }
        };
        // 获取单个设备
        this.getDeviceById = (req, res) => {
            try {
                const { id } = req.params;
                const device = devices.get(id);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                res.json({
                    success: true,
                    data: device
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取设备信息失败'
                });
            }
        };
        // 更新设备状态
        this.updateDeviceStatus = (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                // 验证参数
                if (!status || !Object.values(device_model_1.DeviceConnectionStatus).includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: '无效的设备状态'
                    });
                }
                // 检查设备是否存在
                const device = devices.get(id);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 更新状态
                device.connectionStatus = status;
                device.updatedAt = new Date().toISOString();
                devices.set(id, device);
                res.json({
                    success: true,
                    message: '设备状态已更新',
                    data: device
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '更新设备状态失败'
                });
            }
        };
        // 发送命令到设备
        this.sendCommand = (req, res) => {
            try {
                const { id } = req.params;
                const { command, parameters } = req.body;
                // 验证参数
                if (!command) {
                    return res.status(400).json({
                        success: false,
                        message: '命令不能为空'
                    });
                }
                // 检查设备是否存在
                const device = devices.get(id);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 检查设备是否在线
                if (device.connectionStatus !== device_model_1.DeviceConnectionStatus.ONLINE) {
                    return res.status(400).json({
                        success: false,
                        message: `设备当前不可用，状态: ${device.connectionStatus}`
                    });
                }
                // 创建命令记录
                const commandId = `cmd-${Date.now()}`;
                const newCommand = {
                    id: commandId,
                    deviceId: id,
                    command,
                    parameters: parameters || {},
                    timestamp: new Date().toISOString(),
                    status: 'sent'
                };
                // 存储命令
                const deviceCommandsList = deviceCommands.get(id) || [];
                deviceCommandsList.push(newCommand);
                deviceCommands.set(id, deviceCommandsList);
                // 在实际应用中，这里会调用设备API发送命令
                // 这里我们模拟一个成功的响应
                setTimeout(() => {
                    newCommand.status = 'executed';
                    newCommand.executedAt = new Date().toISOString();
                    newCommand.result = { success: true, message: '命令已执行' };
                }, 500);
                res.json({
                    success: true,
                    message: '命令已发送到设备',
                    data: {
                        commandId,
                        status: 'sent',
                        timestamp: newCommand.timestamp
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '发送命令失败'
                });
            }
        };
        // 获取设备命令历史
        this.getDeviceCommands = (req, res) => {
            try {
                const { id } = req.params;
                // 检查设备是否存在
                if (!devices.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 获取命令历史
                const commands = deviceCommands.get(id) || [];
                // 支持过滤和分页
                const status = req.query.status;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // 应用过滤
                let filteredCommands = commands;
                if (status) {
                    filteredCommands = filteredCommands.filter(c => c.status === status);
                }
                // 排序 - 最新的命令优先
                filteredCommands.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                // 应用分页
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedCommands = filteredCommands.slice(startIndex, endIndex);
                res.json({
                    success: true,
                    data: {
                        data: paginatedCommands,
                        total: filteredCommands.length,
                        page,
                        limit,
                        totalPages: Math.ceil(filteredCommands.length / limit)
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取设备命令历史失败'
                });
            }
        };
        // 获取设备数据
        this.getDeviceData = (req, res) => {
            try {
                const { id } = req.params;
                // 检查设备是否存在
                if (!devices.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 获取数据点
                const dataPoints = deviceDataPoints.get(id) || [];
                // 支持时间范围过滤
                const startTime = req.query.startTime;
                const endTime = req.query.endTime;
                let filteredDataPoints = dataPoints;
                if (startTime || endTime) {
                    filteredDataPoints = dataPoints.filter(dp => {
                        const dpTime = new Date(dp.timestamp).getTime();
                        const startValid = startTime ? dpTime >= new Date(startTime).getTime() : true;
                        const endValid = endTime ? dpTime <= new Date(endTime).getTime() : true;
                        return startValid && endValid;
                    });
                }
                res.json({
                    success: true,
                    data: {
                        deviceId: id,
                        dataPoints: filteredDataPoints,
                        count: filteredDataPoints.length
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取设备数据失败'
                });
            }
        };
        // 创建设备会话
        this.createSession = (req, res) => {
            try {
                const { id } = req.params;
                const { userId, experimentId, settings } = req.body;
                // 验证参数
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: '用户ID不能为空'
                    });
                }
                // 检查设备是否存在
                const device = devices.get(id);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 检查设备是否可用
                if (device.connectionStatus !== device_model_1.DeviceConnectionStatus.ONLINE) {
                    return res.status(400).json({
                        success: false,
                        message: `设备当前不可用，状态: ${device.connectionStatus}`
                    });
                }
                // 创建会话
                const sessionId = `session-${Date.now()}`;
                const newSession = {
                    id: sessionId,
                    deviceId: id,
                    userId,
                    experimentId,
                    startTime: new Date().toISOString(),
                    status: 'active',
                    commands: [],
                    dataPoints: [],
                    settings: settings || {}
                };
                // 存储会话
                deviceSessions.set(sessionId, newSession);
                // 生成一些初始数据点
                if (device.type === device_model_1.DeviceType.MICROSCOPE) {
                    const initialDataPoint = {
                        id: `dp-${Date.now()}`,
                        deviceId: id,
                        timestamp: new Date().toISOString(),
                        sensorType: 'camera',
                        value: 'https://example.com/microscope-image-1.jpg',
                        metadata: {
                            zoom: 100,
                            focus: 50,
                            illumination: 75
                        }
                    };
                    const deviceDataList = deviceDataPoints.get(id) || [];
                    deviceDataList.push(initialDataPoint);
                    deviceDataPoints.set(id, deviceDataList);
                    newSession.dataPoints.push(initialDataPoint);
                }
                res.json({
                    success: true,
                    message: '设备会话已创建',
                    data: {
                        sessionId,
                        deviceId: id,
                        startTime: newSession.startTime
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '创建设备会话失败'
                });
            }
        };
        // 结束设备会话
        this.endSession = (req, res) => {
            try {
                const { sessionId } = req.params;
                // 检查会话是否存在
                const session = deviceSessions.get(sessionId);
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备会话'
                    });
                }
                // 检查会话是否已结束
                if (session.status !== 'active') {
                    return res.status(400).json({
                        success: false,
                        message: `会话已${session.status === 'ended' ? '结束' : '发生错误'}`
                    });
                }
                // 结束会话
                session.status = 'ended';
                session.endTime = new Date().toISOString();
                // 更新会话
                deviceSessions.set(sessionId, session);
                res.json({
                    success: true,
                    message: '设备会话已结束',
                    data: {
                        sessionId,
                        deviceId: session.deviceId,
                        duration: new Date(session.endTime).getTime() - new Date(session.startTime).getTime(),
                        commandCount: session.commands.length,
                        dataPointCount: session.dataPoints.length
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '结束设备会话失败'
                });
            }
        };
        // 创建设备预约
        this.createReservation = (req, res) => {
            try {
                const { id } = req.params;
                const { userId, title, purpose, startTime, endTime } = req.body;
                // 验证参数
                if (!userId || !title || !startTime || !endTime) {
                    return res.status(400).json({
                        success: false,
                        message: '缺少必要的预约信息'
                    });
                }
                // 检查设备是否存在
                if (!devices.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 检查日期格式
                const start = new Date(startTime);
                const end = new Date(endTime);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: '无效的日期格式'
                    });
                }
                if (end <= start) {
                    return res.status(400).json({
                        success: false,
                        message: '结束时间必须晚于开始时间'
                    });
                }
                // 创建预约
                const reservationId = `rsv-${Date.now()}`;
                const newReservation = {
                    id: reservationId,
                    deviceId: id,
                    userId,
                    title,
                    purpose: purpose || '实验教学',
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                // 存储预约
                deviceReservations.set(reservationId, newReservation);
                res.status(201).json({
                    success: true,
                    message: '设备预约已创建，等待审批',
                    data: newReservation
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '创建设备预约失败'
                });
            }
        };
        // 获取设备预约列表
        this.getDeviceReservations = (req, res) => {
            try {
                const { id } = req.params;
                // 检查设备是否存在
                if (!devices.has(id)) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到指定的设备'
                    });
                }
                // 获取所有预约
                const allReservations = Array.from(deviceReservations.values());
                // 过滤指定设备的预约
                const deviceReservationList = allReservations.filter(r => r.deviceId === id);
                // 支持状态过滤
                const status = req.query.status;
                let filteredReservations = deviceReservationList;
                if (status) {
                    filteredReservations = deviceReservationList.filter(r => r.status === status);
                }
                // 按开始时间排序
                filteredReservations.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                res.json({
                    success: true,
                    data: filteredReservations
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || '获取设备预约列表失败'
                });
            }
        };
    }
}
exports.DeviceController = DeviceController;
exports.deviceController = new DeviceController();
