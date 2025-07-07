import { Router } from 'express';
import experimentController from '../controllers/experiment.controller';

const router = Router();

/**
 * 实验执行状态路由
 */

// 获取实验执行状态
router.get('/:id/execution', experimentController.getExperimentExecution);

// 获取实验日志
router.get('/:id/logs', experimentController.getExperimentLogs);

// 获取实验指标
router.get('/:id/metrics', experimentController.getExperimentMetrics);

export default router;
