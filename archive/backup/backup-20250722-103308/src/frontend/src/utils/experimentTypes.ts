/**
 * K12实验类型定义和工具函数
 * 严格符合国家课程标准和相关K12教育阶段的实验需求
 */

// K12学段定义
export enum K12Grade {
  PRIMARY = 'primary',        // 小学阶段 (1-6年级)
  JUNIOR = 'junior',          // 初中阶段 (7-9年级)
  SENIOR = 'senior'           // 高中阶段 (10-12年级)
}

// K12学科定义
export enum K12Subject {
  SCIENCE = 'science',         // 科学（小学综合科学）
  PHYSICS = 'physics',         // 物理
  CHEMISTRY = 'chemistry',     // 化学
  BIOLOGY = 'biology',         // 生物
  MATHEMATICS = 'mathematics', // 数学
  CHINESE = 'chinese',         // 语文
  ENGLISH = 'english',         // 英语
  GEOGRAPHY = 'geography',     // 地理
  LABOR = 'labor',             // 劳动教育
  TECHNOLOGY = 'technology',   // 信息技术
  GENERAL_TECH = 'general_tech' // 通用技术
}

// 实验安全等级
export enum SafetyLevel {
  LOW = 'low',                 // 低风险，观察类实验
  MEDIUM = 'medium',           // �з��գ���Ҫע�⵫��԰�ȫ
  HIGH = 'high'                // �߷��գ���Ҫ��ʦ�ල
}

// ʵ������
export enum ExperimentType {
  OBSERVATION = 'observation',   // �۲�ʵ��
  MEASUREMENT = 'measurement',   // ����ʵ��
  COMPARISON = 'comparison',     // �Ա�ʵ��
  EXPLORATION = 'exploration',   // ̽��ʵ��
  DESIGN = 'design',             // �������
  ANALYSIS = 'analysis',         // ����ʵ��
  SYNTHESIS = 'synthesis'        // �ۺ�ʵ��
}

// K12ʵ��ӿڶ���
export interface K12Experiment {
  id: string;
  title: string;
  description: string;
  grade: K12Grade;
  subject: K12Subject;
  type: ExperimentType;
  safetyLevel: SafetyLevel;
  duration: number;              // ʵ��ʱ�������ӣ�
  materials: string[];           // ʵ�����
  objectives: string[];          // ʵ��Ŀ��
  procedures: string[];          // ʵ�鲽��
  safetyNotes: string[];         // ��ȫע������
  curriculumStandard: string;    // ��Ӧ�γ̱�׼
  tags: string[];                // ��ǩ
  difficulty: 1 | 2 | 3 | 4 | 5; // �Ѷȵȼ�
  isGroupWork: boolean;          // �Ƿ�С��ʵ��
  requiresSupervision: boolean;  // �Ƿ���Ҫ��ʦ�ල
}

// 学科实验类型映射
export const SUBJECT_EXPERIMENT_TYPES = {
  [K12Subject.SCIENCE]: [
    'observation',
    'measurement',
    'comparison',
    'exploration'
  ],
  [K12Subject.PHYSICS]: [
    'measurement',
    'exploration',
    'analysis',
    'design',
    'physics'
  ],
  [K12Subject.CHEMISTRY]: [
    ExperimentType.OBSERVATION,
    ExperimentType.ANALYSIS,
    ExperimentType.SYNTHESIS,
    ExperimentType.COMPARISON
  ],
  [K12Subject.BIOLOGY]: [
    ExperimentType.OBSERVATION,
    ExperimentType.MEASUREMENT,
    ExperimentType.COMPARISON,
    ExperimentType.ANALYSIS
  ],
  [K12Subject.MATHEMATICS]: [
    ExperimentType.MEASUREMENT,
    ExperimentType.ANALYSIS,
    ExperimentType.EXPLORATION,
    ExperimentType.DESIGN
  ],
  [K12Subject.CHINESE]: [
    ExperimentType.OBSERVATION,
    ExperimentType.EXPLORATION,
    ExperimentType.ANALYSIS
  ],
  [K12Subject.ENGLISH]: [
    ExperimentType.OBSERVATION,
    ExperimentType.COMPARISON,
    ExperimentType.EXPLORATION
  ],
  [K12Subject.GEOGRAPHY]: [
    ExperimentType.OBSERVATION,
    ExperimentType.MEASUREMENT,
    ExperimentType.ANALYSIS,
    ExperimentType.EXPLORATION
  ],
  [K12Subject.LABOR]: [
    ExperimentType.DESIGN,
    ExperimentType.EXPLORATION,
    ExperimentType.SYNTHESIS
  ],
  [K12Subject.TECHNOLOGY]: [
    ExperimentType.DESIGN,
    ExperimentType.EXPLORATION,
    ExperimentType.ANALYSIS
  ],
  [K12Subject.GENERAL_TECH]: [
    ExperimentType.DESIGN,
    ExperimentType.SYNTHESIS,
    ExperimentType.EXPLORATION,
    ExperimentType.ANALYSIS
  ]
};

// 学段适用学科
export const GRADE_SUBJECTS = {
  [K12Grade.PRIMARY]: [
    K12Subject.SCIENCE,
    K12Subject.MATHEMATICS,
    K12Subject.CHINESE,
    K12Subject.ENGLISH,
    K12Subject.LABOR,
    K12Subject.TECHNOLOGY
  ],
  [K12Grade.JUNIOR]: [
    K12Subject.PHYSICS,
    K12Subject.CHEMISTRY,
    K12Subject.BIOLOGY,
    K12Subject.MATHEMATICS,
    K12Subject.CHINESE,
    K12Subject.ENGLISH,
    K12Subject.GEOGRAPHY,
    K12Subject.LABOR,
    K12Subject.TECHNOLOGY
  ],
  [K12Grade.SENIOR]: [
    K12Subject.PHYSICS,
    K12Subject.CHEMISTRY,
    K12Subject.BIOLOGY,
    K12Subject.MATHEMATICS,
    K12Subject.CHINESE,
    K12Subject.ENGLISH,
    K12Subject.GEOGRAPHY,
    K12Subject.GENERAL_TECH,
    K12Subject.TECHNOLOGY
  ]
};

// ������ʾ����
export const GRADE_LABELS = {
  [K12Grade.PRIMARY]: '小学',
  [K12Grade.JUNIOR]: '初中',
  [K12Grade.SENIOR]: '高中'
};

export const SUBJECT_LABELS = {
  [K12Subject.SCIENCE]: '科学',
  [K12Subject.PHYSICS]: '物理',
  [K12Subject.CHEMISTRY]: '化学',
  [K12Subject.BIOLOGY]: '生物',
  [K12Subject.MATHEMATICS]: '数学',
  [K12Subject.CHINESE]: '语文',
  [K12Subject.ENGLISH]: '英语',
  [K12Subject.GEOGRAPHY]: '地理',
  [K12Subject.LABOR]: '劳动教育',
  [K12Subject.TECHNOLOGY]: '信息技术',
  [K12Subject.GENERAL_TECH]: '通用技术'
};

export const TYPE_LABELS = {
  'observation': '观察实验',
  'measurement': '测量实验',
  'comparison': '对比实验',
  'exploration': '探究实验',
  'design': '设计实验',
  'analysis': '分析实验',
  'synthesis': '综合实验',
  'physics': '物理实验',
  'custom': '自定义实验'
};

export const SAFETY_LABELS = {
  [SafetyLevel.LOW]: '低风险',
  [SafetyLevel.MEDIUM]: '中风险',
  [SafetyLevel.HIGH]: '高风险'
};

// 工具函数

/**
 * 获取学段对应的学科列表
 */
export function getSubjectsByGrade(grade: K12Grade): K12Subject[] {
  return GRADE_SUBJECTS[grade] || [];
}

/**
 * 获取学科对应的实验类型列表
 */
export function getExperimentTypesBySubject(subject: K12Subject): ExperimentType[] {
  // 使用类型断言确保返回类型是 ExperimentType[]
  return (SUBJECT_EXPERIMENT_TYPES[subject] || []) as ExperimentType[];
}

/**
 * 检查实验是否适合指定学段
 */
export function isExperimentSuitableForGrade(experiment: K12Experiment, grade: K12Grade): boolean {
  const gradeSubjects = getSubjectsByGrade(grade);
  return gradeSubjects.includes(experiment.subject) && experiment.grade === grade;
}

/**
 * ���ݰ�ȫ�ȼ���ȡ��ȫ��ʾ
 */
export function getSafetyTips(safetyLevel: SafetyLevel): string[] {
  switch (safetyLevel) {
    case SafetyLevel.LOW:
      return [
        'ע�Ᵽ��ʵ����������',
        '����۲�ʵ������',
        '���ղ����������'
      ];
    case SafetyLevel.MEDIUM:
      return [
        '���ڽ�ʦָ���½���ʵ��',
        '��ȷʹ��ʵ������',
        'ע����˷���',
        '�����쳣����ֹͣ'
      ];
    case SafetyLevel.HIGH:
      return [
        '�����ڽ�ʦ�ල�½���',
        '�ϸ���ѭ��ȫ�������',
        '�����Ҫ�ķ�����Ʒ',
        'ȷ��ͨ������',
        '׼��Ӧ��������ʩ'
      ];
    default:
      return ['�밴��ʵ��Ҫ��ȫ����'];
  }
}

/**
 * �����꼶��ȡ�Ƽ�ʵ��ʱ��
 */
export function getRecommendedDuration(grade: K12Grade): { min: number; max: number } {
  switch (grade) {
    case K12Grade.PRIMARY:
      return { min: 20, max: 40 };
    case K12Grade.JUNIOR:
      return { min: 30, max: 50 };
    case K12Grade.SENIOR:
      return { min: 40, max: 60 };
    default:
      return { min: 30, max: 45 };
  }
}

/**
 * ��ȡѧ�ƶ�Ӧ�Ŀγ̱�׼����
 */
export function getCurriculumStandardCode(subject: K12Subject, grade: K12Grade): string {
  const gradeCode = {
    [K12Grade.PRIMARY]: 'XS',
    [K12Grade.JUNIOR]: 'CZ',
    [K12Grade.SENIOR]: 'GZ'
  }[grade];

  const subjectCode = {
    [K12Subject.SCIENCE]: 'KX',
    [K12Subject.PHYSICS]: 'WL',
    [K12Subject.CHEMISTRY]: 'HX',
    [K12Subject.BIOLOGY]: 'SW',
    [K12Subject.MATHEMATICS]: 'SX',
    [K12Subject.CHINESE]: 'YW',
    [K12Subject.ENGLISH]: 'YY',
    [K12Subject.GEOGRAPHY]: 'DL',
    [K12Subject.LABOR]: 'LD',
    [K12Subject.TECHNOLOGY]: 'XX',
    [K12Subject.GENERAL_TECH]: 'TY'
  }[subject];

  return `${gradeCode}-${subjectCode}`;
}

/**
 * ���˷���������ʵ��
 */
export function filterExperiments(
  experiments: K12Experiment[],
  filters: {
    grade?: K12Grade;
    subject?: K12Subject;
    type?: ExperimentType;
    safetyLevel?: SafetyLevel;
    maxDuration?: number;
    difficulty?: number;
  }
): K12Experiment[] {
  return experiments.filter(exp => {
    if (filters.grade && exp.grade !== filters.grade) return false;
    if (filters.subject && exp.subject !== filters.subject) return false;
    if (filters.type && exp.type !== filters.type) return false;
    if (filters.safetyLevel && exp.safetyLevel !== filters.safetyLevel) return false;
    if (filters.maxDuration && exp.duration > filters.maxDuration) return false;
    if (filters.difficulty && exp.difficulty > filters.difficulty) return false;
    return true;
  });
}

/**
 * ��ȡʵ���Ƽ��༶����
 */
export function getRecommendedClassSize(experiment: K12Experiment): { min: number; max: number } {
  if (experiment.isGroupWork) {
    return { min: 20, max: 40 };
  } else {
    return { min: 10, max: 30 };
  }
}

/**
 * ��֤ʵ�������Ƿ����
 */
export function validateExperiment(experiment: Partial<K12Experiment>): string[] {
  const errors: string[] = [];

  if (!experiment.title?.trim()) {
    errors.push('ʵ����ⲻ��Ϊ��');
  }

  if (!experiment.grade) {
    errors.push('����ָ��ѧ��');
  }

  if (!experiment.subject) {
    errors.push('����ָ��ѧ��');
  }

  if (experiment.grade && experiment.subject) {
    const validSubjects = getSubjectsByGrade(experiment.grade);
    if (!validSubjects.includes(experiment.subject)) {
      errors.push(`${GRADE_LABELS[experiment.grade]}�׶β�����${SUBJECT_LABELS[experiment.subject]}ѧ��`);
    }
  }

  if (experiment.subject && experiment.type) {
    const validTypes = getExperimentTypesBySubject(experiment.subject);
    if (!validTypes.includes(experiment.type)) {
      errors.push(`${SUBJECT_LABELS[experiment.subject]}ѧ�Ʋ�֧��${TYPE_LABELS[experiment.type]}����`);
    }
  }

  if (experiment.duration && experiment.grade) {
    const recommended = getRecommendedDuration(experiment.grade);
    if (experiment.duration < recommended.min || experiment.duration > recommended.max) {
      errors.push(`${GRADE_LABELS[experiment.grade]}����ʵ��ʱ��Ϊ${recommended.min}-${recommended.max}����`);
    }
  }

  if (experiment.difficulty && (experiment.difficulty < 1 || experiment.difficulty > 5)) {
    errors.push('�Ѷȵȼ�������1-5֮��');
  }

  if (!experiment.materials?.length) {
    errors.push('����ָ��ʵ�����');
  }

  if (!experiment.objectives?.length) {
    errors.push('����ָ��ʵ��Ŀ��');
  }

  if (!experiment.procedures?.length) {
    errors.push('����ָ��ʵ�鲽��');
  }
  return errors;
}

// === ǰ�˼����Ժ��� ===

/**
 * ��ȡ�����汾֧�ֵ�ʵ�����ͣ����ݺ�����
 */
export function getBasicExperimentTypes() {
  return Object.values(ExperimentType).map(type => ({
    value: type,
    label: TYPE_LABELS[type],
    description: `������K12������${TYPE_LABELS[type]}`
  }));
}

/**
 * ʵ������ѡ����ݺ�����
 */
export const experimentTypes = getBasicExperimentTypes();

/**
 * ʵ������ѡ����ݺ�����
 */
export const experimentTypeOptions = experimentTypes;

/**
 * ��ȡѧ��ʵ������ѡ��
 */
export function getSubjectExperimentTypes(subject: K12Subject) {
  const types = getExperimentTypesBySubject(subject);
  return types.map(type => ({
    value: type,
    label: TYPE_LABELS[type],
    description: `${SUBJECT_LABELS[subject]}ѧ��${TYPE_LABELS[type]}`
  }));
}

/**
 * ��ȡѧ��ʵ������ѡ��
 */
export function getGradeExperimentTypes(grade: K12Grade) {
  const subjects = getSubjectsByGrade(grade);
  const allTypes = new Set<ExperimentType>();
  
  subjects.forEach(subject => {
    getExperimentTypesBySubject(subject).forEach(type => {
      allTypes.add(type);
    });
  });
  
  return Array.from(allTypes).map(type => ({
    value: type,
    label: TYPE_LABELS[type],
    description: `${GRADE_LABELS[grade]}�׶�${TYPE_LABELS[type]}`
  }));
}

/**
 * ��ȡ������ʵ��������Ϣ
 */
export function getExperimentTypeInfo(type: ExperimentType) {
  return {
    value: type,
    label: TYPE_LABELS[type],
    description: `K12����${TYPE_LABELS[type]}`,
    isK12Compatible: true
  };
}


export default SUBJECT_EXPERIMENT_TYPES;
