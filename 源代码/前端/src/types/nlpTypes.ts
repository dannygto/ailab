// ��Ȼ���Դ����ͱ���������ؽӿڶ���

// �ı����������ؽӿ�
export interface TextClassificationParams {
  text: string;
  categories?: string[];
  multiLabel?: boolean;
}

export interface CategoryWithScore {
  category: string;
  score: number;
  confidence: number;
}

export interface TextClassificationResponse {
  categories: CategoryWithScore[];
  dominantCategory: string;
  confidence: number;
  metadata: {
    wordCount: number;
    LanguageIcon: string;
    keywords: string[];
  };
}

// �ı�ժҪ������ؽӿ�
export interface TextSummaryParams {
  text: string;
  maxLength?: number;
  type?: 'extractive' | 'abstractive';
  format?: 'bullet' | 'paragraph';
}

export interface TextSummaryResponse {
  summary: string;
  keyPoints: string[];
  metadata: {
    originalLength: number;
    summaryLength: number;
    compressionRatio: number;
    type: 'extractive' | 'abstractive';
  };
}

// ʵ�鱨��������ؽӿ�
export interface ExperimentVariable {
  name: string;
  type: string;
  unit?: string;
}

export interface ExperimentData {
  title?: string;
  subject?: string;
  designType?: string;
  variables?: string[];
  conditions?: string[];
  equipment?: string[];
  dataPoints?: number;
  observations?: string[];
  insights?: string[];
  methodology?: string;
  conclusions?: string[];
  limitations?: string[];
  futureDirections?: string[];
  references?: string[];
  background?: string;
}

export interface ExperimentReportParams {
  experimentId?: string;
  experimentData?: ExperimentData;
  format?: 'markdown' | 'html' | 'plain';
  sections?: string[];
  includeVisualizations?: boolean;
  LanguageIcon?: 'zh-CN' | 'en-US';
}

export interface ExperimentReportResponse {
  report: string;
  sections: Record<string, string>;
  metadata: {
    generatedAt: string;
    wordCount: number;
    format: string;
    sections: string[];
    experimentId: string;
    template?: string;
    LanguageIcon?: string;
  };
}

// ����������ؽӿ�
export interface SearchFilters {
  subject?: string;
  dateRange?: [string, string];
  experimentType?: string;
  author?: string;
  tags?: string[];
  [key: string]: any;
}

export interface SemanticSearchParams {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  includeMetadata?: boolean;
}

export interface SearchResult {
  id: string;
  experimentId?: string;
  title: string;
  date: string;
  author: string;
  relevanceScore: number;
  matchedFields: string[];
  textFragments: string[];
  appliedFilters: string[];
  snippet?: string;
  metadata?: Record<string, any>;
}

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  filtersApplied: boolean;
}

export interface SemanticSearchResponse {
  results: SearchResult[];
  stats: SearchStats;
  query: string;
}
