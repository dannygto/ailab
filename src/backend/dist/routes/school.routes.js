import express from 'express';
import schoolController from '../controllers/school.controller.js';
const router = express.Router();
router.get('/', schoolController.getAllSchools);
router.get('/:code', schoolController.getSchoolByCode);
router.post('/', schoolController.createSchool);
router.put('/:id', schoolController.updateSchool);
router.delete('/:id', schoolController.deleteSchool);
export default router;
//# sourceMappingURL=school.routes.js.map