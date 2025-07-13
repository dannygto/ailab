import express from 'express';
import { deviceController } from '../controllers/device.controller.js';

const router = express.Router();

// 设备管理路由
router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDeviceById);
router.put('/:id/status', deviceController.updateDeviceStatus);

// 设备命令和数据路由
router.post('/:id/commands', deviceController.sendCommand);
router.get('/:id/commands', deviceController.getDeviceCommands);
router.get('/:id/data', deviceController.getDeviceData);

// 设备会话路由
router.post('/:id/sessions', deviceController.createSession);
router.put('/sessions/:sessionId/end', deviceController.endSession);

// 设备预约路由
router.post('/:id/reservations', deviceController.createReservation);
router.get('/:id/reservations', deviceController.getDeviceReservations);

export default router;
