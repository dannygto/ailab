import { ChatRequest, ChatResponse } from '@/types';
export declare class AIAssistantService {
    private openai;
    private dbManager;
    private arkApiKey;
    private arkBaseUrl;
    private arkModel;
    constructor();
    processChat(request: ChatRequest): Promise<ChatResponse>;
    const suggestions: any;
    const actions: any;
}
//# sourceMappingURL=ai-assistant.service.backup.d.ts.map