"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resource_controller_1 = __importDefault(require("../controllers/resource.controller"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/resources', auth_1.authenticateUser, resource_controller_1.default.getResources);
router.get('/resources/:id', auth_1.authenticateUser, resource_controller_1.default.getResource);
router.post('/resources', auth_1.authenticateUser, resource_controller_1.default.createResource);
router.put('/resources/:id', auth_1.authenticateUser, resource_controller_1.default.updateResource);
router.delete('/resources/:id', auth_1.authenticateUser, resource_controller_1.default.deleteResource);
exports.default = router;
//# sourceMappingURL=resource.routes.js.map