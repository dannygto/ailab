import { Request, Response } from 'express';
export declare class AIAssistantController {
    private aiService;
    constructor();
    chat(req: Request, res: Response): Promise<void>;
    voiceChat(req: Request, res: Response): Promise<void>;
    analyzeExperiment(req: Request, res: Response): Promise<void>;
    getConversationHistory(req: Request, res: Response): Promise<void>;
    clearConversationHistory(req: Request, res: Response): Promise<void>;
    healthCheck(_req: Request, res: Response): Promise<void>;
    testConnection(req: Request, res: Response): Promise<void>;
    private sendErrorResponse;
}
//# sourceMappingURL=ai-assistant.controller.d.ts.map