import express from 'express';
import { guidanceController } from '../controllers/guidance.controller.js';
const router = express.Router();
router.get('/suggestions', guidanceController.getAllGuidanceSuggestions);
router.get('/suggestions/:id', guidanceController.getGuidanceSuggestionById);
router.post('/suggestions', guidanceController.createGuidanceSuggestion);
router.put('/suggestions/:id', guidanceController.updateGuidanceSuggestion);
router.delete('/suggestions/:id', guidanceController.deleteGuidanceSuggestion);
router.post('/generate', guidanceController.generateAIGuidance);
router.get('/sessions/:sessionId', guidanceController.getGuidanceSessionHistory);
router.post('/sessions/:sessionId/questions', guidanceController.addStudentQuestion);
export default router;
//# sourceMappingURL=guidance.routes.js.map