export interface AIModelConfig {
    id: string;
    name: string;
    provider: string;
    endpoint: string;
    apiKey?: string;
    available: boolean;
    maxTokens: number;
    temperature: number;
    description: string;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
        };
    }>;
}
export interface AIResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    finishReason?: string;
    reasoningContent?: string;
}
export declare class AIService {
    private models;
    constructor();
    private initializeModels;
    getAvailableModels(): AIModelConfig[];
    getModelConfig(modelId: string): AIModelConfig | undefined;
    private callVolcanicArk;
    private callDeepSeek;
    chat(messages: ChatMessage[], modelId?: string, options?: {
        temperature?: number;
        maxTokens?: number;
        apiKey?: string;
    }): Promise<AIResponse>;
    testModelConnection(modelId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testAllModels(): Promise<Record<string, {
        success: boolean;
        message: string;
    }>>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map