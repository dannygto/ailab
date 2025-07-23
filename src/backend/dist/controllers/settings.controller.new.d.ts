import { Request, Response } from 'express';
export declare const getSettings: (req: Request, res: Response) => Promise<void>;
export declare const getGeneralSettings: (req: Request, res: Response) => Promise<void>;
export declare const updateGeneralSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getThemeSettings: (req: Request, res: Response) => Promise<void>;
export declare const updateThemeSettings: (req: Request, res: Response) => Promise<void>;
export declare const getSchoolInfo: (req: Request, res: Response) => Promise<void>;
export declare const updateSchoolInfo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetSettings: (req: Request, res: Response) => Promise<void>;
export declare const getVersionInfo: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=settings.controller.new.d.ts.map