"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_assistant_controller_1 = require("@/controllers/ai-assistant.controller");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const rate_limit_1 = require("@/middleware/rate-limit");
const router = (0, express_1.Router)();
const controller = new ai_assistant_controller_1.AIAssistantController();
router.post('/chat', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 60000, max: 30 }), (0, validation_1.validateRequest)({
    body: {
        message: { type: 'string', required: true, maxLength: 1000 },
        mode: { type: 'string', enum: ['text', 'voice', 'image'], default: 'text' },
        context: {
            type: 'object',
            required: true,
            properties: {
                userId: { type: 'string', required: true },
                experimentId: { type: 'string' },
                role: { type: 'string', enum: ['student', 'teacher', 'admin'], required: true },
                sessionId: { type: 'string', required: true },
                currentPage: { type: 'string' },
                deviceStatus: { type: 'object' },
                userProfile: { type: 'object' },
            },
        },
        options: {
            type: 'object',
            properties: {
                stream: { type: 'boolean' },
                includeSuggestions: { type: 'boolean' },
                includeActions: { type: 'boolean' },
            },
        },
    },
}), controller.chat.bind(controller));
router.post('/voice-chat', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 60000, max: 10 }), (0, validation_1.validateRequest)({
    body: {
        audio: { type: 'string', required: true },
        format: { type: 'string', enum: ['wav', 'mp3', 'm4a'], required: true },
        context: {
            type: 'object',
            required: true,
            properties: {
                userId: { type: 'string', required: true },
                experimentId: { type: 'string' },
                role: { type: 'string', enum: ['student', 'teacher', 'admin'], required: true },
                sessionId: { type: 'string', required: true },
            },
        },
    },
}), controller.voiceChat.bind(controller));
router.post('/analyze-experiment', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 300000, max: 20 }), (0, validation_1.validateRequest)({
    body: {
        experimentId: { type: 'string', required: true },
        data: { type: 'object', required: true },
    },
}), controller.analyzeExperiment.bind(controller));
router.post('/analyze-discipline-experiment', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 300000, max: 20 }), (0, validation_1.validateRequest)({
    body: {
        experimentId: { type: 'string', required: true },
        disciplineType: {
            type: 'string',
            enum: [
                'physics_experiment',
                'chemistry_experiment',
                'biology_experiment',
                'computer_science_experiment',
                'robotics_experiment',
            ],
            required: true,
        },
        data: { type: 'object', required: true },
    },
}), controller.analyzeExperiment.bind(controller));
router.get('/conversation-history/:userId', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 60000, max: 10 }), (0, validation_1.validateRequest)({
    params: {
        userId: { type: 'string', required: true },
    },
    query: {
        limit: { type: 'number', min: 1, max: 100, default: 20 },
        offset: { type: 'number', min: 0, default: 0 },
    },
}), controller.getConversationHistory.bind(controller));
router.delete('/conversation-history/:userId', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 300000, max: 5 }), (0, validation_1.validateRequest)({
    params: {
        userId: { type: 'string', required: true },
    },
}), controller.clearConversationHistory.bind(controller));
router.get('/health', controller.healthCheck.bind(controller));
router.post('/test-connection', auth_1.authenticateUser, (0, rate_limit_1.rateLimit)({ windowMs: 60000, max: 10 }), (0, validation_1.validateRequest)({
    body: {
        model: { type: 'string', required: true },
        config: {
            type: 'object',
            required: true,
            properties: {
                apiKey: { type: 'string', required: true },
                temperature: { type: 'number' },
                maxTokens: { type: 'number' },
                systemPrompt: { type: 'string' },
                customEndpoint: { type: 'string' },
            },
        },
        specificParams: { type: 'object' },
    },
}), controller.testConnection.bind(controller));
exports.default = router;
//# sourceMappingURL=ai-assistant.routes.js.map