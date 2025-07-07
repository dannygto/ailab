export interface AssistantContext {
    userId: string;
    experimentId?: string;
    experimentType?: string;
    experimentName?: string;
    role: 'student' | 'teacher' | 'admin';
    sessionId: string;
    currentPage?: string;
    deviceStatus?: {
        camera?: 'online' | 'offline';
        sensor?: 'online' | 'offline';
        robot?: 'online' | 'offline';
    };
    userProfile?: {
        level: 'beginner' | 'intermediate' | 'advanced';
        preferences?: {
            subjectAreas?: string[];
            experimentTypes?: string[];
        };
        educationLevel?: 'primary_school' | 'middle_school' | 'high_school' | 'undergraduate' | 'graduate';
        learningHistory?: string[];
    };
}
export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: AssistantContext;
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
    metadata?: {
        intent?: string;
        confidence?: number;
        processingTime?: number;
    };
}
export interface Suggestion {
    type: 'parameter' | 'experiment' | 'knowledge' | 'action' | 'analysis';
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    action?: AssistantAction;
    metadata?: Record<string, any>;
}
export interface AssistantAction {
    type: 'update_parameter' | 'navigate' | 'apply_parameters' | 'save_result' | 'parameter_adjustment' | 'analyze_data';
    title: string;
    description?: string;
    data: Record<string, any>;
    confirmRequired?: boolean;
}
export interface ChatRequest {
    message: string;
    mode: 'text' | 'voice' | 'image';
    context: AssistantContext;
    options?: {
        stream?: boolean;
        includeSuggestions?: boolean;
        includeActions?: boolean;
    };
}
export interface ChatResponse {
    response: string;
    messageId: string;
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
    context?: {
        conversationId: string;
        turnCount: number;
        userIntent: string;
    };
}
export interface ImageAnalysisRequest {
    image: string;
    task: 'experiment_result_analysis' | 'device_status' | 'error_diagnosis';
    context: {
        experimentId?: string;
        expectedResult?: string;
        deviceType?: string;
    };
}
export interface ImageAnalysisResponse {
    analysis: {
        type: string;
        confidence: number;
        result: string;
        details: Record<string, any>;
    };
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
}
export interface VoiceChatRequest {
    audio: string;
    format: 'wav' | 'mp3' | 'm4a';
    context: AssistantContext;
}
export interface VoiceChatResponse {
    transcription: string;
    intent: string;
    response: {
        text: string;
        audio?: string;
    };
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
}
export interface NotificationRequest {
    userId: string;
    type: 'experiment_alert' | 'device_warning' | 'learning_suggestion';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    content: string;
    context?: Record<string, any>;
    actions?: AssistantAction[];
    expiresAt?: Date;
}
export interface NotificationResponse {
    notificationId: string;
    status: 'sent' | 'delivered' | 'read';
    deliveryTime: Date;
}
export interface ExperimentAnalysisRequest {
    experimentId: string;
    analysisType: 'performance' | 'parameter' | 'trend' | 'anomaly';
    options?: {
        includeSuggestions?: boolean;
        includePredictions?: boolean;
    };
}
export interface ExperimentAnalysisResponse {
    analysis: {
        performance?: {
            accuracy: number;
            loss: number;
            trainingTime: string;
            efficiency: string;
        };
        parameters?: Record<string, {
            current: number;
            optimal: number;
            suggestion: string;
        }>;
        trends?: {
            accuracyTrend: string;
            lossTrend: string;
            convergence: string;
        };
        anomalies?: Array<{
            type: string;
            confidence: number;
            description: string;
        }>;
    };
    suggestions?: Suggestion[];
    predictions?: {
        expectedAccuracy: number;
        expectedTrainingTime: string;
        convergenceEpoch: number;
    };
}
export interface LearningAnalysisRequest {
    userId: string;
    analysisType: 'progress' | 'knowledge' | 'ability' | 'recommendation';
    timeRange?: {
        start: Date;
        end: Date;
    };
}
export interface LearningAnalysisResponse {
    progress?: {
        completedExperiments: number;
        totalExperiments: number;
        completionRate: number;
        averageScore: number;
    };
    knowledge?: {
        masteredTopics: string[];
        learningTopics: string[];
        weakTopics: string[];
        knowledgeGraph: Record<string, any>;
    };
    ability?: {
        experimentalSkills: string;
        theoreticalKnowledge: string;
        problemSolving: string;
        overallLevel: string;
    };
    recommendations?: Array<{
        type: 'experiment' | 'review';
        title: string;
        reason: string;
        priority: 'low' | 'medium' | 'high';
    }>;
}
export interface KnowledgeSearchRequest {
    query: string;
    filters?: {
        category?: string[];
        difficulty?: string;
        tags?: string[];
    };
    options?: {
        limit?: number;
        includeRelated?: boolean;
    };
}
export interface KnowledgeSearchResponse {
    results: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        tags: string[];
        relevance: number;
        relatedArticles?: string[];
    }>;
    total: number;
    suggestions?: string[];
}
export interface WebSocketMessage {
    type: 'auth' | 'chat' | 'response' | 'notification' | 'error';
    messageId?: string;
    content?: string;
    suggestions?: Suggestion[];
    actions?: AssistantAction[];
    timestamp: Date;
    data?: Record<string, any>;
}
export interface ApiError {
    code: number;
    message: string;
    type: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}
export interface AssistantConfig {
    apiUrl: string;
    wsUrl: string;
    features: {
        chat: boolean;
        voice: boolean;
        image: boolean;
        push: boolean;
    };
    theme: 'light' | 'dark';
    language: 'zh-CN' | 'en-US';
}
export interface Conversation {
    id: string;
    userId: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}
export interface Notification {
    id: string;
    userId: string;
    type: string;
    priority: string;
    content: string;
    context?: Record<string, any>;
    actions?: AssistantAction[];
    status: 'unread' | 'read';
    createdAt: Date;
    readAt?: Date;
    expiresAt?: Date;
}
export interface KnowledgeBase {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    difficulty: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}
export interface ExperimentResource {
    id: string;
    experimentId: string;
    type: 'dataset' | 'model' | 'checkpoint' | 'result';
    name: string;
    path: string;
    size: number;
    format: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map