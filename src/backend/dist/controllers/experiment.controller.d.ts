import { Request, Response } from 'express';
declare class ExperimentController {
    getAllExperiments: (req: Request, res: Response) => Promise<void>;
    getExperimentById: (req: Request, res: Response) => Promise<void>;
    createExperiment: (req: Request, res: Response) => Promise<void>;
    updateExperiment: (req: Request, res: Response) => Promise<void>;
    deleteExperiment: (req: Request, res: Response) => Promise<void>;
    startExperiment: (req: Request, res: Response) => Promise<void>;
    stopExperiment: (req: Request, res: Response) => Promise<void>;
    cloneExperiment: (req: Request, res: Response) => Promise<void>;
    getExperimentResults: (req: Request, res: Response) => Promise<void>;
    uploadExperimentData: (req: Request, res: Response) => Promise<void>;
    getExperimentExecution: (req: Request, res: Response) => Promise<void>;
    getExperimentLogs: (req: Request, res: Response) => Promise<void>;
    getExperimentMetrics: (req: Request, res: Response) => Promise<void>;
}
declare const _default: ExperimentController;
export default _default;
//# sourceMappingURL=experiment.controller.d.ts.map