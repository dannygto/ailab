export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface AIResponse {
    content: string;
    reasoning_content?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    } | undefined;
}
export declare class AIModelsService {
    private arkClient;
    private deepseekClient;
    constructor();
    callVolcanicArk(messages: AIMessage[], options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
    }): Promise<AIResponse>;
    callDeepSeekReasoner(messages: AIMessage[], options?: {
        stream?: boolean;
        temperature?: number;
        max_tokens?: number;
        onChunk?: (content: string, reasoning?: string) => void;
    }): Promise<AIResponse>;
    callDeepSeekChat(messages: AIMessage[], options?: {
        temperature?: number;
        max_tokens?: number;
    }): Promise<AIResponse>;
    callAI(messages: AIMessage[], options?: {
        preferredModel?: 'volcanic-ark' | 'deepseek-reasoner' | 'deepseek-chat';
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
        onChunk?: (content: string, reasoning?: string) => void;
    }): Promise<AIResponse>;
    testConnection(model: 'volcanic-ark' | 'deepseek-reasoner' | 'deepseek-chat'): Promise<{
        success: boolean;
        message: string;
        latency?: number;
    }>;
    getAvailableModels(): Array<{
        id: string;
        name: string;
        provider: string;
        description: string;
    }>;
}
//# sourceMappingURL=ai-models.service.d.ts.map