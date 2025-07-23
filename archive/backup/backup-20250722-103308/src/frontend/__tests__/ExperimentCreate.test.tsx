import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExperimentCreate from '../src/pages/experiments/ExperimentCreate';
import ExperimentTypeSelect from '../src/pages/experiments/components/ExperimentTypeSelect';
import ExperimentMethodSelect from '../src/pages/experiments/components/ExperimentMethodSelect';
import ExperimentResourceSelect from '../src/pages/experiments/components/ExperimentResourceSelect';
import AIAssistanceSelect from '../src/pages/experiments/components/AIAssistanceSelect';
import BasicInfoForm from '../src/pages/experiments/components/BasicInfoForm';

// 模拟API服务
jest.mock('../src/services/api', () => ({
  createExperiment: jest.fn().mockResolvedValue({ id: 'test-experiment-id' }),
}));

// 模拟react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// 组件渲染测试 - 实验类型选择
describe('ExperimentTypeSelect', () => {
  test('renders experiment type options', () => {
    render(
      <ExperimentTypeSelect 
        value="" 
        onChange={() => {}} 
      />
    );
    
    // 检查是否渲染了实验类型标题
    expect(screen.getByText(/选择实验类型/i)).toBeInTheDocument();
  });
});

// 组件渲染测试 - 基本信息表单
describe('BasicInfoForm', () => {
  test('renders form fields correctly', () => {
    render(
      <BasicInfoForm
        name="测试实验"
        description="这是一个测试描述"
        duration={60}
        onNameChange={() => {}}
        onDescriptionChange={() => {}}
        onDurationChange={() => {}}
      />
    );
    
    // 检查表单字段是否存在
    expect(screen.getByLabelText(/实验名称/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/实验描述/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/实验时长/i)).toBeInTheDocument();
    
    // 检查字段的值
    expect(screen.getByLabelText(/实验名称/i)).toHaveValue('测试实验');
    expect(screen.getByLabelText(/实验描述/i)).toHaveValue('这是一个测试描述');
    expect(screen.getByLabelText(/实验时长/i)).toHaveValue('60');
  });
});

// 主组件集成测试
describe('ExperimentCreate', () => {
  test('renders stepper with correct steps', () => {
    render(
      <MemoryRouter>
        <ExperimentCreate />
      </MemoryRouter>
    );
    
    // 检查是否渲染了步骤
    expect(screen.getByText(/选择实验类型/i)).toBeInTheDocument();
    expect(screen.getByText(/创建新实验/i)).toBeInTheDocument();
    
    // 检查导航按钮
    expect(screen.getByText(/下一步/i)).toBeInTheDocument();
  });
});
