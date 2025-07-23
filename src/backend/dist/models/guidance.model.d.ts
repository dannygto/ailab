export declare enum LearningProgressStatus {
    BEGINNING = "beginning",
    PROGRESSING = "progressing",
    ADVANCED = "advanced",
    MASTERED = "mastered"
}
export interface LearningProgress {
    studentId: string;
    subjectId: string;
    topicId: string;
    status: LearningProgressStatus;
    completedExperiments: string[];
    assessmentScores: {
        [assessmentId: string]: number;
    };
    lastUpdated: string;
}
export declare enum GuidanceSuggestionType {
    CONCEPT = "concept",
    PRACTICAL = "practical",
    SAFETY = "safety",
    NEXT_STEP = "next_step",
    CORRECTION = "correction",
    REINFORCEMENT = "reinforcement"
}
export interface GuidanceSuggestion {
    id: string;
    type: GuidanceSuggestionType;
    title: string;
    content: string;
    importance: number;
    triggerConditions: {
        progressStatus?: LearningProgressStatus[];
        errorPatterns?: string[];
        timeTrigger?: boolean;
        manualTrigger?: boolean;
    };
    relatedResources?: {
        id: string;
        type: 'video' | 'document' | 'template' | 'external';
        title: string;
        url: string;
    }[];
    createdAt: string;
}
export interface ExperimentMonitoringRecord {
    id: string;
    experimentId: string;
    studentId: string;
    timestamp: string;
    stage: string;
    metrics: {
        timeSpent: number;
        completionPercentage: number;
        errorCount: number;
        attentionLevel?: number;
    };
    observations: {
        type: 'system' | 'ai' | 'teacher';
        content: string;
        timestamp: string;
    }[];
}
export interface GuidanceSession {
    id: string;
    studentId: string;
    experimentId: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'paused' | 'completed';
    interactions: {
        timestamp: string;
        source: 'student' | 'system' | 'teacher';
        type: 'question' | 'guidance' | 'feedback' | 'action';
        content: string;
        relatedStage?: string;
    }[];
    learningObjectives: {
        id: string;
        description: string;
        achieved: boolean;
        evidence?: string;
    }[];
}
export interface ExperimentErrorPattern {
    id: string;
    experimentType: string;
    pattern: string;
    frequency: number;
    suggestedCorrections: {
        description: string;
        difficulty: number;
    }[];
    preventionTips: string[];
}
export interface AdaptiveGuidanceStrategy {
    id: string;
    name: string;
    targetProgress: LearningProgressStatus[];
    triggerConditions: {
        timeBasedTriggers?: {
            minimumDuration: number;
            maximumDuration: number;
            intervalBetweenGuidance: number;
        };
        errorBasedTriggers?: {
            errorCount: number;
            errorTypes: string[];
        };
        progressBasedTriggers?: {
            stuckDuration: number;
            noProgressDuration: number;
        };
    };
    guidanceContent: {
        type: GuidanceSuggestionType;
        contentTemplate: string;
        priorityLevel: number;
        relatedConcepts?: string[];
    }[];
}
//# sourceMappingURL=guidance.model.d.ts.map