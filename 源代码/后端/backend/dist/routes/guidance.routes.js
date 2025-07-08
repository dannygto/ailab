"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guidance_controller_1 = require("../controllers/guidance.controller");
const router = express_1.default.Router();
// 指导建议相关路由
router.get('/suggestions', guidance_controller_1.guidanceController.getAllGuidanceSuggestions);
router.get('/suggestions/:id', guidance_controller_1.guidanceController.getGuidanceSuggestionById);
router.post('/suggestions', guidance_controller_1.guidanceController.createGuidanceSuggestion);
router.put('/suggestions/:id', guidance_controller_1.guidanceController.updateGuidanceSuggestion);
router.delete('/suggestions/:id', guidance_controller_1.guidanceController.deleteGuidanceSuggestion);
// AI指导生成相关路由
router.post('/generate', guidance_controller_1.guidanceController.generateAIGuidance);
// 指导会话相关路由
router.get('/sessions/:sessionId', guidance_controller_1.guidanceController.getGuidanceSessionHistory);
router.post('/sessions/:sessionId/questions', guidance_controller_1.guidanceController.addStudentQuestion);
exports.default = router;
