"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileUpload = exports.validateFileSize = exports.validateFileType = exports.validatePassword = exports.validatePhone = exports.validateEmail = exports.commonValidationRules = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("@/utils/logger");
function convertToJoiSchema(rules) {
    const joiSchema = {};
    for (const [field, rule] of Object.entries(rules)) {
        let joiField;
        switch (rule.type) {
            case 'string':
                joiField = joi_1.default.string();
                if (rule.maxLength)
                    joiField = joiField.max(rule.maxLength);
                break;
            case 'number':
                joiField = joi_1.default.number();
                if (rule.min !== undefined)
                    joiField = joiField.min(rule.min);
                if (rule.max !== undefined)
                    joiField = joiField.max(rule.max);
                break;
            case 'boolean':
                joiField = joi_1.default.boolean();
                break;
            case 'object':
                if (rule.properties) {
                    joiField = convertToJoiSchema(rule.properties);
                }
                else {
                    joiField = joi_1.default.object();
                }
                break;
            case 'array':
                joiField = joi_1.default.array();
                break;
            default:
                joiField = joi_1.default.any();
        }
        if (rule.enum) {
            joiField = joiField.valid(...rule.enum);
        }
        if (rule.required) {
            joiField = joiField.required();
        }
        else if (rule.default !== undefined) {
            joiField = joiField.default(rule.default);
        }
        else {
            joiField = joiField.optional();
        }
        joiSchema[field] = joiField;
    }
    return joi_1.default.object(joiSchema);
}
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const errors = [];
            if (schema.body) {
                const bodySchema = convertToJoiSchema(schema.body);
                const { error } = bodySchema.validate(req.body, { abortEarly: false });
                if (error) {
                    error.details.forEach((detail) => {
                        errors.push({
                            field: detail.path.join('.'),
                            message: detail.message,
                        });
                    });
                }
            }
            if (schema.query) {
                const querySchema = convertToJoiSchema(schema.query);
                const { error } = querySchema.validate(req.query, { abortEarly: false });
                if (error) {
                    error.details.forEach((detail) => {
                        errors.push({
                            field: `query.${detail.path.join('.')}`,
                            message: detail.message,
                        });
                    });
                }
            }
            if (schema.params) {
                const paramsSchema = convertToJoiSchema(schema.params);
                const { error } = paramsSchema.validate(req.params, { abortEarly: false });
                if (error) {
                    error.details.forEach((detail) => {
                        errors.push({
                            field: `params.${detail.path.join('.')}`,
                            message: detail.message,
                        });
                    });
                }
            }
            if (errors.length > 0) {
                logger_1.logger.warn(`Validation failed for ${req.method} ${req.originalUrl}:`, errors);
                res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: '请求参数验证失败',
                        type: 'VALIDATION_ERROR',
                        details: errors,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            logger_1.logger.debug(`Request validation passed for ${req.method} ${req.originalUrl}`);
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: '请求验证服务错误',
                    type: 'INTERNAL_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validateRequest = validateRequest;
exports.commonValidationRules = {
    userId: {
        type: 'string',
        required: true,
        maxLength: 50,
    },
    experimentId: {
        type: 'string',
        required: true,
        maxLength: 100,
    },
    message: {
        type: 'string',
        required: true,
        maxLength: 1000,
    },
    pagination: {
        limit: {
            type: 'number',
            min: 1,
            max: 100,
            default: 20,
        },
        offset: {
            type: 'number',
            min: 0,
            default: 0,
        },
    },
    timeRange: {
        start: {
            type: 'string',
            required: true,
        },
        end: {
            type: 'string',
            required: true,
        },
    },
    fileUpload: {
        file: {
            type: 'object',
            required: true,
        },
        maxSize: {
            type: 'number',
            default: 10 * 1024 * 1024,
        },
        allowedTypes: {
            type: 'array',
            default: ['image/jpeg', 'image/png', 'image/gif'],
        },
    },
};
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.mimetype);
};
exports.validateFileType = validateFileType;
const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};
exports.validateFileSize = validateFileSize;
const validateFileUpload = (options) => {
    return (req, res, next) => {
        try {
            const file = req.file || req.files?.[options.fieldName || 'file'];
            if (!file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: '缺少上传文件',
                        type: 'FILE_UPLOAD_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const maxSize = options.maxSize || 10 * 1024 * 1024;
            const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
            if (!(0, exports.validateFileSize)(file, maxSize)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: `文件大小超过限制 (${maxSize / 1024 / 1024}MB)`,
                        type: 'FILE_SIZE_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (!(0, exports.validateFileType)(file, allowedTypes)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: `不支持的文件类型，支持的类型: ${allowedTypes.join(', ')}`,
                        type: 'FILE_TYPE_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('File upload validation error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: '文件上传验证服务错误',
                    type: 'INTERNAL_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validateFileUpload = validateFileUpload;
//# sourceMappingURL=validation.js.map