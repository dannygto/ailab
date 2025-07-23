import { Request, Response } from 'express';
export declare class TemplateController {
    getAllTemplates: (req: Request, res: Response) => void;
    getTemplateById: (req: Request, res: Response) => void;
    createTemplate: (req: Request, res: Response) => Response<any, Record<string, any>>;
    updateTemplate: (req: Request, res: Response) => Response<any, Record<string, any>>;
    deleteTemplate: (req: Request, res: Response) => Response<any, Record<string, any>>;
    searchTemplates: (req: Request, res: Response) => void;
    getPopularTemplates: (req: Request, res: Response) => void;
}
export declare const templateController: TemplateController;
//# sourceMappingURL=template.controller.d.ts.map