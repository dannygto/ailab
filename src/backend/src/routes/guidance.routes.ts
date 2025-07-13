import express from 'express';
import { guidanceController } from '../controllers/guidance.controller.js';

const router = express.Router();

// 指导建议相关路由
router.get('/suggestions', guidanceController.getAllGuidanceSuggestions);
router.get('/suggestions/:id', guidanceController.getGuidanceSuggestionById);
router.post('/suggestions', guidanceController.createGuidanceSuggestion);
router.put('/suggestions/:id', guidanceController.updateGuidanceSuggestion);
router.delete('/suggestions/:id', guidanceController.deleteGuidanceSuggestion);

// AI指导生成相关路由
router.post('/generate', guidanceController.generateAIGuidance);

// 指导会话相关路由
router.get('/sessions/:sessionId', guidanceController.getGuidanceSessionHistory);
router.post('/sessions/:sessionId/questions', guidanceController.addStudentQuestion);

export default router;
