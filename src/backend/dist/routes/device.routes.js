"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const device_controller_1 = require("../controllers/device.controller");
const router = express_1.default.Router();
// 设备管理路由
router.get('/', device_controller_1.deviceController.getAllDevices);
router.get('/:id', device_controller_1.deviceController.getDeviceById);
router.put('/:id/status', device_controller_1.deviceController.updateDeviceStatus);
// 设备命令和数据路由
router.post('/:id/commands', device_controller_1.deviceController.sendCommand);
router.get('/:id/commands', device_controller_1.deviceController.getDeviceCommands);
router.get('/:id/data', device_controller_1.deviceController.getDeviceData);
// 设备会话路由
router.post('/:id/sessions', device_controller_1.deviceController.createSession);
router.put('/sessions/:sessionId/end', device_controller_1.deviceController.endSession);
// 设备预约路由
router.post('/:id/reservations', device_controller_1.deviceController.createReservation);
router.get('/:id/reservations', device_controller_1.deviceController.getDeviceReservations);
exports.default = router;
