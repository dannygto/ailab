import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';

// 基础组件测试
describe('BasicComponents', () => {
  test('渲染测试用例', () => {
    const TestComponent = () => <div>Basic Component Test</div>;
    renderWithTheme(<TestComponent />);
    expect(screen.getByText('Basic Component Test')).toBeInTheDocument();
  });

  test('空组件渲染测试', () => {
    const EmptyComponent = () => <div data-testid="empty">Empty Component</div>;
    renderWithTheme(<EmptyComponent />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
});