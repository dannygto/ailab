import { Request, Response } from 'express';
export declare class GuidanceController {
    getAllGuidanceSuggestions: (req: Request, res: Response) => void;
    getGuidanceSuggestionById: (req: Request, res: Response) => Response<any, Record<string, any>>;
    createGuidanceSuggestion: (req: Request, res: Response) => Response<any, Record<string, any>>;
    updateGuidanceSuggestion: (req: Request, res: Response) => Response<any, Record<string, any>>;
    deleteGuidanceSuggestion: (req: Request, res: Response) => Response<any, Record<string, any>>;
    generateAIGuidance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getGuidanceSessionHistory: (req: Request, res: Response) => Response<any, Record<string, any>>;
    addStudentQuestion: (req: Request, res: Response) => Response<any, Record<string, any>>;
}
export declare const guidanceController: GuidanceController;
//# sourceMappingURL=guidance.controller.d.ts.map