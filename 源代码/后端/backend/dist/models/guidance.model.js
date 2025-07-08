"use strict";
// 智能指导系统模型定义
// 定义智能指导相关的数据类型和接口
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidanceSuggestionType = exports.LearningProgressStatus = void 0;
// 学习进度类型
var LearningProgressStatus;
(function (LearningProgressStatus) {
    LearningProgressStatus["BEGINNING"] = "beginning";
    LearningProgressStatus["PROGRESSING"] = "progressing";
    LearningProgressStatus["ADVANCED"] = "advanced";
    LearningProgressStatus["MASTERED"] = "mastered";
})(LearningProgressStatus || (exports.LearningProgressStatus = LearningProgressStatus = {}));
// 指导建议类型
var GuidanceSuggestionType;
(function (GuidanceSuggestionType) {
    GuidanceSuggestionType["CONCEPT"] = "concept";
    GuidanceSuggestionType["PRACTICAL"] = "practical";
    GuidanceSuggestionType["SAFETY"] = "safety";
    GuidanceSuggestionType["NEXT_STEP"] = "next_step";
    GuidanceSuggestionType["CORRECTION"] = "correction";
    GuidanceSuggestionType["REINFORCEMENT"] = "reinforcement";
})(GuidanceSuggestionType || (exports.GuidanceSuggestionType = GuidanceSuggestionType = {}));
