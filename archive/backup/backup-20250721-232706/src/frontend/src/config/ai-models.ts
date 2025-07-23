// AI模型配置
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  description: string;
  supportedFeatures: string[];
  pricing?: string;
  maxTokens?: number;
  temperature?: number;
  available: boolean;
  contextWindow?: number;      // 模型的上下文窗口大小（以tokens为单位）
  inputTokenLimit?: number;    // 输入token限制
  outputTokenLimit?: number;   // 输出token限制
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'doubao-seed-1-6-thinking-250615',
    name: 'Doubao-Seed-1.6-thinking',
    provider: '字节跳动',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    description: 'Doubao-Seed-1.6-thinking思维专注对话模型，支持256K上下文，输出16K tokens',
    supportedFeatures: ['文本对话', '图像分析', '代码优化', '多模态支持', '长文本处理', '思维链推理'],
    pricing: '按token计费',
    maxTokens: 16000,
    temperature: 0.7,
    available: true,
    contextWindow: 256000,
    inputTokenLimit: 224000,
    outputTokenLimit: 16000
  },
  {
    id: 'volcengine-turbo',
    name: '火山方舟通用大模型',
    provider: '火山方舟',
    endpoint: 'https://volcengine.com/api/v1/chat/completions',
    description: '火山方舟通用对话大模型，支持32K上下文，优化教育和科研场景',
    supportedFeatures: ['文本对话', '知识推理', '内容生成', '教育辅助', '中文优化'],
    pricing: '按token计费',
    maxTokens: 8000,
    temperature: 0.7,
    available: true,
    contextWindow: 32000,
    inputTokenLimit: 28000,
    outputTokenLimit: 8000
  },
  {
    id: 'volcanic-ark-edu',
    name: '火山方舟教育增强版',
    provider: '火山方舟',
    endpoint: 'https://volcengine.com/api/v1/chat/completions',
    description: '火山方舟教育场景优化模型，适用于K12教育领域，提供更精准的科学实验指导和教学支持',
    supportedFeatures: ['实验指导', '知识问答', '教育内容生成', '实验分析', '中文优化'],
    pricing: '按token计费',
    maxTokens: 12000,
    temperature: 0.6,
    available: true,
    contextWindow: 64000,
    inputTokenLimit: 56000,
    outputTokenLimit: 12000
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    description: 'DeepSeek专业代码辅助模型，支持100K上下文，代码生成与优化能力强',
    supportedFeatures: ['代码生成', '代码解释', '代码优化', '调试帮助', '多语言支持'],
    pricing: '按token计费',
    maxTokens: 12000,
    temperature: 0.6,
    available: true,
    contextWindow: 100000,
    inputTokenLimit: 90000,
    outputTokenLimit: 12000
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    description: 'DeepSeek通用对话模型，中英文表现优异，适合教育场景的知识问答',
    supportedFeatures: ['文本对话', '知识问答', '内容生成', '多语言支持', '教育辅助'],
    pricing: '按token计费',
    maxTokens: 8000,
    temperature: 0.7,
    available: true,
    contextWindow: 32000,
    inputTokenLimit: 28000,
    outputTokenLimit: 8000
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    description: 'DeepSeek推理增强模型，专注于提供强大的思维链推理能力，适合复杂实验分析与推理',
    supportedFeatures: ['思维链推理', '问题解析', '实验分析', '复杂推理', '强逻辑能力'],
    pricing: '按token计费',
    maxTokens: 16000,
    temperature: 0.6,
    available: true,
    contextWindow: 128000,
    inputTokenLimit: 112000,
    outputTokenLimit: 16000
  }
];

export const AI_PROVIDERS = [
  '字节跳动',
  '火山方舟',
  'DeepSeek'
];

// 默认配置
export const DEFAULT_AI_CONFIG = {
  selectedModel: 'volcengine-turbo',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 8000,
  systemPrompt: '你是一个专业的K12教育AI助手，专门帮助学生进行科学实验学习，回答分类、方法、对话回答问题，确保解答适合学生认知能力。'
};


export default AI_MODELS;
