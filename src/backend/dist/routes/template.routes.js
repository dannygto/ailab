"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const template_controller_1 = require("../controllers/template.controller");
const router = express_1.default.Router();
// 模板路由
router.get('/', template_controller_1.templateController.getAllTemplates);
router.post('/', template_controller_1.templateController.createTemplate);
router.get('/popular', template_controller_1.templateController.getPopularTemplates);
router.post('/search', template_controller_1.templateController.searchTemplates);
router.get('/:id', template_controller_1.templateController.getTemplateById);
router.put('/:id', template_controller_1.templateController.updateTemplate);
router.delete('/:id', template_controller_1.templateController.deleteTemplate);
exports.default = router;
