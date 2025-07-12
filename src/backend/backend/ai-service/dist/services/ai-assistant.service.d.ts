import { ChatRequest, ChatResponse, AssistantContext } from '@/types';
export declare class AIAssistantService {
    private openai;
    private dbManager;
    private arkApiKey;
    private arkBaseUrl;
    private arkModel;
    private deepseekApiKey;
    constructor();
    processChat(request: ChatRequest): Promise<ChatResponse>;
    private buildSystemPrompt;
    private formatDeviceStatus;
    private getConversationHistory;
    private saveConversation;
    private generateSuggestions;
    private getEducationLevelFromContext;
    private formatEducationLevel;
    private extractSubjectArea;
    private generateActions;
    private extractIntent;
    private extractParameterSuggestions;
    private generateMessageId;
    processVoiceChat(_audioData: string, _context: AssistantContext): Promise<any>;
    private generateMockResponse;
    private callArkAPI;
    private callDeepSeekAPI;
    testModelConnection(modelName: string, config: any, specificParams?: any): Promise<{
        success: boolean;
        message: string;
        modelInfo?: any;
    }>;
}
//# sourceMappingURL=ai-assistant.service.d.ts.map