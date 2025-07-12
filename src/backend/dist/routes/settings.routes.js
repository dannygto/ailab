"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_controller_1 = __importDefault(require("../controllers/settings.controller"));
const router = express_1.default.Router();
/**
 * 系统设置路由
 *
 * 提供系统设置相关的API端点
 * 包括: 通用设置、主题设置、数据设置的获取和更新
 */
// 获取所有设置
router.get('/', settings_controller_1.default.getAllSettings);
// 通用设置
router.get('/general', settings_controller_1.default.getGeneralSettings);
router.put('/general', settings_controller_1.default.updateGeneralSettings);
// 主题设置
router.get('/theme', settings_controller_1.default.getThemeSettings);
router.put('/theme', settings_controller_1.default.updateThemeSettings);
// 数据设置
router.get('/data', settings_controller_1.default.getDataSettings);
router.put('/data', settings_controller_1.default.updateDataSettings);
// 重置所有设置
router.post('/reset', settings_controller_1.default.resetAllSettings);
exports.default = router;
