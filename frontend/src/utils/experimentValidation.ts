import { ExperimentType } from '../types';

export function validateExperiment(experiment: any): boolean {
  return !!(experiment && experiment.name && experiment.type);
}

export function validateExperimentParameters(type: ExperimentType, parameters: any): string[] {
  const errors: string[] = [];
  
  if (!parameters) {
    errors.push('实验参数不能为空');
    return errors;
  }
  
  switch (type) {
    case 'observation':
      if (!parameters.observationTarget) {
        errors.push('观察实验需要指定观察对象');
      }
      break;
      
    case 'measurement':
      if (!parameters.measurementUnit) {
        errors.push('测量实验需要指定测量单位');
      }
      break;
  }
  
  return errors;
}

export function getExperimentComplexity(type: ExperimentType): 'simple' | 'medium' | 'complex' {
  const complexityMap: Record<ExperimentType, 'simple' | 'medium' | 'complex'> = {
    observation: 'simple',
    measurement: 'simple',
    comparison: 'medium',
    exploration: 'medium',
    design: 'complex',
    analysis: 'medium',
    synthesis: 'complex',
    custom: 'medium'
  };
  
  return complexityMap[type] || 'medium';
}
