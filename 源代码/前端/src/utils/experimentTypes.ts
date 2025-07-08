/**
 * K12ʵ�����Ͷ���͹��ߺ���
 * �ϸ���Ϲ��ҿγ̱�׼��������K12�����׶ε�ʵ������
 */

// K12ѧ�ζ���
export enum K12Grade {
  PRIMARY = 'primary',        // Сѧ�׶� (1-6�꼶)
  JUNIOR = 'junior',          // ���н׶� (7-9�꼶)
  SENIOR = 'senior'           // ���н׶� (10-12�꼶)
}

// K12ѧ�ƶ���
export enum K12Subject {
  ScienceIcon = 'ScienceIcon',         // ��ѧ��Сѧ�ۺϿ�ѧ��
  PHYSICS = 'physics',         // ����
  CHEMISTRY = 'chemistry',     // ��ѧ
  BIOLOGY = 'biology',         // ����
  MATHEMATICS = 'mathematics', // ��ѧ
  CHINESE = 'chinese',         // ����
  ENGLISH = 'english',         // Ӣ��
  GEOGRAPHY = 'geography',     // ����
  LABOR = 'labor',             // �Ͷ�����
  TECHNOLOGY = 'technology',   // ��Ϣ�Ƽ�
  GENERAL_TECH = 'general_tech' // ͨ�ü���
}

// ʵ�鰲ȫ�ȼ�
export enum SafetyLevel {
  LOW = 'low',                 // �ͷ��գ��۲���ʵ��
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

// ѧ��ʵ������ӳ��
export const SUBJECT_EXPERIMENT_TYPES = {
  [K12Subject.ScienceIcon]: [
    ExperimentType.OBSERVATION,
    ExperimentType.MEASUREMENT,
    ExperimentType.COMPARISON,
    ExperimentType.EXPLORATION
  ],
  [K12Subject.PHYSICS]: [
    ExperimentType.MEASUREMENT,
    ExperimentType.EXPLORATION,
    ExperimentType.ANALYSIS,
    ExperimentType.DESIGN
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

// ѧ������ѧ��
export const GRADE_SUBJECTS = {
  [K12Grade.PRIMARY]: [
    K12Subject.ScienceIcon,
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
  [K12Grade.PRIMARY]: 'Сѧ',
  [K12Grade.JUNIOR]: '����',
  [K12Grade.SENIOR]: '����'
};

export const SUBJECT_LABELS = {
  [K12Subject.ScienceIcon]: '��ѧ',
  [K12Subject.PHYSICS]: '����',
  [K12Subject.CHEMISTRY]: '��ѧ',
  [K12Subject.BIOLOGY]: '����',
  [K12Subject.MATHEMATICS]: '��ѧ',
  [K12Subject.CHINESE]: '����',
  [K12Subject.ENGLISH]: 'Ӣ��',
  [K12Subject.GEOGRAPHY]: '����',
  [K12Subject.LABOR]: '�Ͷ�����',
  [K12Subject.TECHNOLOGY]: '��Ϣ�Ƽ�',
  [K12Subject.GENERAL_TECH]: 'ͨ�ü���'
};

export const TYPE_LABELS = {
  [ExperimentType.OBSERVATION]: '�۲�ʵ��',
  [ExperimentType.MEASUREMENT]: '����ʵ��',
  [ExperimentType.COMPARISON]: '�Ա�ʵ��',
  [ExperimentType.EXPLORATION]: '̽��ʵ��',
  [ExperimentType.DESIGN]: '�������',
  [ExperimentType.ANALYSIS]: '����ʵ��',
  [ExperimentType.SYNTHESIS]: '�ۺ�ʵ��'
};

export const SAFETY_LABELS = {
  [SafetyLevel.LOW]: '�ͷ���',
  [SafetyLevel.MEDIUM]: '�з���',
  [SafetyLevel.HIGH]: '�߷���'
};

// ���ߺ���

/**
 * ��ȡѧ�ζ�Ӧ��ѧ���б�
 */
export function getSubjectsByGrade(grade: K12Grade): K12Subject[] {
  return GRADE_SUBJECTS[grade] || [];
}

/**
 * ��ȡѧ�ƶ�Ӧ��ʵ�������б�
 */
export function getExperimentTypesBySubject(subject: K12Subject): ExperimentType[] {
  return SUBJECT_EXPERIMENT_TYPES[subject] || [];
}

/**
 * ���ʵ���Ƿ��ʺ�ָ��ѧ��
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
    [K12Subject.ScienceIcon]: 'KX',
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
