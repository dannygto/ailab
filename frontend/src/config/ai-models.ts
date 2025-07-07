// AIģ������
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
  contextWindow?: number;      // �����Ĵ��ڴ�С����tokensΪ��λ��
  inputTokenLimit?: number;    // �������tokens��
  outputTokenLimit?: number;   // ������tokens��
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'doubao-seed-1-6-thinking-250615',
    name: 'Doubao-Seed-1.6-thinking',
    provider: '��ɽ����',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    description: 'Doubao-Seed-1.6-thinking˼��רע������ģ�ͣ�֧��256K�����ģ����16K tokens',
    supportedFeatures: ['�ı��Ի�', 'ͼ������', '�����Ż�', '��ģ̬֧��', '���ı�����', '˼������'],
    pricing: '��token�Ʒ�',
    maxTokens: 16000,
    temperature: 0.7,
    available: true,
    contextWindow: 256000,
    inputTokenLimit: 224000,
    outputTokenLimit: 16000
  }
];

export const AI_PROVIDERS = [
  '��ɽ����'
];

// Ĭ������
export const DEFAULT_AI_CONFIG = {
  selectedModel: 'doubao-seed-1-6-thinking-250615',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 16000,
  systemPrompt: '����һ��רҵ��K12����AI���֣�ר�Ű���ѧ�����п�ѧʵ��ѧϰ�����ü�ࡢ�׶������Իش����⣬��ȷ�������ʺ�ѧ��������Ρ�'
};
