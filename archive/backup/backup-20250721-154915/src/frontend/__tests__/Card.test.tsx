// Card组件基础测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 创建一个简单的Card组件用于测试
const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div data-testid="card">
    {title && <h3>{title}</h3>}
    <div>{children}</div>
  </div>
);

describe('Card组件测试', () => {
  test('渲染基础卡片', () => {
    render(<Card>内容</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  test('带标题的卡片', () => {
    render(<Card title="测试标题">内容</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('测试标题')).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  test('嵌套内容', () => {
    render(
      <Card title="父卡片">
        <div>子内容1</div>
        <div>子内容2</div>
      </Card>
    );
    
    expect(screen.getByText('父卡片')).toBeInTheDocument();
    expect(screen.getByText('子内容1')).toBeInTheDocument();
    expect(screen.getByText('子内容2')).toBeInTheDocument();
  });
});
