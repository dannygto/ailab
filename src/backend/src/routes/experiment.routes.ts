import express from 'express';
import experimentController from '../controllers/experiment.controller.js';
import multer from 'multer';

// 配置文件上传
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

/**
 * 实验相关路由
 *
 * 实现所有与实验相关的RESTful API端点
 * 包括: 查询、创建、更新、删除实验，以及启动、停止、克隆实验等操作
 */

// 基础CRUD操作
router.get('/', experimentController.getAllExperiments);
router.post('/', experimentController.createExperiment);
router.get('/:id', experimentController.getExperimentById);
router.put('/:id', experimentController.updateExperiment);
router.delete('/:id', experimentController.deleteExperiment);

// 实验控制操作
router.post('/:id/start', experimentController.startExperiment);
router.post('/:id/stop', experimentController.stopExperiment);
router.post('/:id/clone', experimentController.cloneExperiment);

// 实验数据操作
router.get('/:id/results', experimentController.getExperimentResults);
router.post('/:id/upload', upload.single('file'), experimentController.uploadExperimentData);

// 实验执行状态
router.get('/:id/execution', experimentController.getExperimentExecution);
router.get('/:id/logs', experimentController.getExperimentLogs);
router.get('/:id/metrics', experimentController.getExperimentMetrics);

export default router;
