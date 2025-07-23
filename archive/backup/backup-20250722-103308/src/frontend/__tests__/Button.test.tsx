// Button组件基础测试
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/ui/Button';

describe('Button组件测试', () => {
  test('渲染基础按钮', () => {
    render(<Button>点击我</Button>);
    
    const button = screen.getByRole('button', { name: '点击我' });
    expect(button).toBeInTheDocument();
  });

  test('处理点击事件', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    const button = screen.getByRole('button', { name: '点击我' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('禁用状态', () => {
    render(<Button disabled>禁用按钮</Button>);
    
    const button = screen.getByRole('button', { name: '禁用按钮' });
    expect(button).toBeDisabled();
  });

  test('不同类型的按钮', () => {
    const { rerender } = render(<Button variant="primary">主要</Button>);
    
    let button = screen.getByRole('button', { name: '主要' });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="secondary">次要</Button>);
    button = screen.getByRole('button', { name: '次要' });
    expect(button).toBeInTheDocument();
  });
});
