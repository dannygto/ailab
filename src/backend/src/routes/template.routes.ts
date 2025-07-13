import express from 'express';
import { templateController } from '../controllers/template.controller.js';

const router = express.Router();

// 模板路由
router.get('/', templateController.getAllTemplates);
router.post('/', templateController.createTemplate);
router.get('/popular', templateController.getPopularTemplates);
router.post('/search', templateController.searchTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
