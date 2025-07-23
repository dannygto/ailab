// 媒体处理相关类型定义

// 语音识别接口
export interface SpeechToTextParams {
  language?: string;
  model?: string;
  enableTimestamps?: boolean;
}

export interface SpeechSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
  segments?: SpeechSegment[];
  metadata: {
    duration: number;
    wordCount: number;
    language: string;
  };
}

// OCR接口
export interface OCRParams {
  language?: string;
  detectOrientation?: boolean;
  recognitionMode?: 'fast' | 'accurate';
}

export interface TextBlock {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  type: 'line' | 'paragraph' | 'word';
}

export interface OCRResponse {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  metadata: {
    language: string;
    orientation: 0 | 90 | 180 | 270;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

// 科学图表分析接口
export interface ScientificChartParams {
  chartType?: 'auto' | 'line' | 'bar' | 'scatter' | 'pie';
  extractData?: boolean;
  includeAxisLabels?: boolean;
}

export interface ChartSeries {
  name?: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  series: ChartSeries[];
}

export interface ScientificChartResponse {
  chartType: string;
  title?: string;
  axisLabels?: {
    x?: string;
    y?: string;
  };
  extractedData?: ChartData;
  interpretation: string;
  confidence: number;
  charts: Array<{
    type: string;
    data: any;
    title?: string;
  }>;
  metadata: {
    processingTime: number;
    chartCount?: number;
    extractionMethod?: string;
  };
}

// 公式识别接口
export interface FormulaRecognitionParams {
  format?: 'latex' | 'mathml' | 'text';
  includeExplanation?: boolean;
}

export interface FormulaRecognitionResponse {
  formula: string;
  formulas: Array<{
    formula: string;
    type: string;
    confidence: number;
  }>;
  originalFormat: string;
  convertedFormats?: {
    latex?: string;
    mathml?: string;
    text?: string;
  };
  explanation?: string;
  confidence: number;
}
