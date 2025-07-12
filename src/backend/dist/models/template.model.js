"use strict";
// 实验模板系统模型定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateGradeLevel = exports.TemplateDifficultyLevel = void 0;
// 实验模板难度级别
var TemplateDifficultyLevel;
(function (TemplateDifficultyLevel) {
    TemplateDifficultyLevel["BEGINNER"] = "beginner";
    TemplateDifficultyLevel["INTERMEDIATE"] = "intermediate";
    TemplateDifficultyLevel["ADVANCED"] = "advanced";
    TemplateDifficultyLevel["EXPERT"] = "expert";
})(TemplateDifficultyLevel || (exports.TemplateDifficultyLevel = TemplateDifficultyLevel = {}));
// 实验模板教育阶段
var TemplateGradeLevel;
(function (TemplateGradeLevel) {
    TemplateGradeLevel["ELEMENTARY"] = "elementary";
    TemplateGradeLevel["MIDDLE"] = "middle";
    TemplateGradeLevel["HIGH"] = "high";
    TemplateGradeLevel["UNIVERSITY"] = "university";
})(TemplateGradeLevel || (exports.TemplateGradeLevel = TemplateGradeLevel = {}));
