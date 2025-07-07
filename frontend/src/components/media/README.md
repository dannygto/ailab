# 媒体智能识别与分析模块

## 概述

本模块为AICAM平台提供了四种先进的媒体处理能力：

1. **语音转文本 (Speech-to-Text)** - 将音频文件或录音转换为文本
2. **图像文字识别 (OCR)** - 从图像中提取文字信息
3. **科学图表解析** - 分析和解释科学图表数据
4. **数学公式识别** - 识别并转换数学公式为多种格式

## 功能特性

### 语音转文本 (SpeechToTextComponent)
- 支持实时录音和文件上传
- 多语言支持（中文、英文、日文、韩文）
- 时间戳标记
- 置信度评分
- 音频预览功能

### 图像文字识别 (OCRComponent)
- 多语言文字识别
- 快速/精确模式选择
- 文本块边界框可视化
- 方向检测
- 文本复制功能

### 科学图表解析 (ChartAnalysisComponent)
- 自动图表类型检测
- 数据提取和表格化
- 坐标轴标签识别
- 图表内容解释
- 支持柱状图、折线图、散点图、饼图

### 数学公式识别 (FormulaRecognitionComponent)
- LaTeX、MathML、纯文本格式输出
- 公式解释功能
- 多格式转换
- 一键复制功能
- 公式预览

## 组件结构

```
src/components/media/
├── SpeechToTextComponent.tsx      # 语音转文本组件
├── OCRComponent.tsx               # OCR识别组件
├── ChartAnalysisComponent.tsx     # 图表分析组件
├── FormulaRecognitionComponent.tsx # 公式识别组件
└── __tests__/
    └── MediaComponents.test.tsx   # 组件测试文件

src/pages/media/
└── MediaAnalysisPage.tsx          # 媒体分析页面（整合所有组件）

src/types/
└── mediaTypes.ts                  # 媒体处理相关类型定义
```

## API 接口

### 语音转文本 API
```typescript
interface SpeechToTextParams {
  language?: string;
  model?: string;
  enableTimestamps?: boolean;
}

interface SpeechToTextResponse {
  text: string;
  confidence: number;
  segments?: SpeechSegment[];
  metadata: {
    duration: number;
    wordCount: number;
    language: string;
  };
}
```

### OCR API
```typescript
interface OCRParams {
  language?: string;
  detectOrientation?: boolean;
  recognitionMode?: 'fast' | 'accurate';
}

interface OCRResponse {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  metadata: {
    language: string;
    orientation: 0 | 90 | 180 | 270;
    dimensions: { width: number; height: number; };
  };
}
```

### 图表分析 API
```typescript
interface ScientificChartParams {
  chartType?: 'auto' | 'line' | 'bar' | 'scatter' | 'pie';
  extractData?: boolean;
  includeAxisLabels?: boolean;
}

interface ScientificChartResponse {
  chartType: string;
  title?: string;
  axisLabels?: { x?: string; y?: string; };
  extractedData?: ChartData;
  interpretation: string;
  confidence: number;
}
```

### 公式识别 API
```typescript
interface FormulaRecognitionParams {
  format?: 'latex' | 'mathml' | 'text';
  includeExplanation?: boolean;
}

interface FormulaRecognitionResponse {
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
```

## 使用方法

### 在页面中使用单个组件

```typescript
import SpeechToTextComponent from '../components/media/SpeechToTextComponent';

function MyPage() {
  const handleTranscriptionComplete = (result: SpeechToTextResponse) => {
    console.log('转写结果:', result.text);
  };

  return (
    <SpeechToTextComponent 
      onTranscriptionComplete={handleTranscriptionComplete} 
    />
  );
}
```

### 访问完整的媒体分析页面

导航到 `/media-analysis` 路径即可访问包含所有媒体处理功能的页面。

## 技术实现

### 前端技术栈
- React 18 + TypeScript
- Material-UI (MUI) 组件库
- HTML5 Media APIs (录音功能)
- Canvas API (边界框绘制)
- File API (文件处理)

### 后端集成
- 通过 `aiService` 与后端AI服务通信
- 支持 FormData 文件上传
- RESTful API 接口
- 错误处理和重试机制

### 模拟数据
当前实现包含完整的模拟数据，用于开发和演示：
- 模拟语音识别结果
- 模拟OCR识别结果
- 模拟图表分析结果
- 模拟公式识别结果

## 扩展功能

### 可能的增强功能
1. **批量处理** - 支持多文件同时处理
2. **实时预览** - 处理过程中的实时结果展示
3. **结果导出** - 支持导出为PDF、Word等格式
4. **历史记录** - 保存处理历史和结果
5. **协作功能** - 支持结果分享和协作编辑

### 性能优化
1. **缓存机制** - 缓存处理结果
2. **懒加载** - 按需加载大型组件
3. **文件压缩** - 上传前压缩大文件
4. **进度显示** - 长时间处理的进度指示

## 测试

### 单元测试
- 组件渲染测试
- 用户交互测试
- API调用测试
- 错误处理测试

### 集成测试
- 端到端流程测试
- 文件上传测试
- 多组件交互测试

## 部署注意事项

1. **依赖安装** - 确保所有必要的npm包已安装
2. **环境变量** - 配置正确的API端点
3. **文件大小限制** - 设置合理的文件上传限制
4. **浏览器兼容性** - 确保Media APIs的浏览器支持
5. **权限配置** - 麦克风访问权限设置

## 维护和更新

- 定期更新AI模型版本
- 监控API响应时间和准确率
- 收集用户反馈和使用数据
- 持续优化UI/UX体验
