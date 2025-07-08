import { Request, Response, NextFunction } from 'express';
interface ValidationRule {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
    enum?: string[];
    default?: any;
    properties?: Record<string, ValidationRule>;
}
interface ValidationSchema {
    body?: Record<string, ValidationRule>;
    query?: Record<string, ValidationRule>;
    params?: Record<string, ValidationRule>;
}
export declare const validateRequest: (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonValidationRules: {
    userId: {
        type: string;
        required: boolean;
        maxLength: number;
    };
    experimentId: {
        type: string;
        required: boolean;
        maxLength: number;
    };
    message: {
        type: string;
        required: boolean;
        maxLength: number;
    };
    pagination: {
        limit: {
            type: string;
            min: number;
            max: number;
            default: number;
        };
        offset: {
            type: string;
            min: number;
            default: number;
        };
    };
    timeRange: {
        start: {
            type: string;
            required: boolean;
        };
        end: {
            type: string;
            required: boolean;
        };
    };
    fileUpload: {
        file: {
            type: string;
            required: boolean;
        };
        maxSize: {
            type: string;
            default: number;
        };
        allowedTypes: {
            type: string;
            default: string[];
        };
    };
};
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhone: (phone: string) => boolean;
export declare const validatePassword: (password: string) => boolean;
export declare const validateFileType: (file: Express.Multer.File, allowedTypes: string[]) => boolean;
export declare const validateFileSize: (file: Express.Multer.File, maxSize: number) => boolean;
export declare const validateFileUpload: (options: {
    maxSize?: number;
    allowedTypes?: string[];
    fieldName?: string;
}) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.d.ts.map