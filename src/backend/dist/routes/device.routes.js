import express from 'express';
import { deviceController } from '../controllers/device.controller.js';
const router = express.Router();
router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDeviceById);
router.put('/:id/status', deviceController.updateDeviceStatus);
router.post('/:id/commands', deviceController.sendCommand);
router.get('/:id/commands', deviceController.getDeviceCommands);
router.get('/:id/data', deviceController.getDeviceData);
router.post('/:id/sessions', deviceController.createSession);
router.put('/sessions/:sessionId/end', deviceController.endSession);
router.post('/:id/reservations', deviceController.createReservation);
router.get('/:id/reservations', deviceController.getDeviceReservations);
export default router;
//# sourceMappingURL=device.routes.js.map