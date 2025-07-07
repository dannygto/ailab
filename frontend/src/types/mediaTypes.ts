// ý�崦��������Ͷ���

// ����ʶ����ؽӿ�
export interface SpeechToTextParams {
  LanguageIcon?: string;
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
    LanguageIcon: string;
  };
}

// OCR��ؽӿ�
export interface OCRParams {
  LanguageIcon?: string;
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
    LanguageIcon: string;
    orientation: 0 | 90 | 180 | 270;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

// ��ѧͼ��������ؽӿ�
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
}

// ��ʽʶ����ؽӿ�
export interface FormulaRecognitionParams {
  format?: 'latex' | 'mathml' | 'text';
  includeExplanation?: boolean;
}

export interface FormulaRecognitionResponse {
  formula: string;
  originalFormat: string;
  convertedFormats?: {
    latex?: string;
    mathml?: string;
    text?: string;
  };
  explanation?: string;
  confidence: number;
}
