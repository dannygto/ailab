// 媒体组件导出文件
export { default as SpeechToTextComponent } from './SpeechToTextComponent';
export { default as OCRComponent } from './OCRComponent';
export { default as ChartAnalysisComponent } from './ChartAnalysisComponent';
export { default as FormulaRecognitionComponent } from './FormulaRecognitionComponent';
export { default as BatchProcessingComponent } from './BatchProcessingComponent';
export { default as ExperimentMediaIntegration } from './ExperimentMediaIntegration';
export { default as RealTimeCollaboration } from './RealTimeCollaboration';
export { default as AIServiceMonitor } from './AIServiceMonitor';

// 类型导出
export type {
  SpeechToTextParams,
  SpeechToTextResponse,
  SpeechSegment,
  OCRParams,
  OCRResponse,
  TextBlock,
  ScientificChartParams,
  ScientificChartResponse,
  ChartData,
  ChartSeries,
  FormulaRecognitionParams,
  FormulaRecognitionResponse
} from '../../types/mediaTypes';
