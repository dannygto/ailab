import express from 'express';
import settingsController from '../controllers/settings.controller.js';
const router = express.Router();
router.get('/', settingsController.getAllSettings);
router.get('/general', settingsController.getGeneralSettings);
router.put('/general', settingsController.updateGeneralSettings);
router.post('/general', settingsController.updateGeneralSettings);
router.get('/theme', settingsController.getThemeSettings);
router.put('/theme', settingsController.updateThemeSettings);
router.post('/theme', settingsController.updateThemeSettings);
router.get('/data', settingsController.getDataSettings);
router.put('/data', settingsController.updateDataSettings);
router.get('/demo-data-stats', settingsController.getDemoDataStats);
router.post('/generate-demo-data', settingsController.generateDemoData);
router.post('/delete-demo-data', settingsController.deleteDemoData);
router.post('/generate-deployment', settingsController.generateDockerDeployment);
router.post('/reset', settingsController.resetAllSettings);
export default router;
//# sourceMappingURL=settings.routes.js.map