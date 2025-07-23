export declare enum TemplateDifficultyLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"
}
export declare enum TemplateGradeLevel {
    ELEMENTARY = "elementary",
    MIDDLE = "middle",
    HIGH = "high",
    UNIVERSITY = "university"
}
export interface TemplateStep {
    title: string;
    content: string;
    duration?: number;
    imageUrl?: string;
}
export interface TemplateMaterial {
    name: string;
    quantity: number;
    unit: string;
}
export interface AssessmentCriterion {
    name: string;
    weight: number;
}
export interface RelatedResource {
    id: string;
    type: 'video' | 'document' | 'template' | 'external';
    title: string;
    url: string;
}
export interface TemplateAuthor {
    id: string;
    name: string;
    title?: string;
}
export interface ExperimentTemplate {
    id: string;
    name: string;
    description: string;
    detailedDescription?: string;
    subject: string;
    grade: TemplateGradeLevel;
    difficulty: TemplateDifficultyLevel;
    duration: number;
    popularity: number;
    usageCount: number;
    author: TemplateAuthor;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    thumbnailUrl?: string;
    steps: TemplateStep[];
    materials?: TemplateMaterial[];
    learningObjectives?: string[];
    assessmentCriteria?: AssessmentCriterion[];
    relatedResourcesUrls?: string[];
}
export interface TemplateSearchParams {
    search?: string;
    subject?: string;
    grade?: TemplateGradeLevel;
    difficulty?: TemplateDifficultyLevel;
    tags?: string[];
    duration?: {
        min?: number;
        max?: number;
    };
}
//# sourceMappingURL=template.model.d.ts.map