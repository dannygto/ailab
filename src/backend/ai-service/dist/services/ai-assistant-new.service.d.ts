import { ChatRequest, ChatResponse, AssistantContext, Suggestion, AssistantAction } from '@/types';
export interface ChatRequest {
    message: string;
    context: AssistantContext;
    options?: {
        includeSuggestions?: boolean;
        includeActions?: boolean;
    };
}
export interface ChatResponse {
    id: string;
    message: string;
    reasoning?: string;
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    timestamp: string;
}
export interface AssistantContext {
    userId: string;
    role: string;
    currentPage?: string;
    experimentId?: string;
    deviceStatus?: any;
    userProfile?: {
        level: string;
        subjects: string[];
    };
}
export interface Suggestion {
    id: string;
    text: string;
    category: 'experiment' | 'parameter' | 'analysis' | 'knowledge' | 'general';
}
export interface AssistantAction {
    type: string;
    title: string;
    description: string;
    data?: any;
    confirmRequired: boolean;
}
export declare class AIAssistantService {
    private aiModels;
    constructor();
    processChat(request: ChatRequest): Promise<ChatResponse>;
    private selectModel;
    private isReasoningTask;
    private isProgrammingTask;
    private buildSystemPrompt;
    private formatDeviceStatus;
    private getConversationHistory;
    private saveConversation;
    private generateSuggestions;
    private generateActions;
    private extractIntent;
    private extractParameterSuggestions;
    private generateMessageId;
    private generateMockResponse;
    testModelConnection(modelName: string, _config: any, _specificParams?: any): Promise<{
        success: boolean;
        message: string;
        modelInfo?: any;
    }>;
}
//# sourceMappingURL=ai-assistant-new.service.d.ts.map