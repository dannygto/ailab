"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const experiment_controller_1 = __importDefault(require("../controllers/experiment.controller"));
const multer_1 = __importDefault(require("multer"));
// 配置文件上传
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const router = express_1.default.Router();
/**
 * 实验相关路由
 *
 * 实现所有与实验相关的RESTful API端点
 * 包括: 查询、创建、更新、删除实验，以及启动、停止、克隆实验等操作
 */
// 基础CRUD操作
router.get('/', experiment_controller_1.default.getAllExperiments);
router.post('/', experiment_controller_1.default.createExperiment);
router.get('/:id', experiment_controller_1.default.getExperimentById);
router.put('/:id', experiment_controller_1.default.updateExperiment);
router.delete('/:id', experiment_controller_1.default.deleteExperiment);
// 实验控制操作
router.post('/:id/start', experiment_controller_1.default.startExperiment);
router.post('/:id/stop', experiment_controller_1.default.stopExperiment);
router.post('/:id/clone', experiment_controller_1.default.cloneExperiment);
// 实验数据操作
router.get('/:id/results', experiment_controller_1.default.getExperimentResults);
router.post('/:id/upload', upload.single('file'), experiment_controller_1.default.uploadExperimentData);
// 实验执行状态
router.get('/:id/execution', experiment_controller_1.default.getExperimentExecution);
router.get('/:id/logs', experiment_controller_1.default.getExperimentLogs);
router.get('/:id/metrics', experiment_controller_1.default.getExperimentMetrics);
exports.default = router;
