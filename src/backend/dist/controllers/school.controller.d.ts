import { Request, Response } from 'express';
declare class SchoolController {
    getAllSchools: (req: Request, res: Response) => Promise<void>;
    getSchoolByCode: (req: Request, res: Response) => Promise<void>;
    createSchool: (req: Request, res: Response) => Promise<void>;
    updateSchool: (req: Request, res: Response) => Promise<void>;
    deleteSchool: (req: Request, res: Response) => Promise<void>;
}
declare const _default: SchoolController;
export default _default;
//# sourceMappingURL=school.controller.d.ts.map