import express from 'express';
import experimentController from '../controllers/experiment.controller.js';
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
const router = express.Router();
router.get('/', experimentController.getAllExperiments);
router.post('/', experimentController.createExperiment);
router.get('/:id', experimentController.getExperimentById);
router.put('/:id', experimentController.updateExperiment);
router.delete('/:id', experimentController.deleteExperiment);
router.post('/:id/start', experimentController.startExperiment);
router.post('/:id/stop', experimentController.stopExperiment);
router.post('/:id/clone', experimentController.cloneExperiment);
router.get('/:id/results', experimentController.getExperimentResults);
router.post('/:id/upload', upload.single('file'), experimentController.uploadExperimentData);
router.get('/:id/execution', experimentController.getExperimentExecution);
router.get('/:id/logs', experimentController.getExperimentLogs);
router.get('/:id/metrics', experimentController.getExperimentMetrics);
export default router;
//# sourceMappingURL=experiment.routes.js.map