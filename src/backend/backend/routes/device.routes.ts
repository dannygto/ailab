// 设备路由配置
import express from 'express';
import { deviceController } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 所有设备路由都需要认证
router.use(authenticate);

// 获取所有设备
router.get('/', deviceController.getAllDevices);

// 获取单个设备
router.get('/:id', deviceController.getDeviceById);

// 更新设备状态
router.put('/:id/status', deviceController.updateDeviceStatus);

// 发送命令到设备
router.post('/:id/command', deviceController.sendCommand);

// 获取设备命令历史
router.get('/:id/commands', deviceController.getDeviceCommands);

// 获取设备数据
router.get('/:id/data', deviceController.getDeviceData);

// 创建设备会话
router.post('/:id/sessions', deviceController.createSession);

// 结束设备会话
router.put('/sessions/:sessionId/end', deviceController.endSession);

// 创建设备预约
router.post('/:id/reservations', deviceController.createReservation);

// 获取设备预约列表
router.get('/:id/reservations', deviceController.getDeviceReservations);

export default router;
