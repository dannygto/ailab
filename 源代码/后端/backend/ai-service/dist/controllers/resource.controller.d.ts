import { Request, Response } from 'express';
declare class ResourceController {
    getResources(req: Request, res: Response): Promise<void>;
    getResource(req: Request, res: Response): Promise<void>;
    createResource(req: Request, res: Response): Promise<void>;
    updateResource(req: Request, res: Response): Promise<void>;
    deleteResource(req: Request, res: Response): Promise<void>;
    private generateMockResources;
}
declare const _default: ResourceController;
export default _default;
//# sourceMappingURL=resource.controller.d.ts.map