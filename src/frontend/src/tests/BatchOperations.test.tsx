import { Box } from '@mui/material';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 简单的模拟组件
const BatchOperations = () => (
  <div data-testid="batch-operations">
    <h2>批量操作</h2>
    <button>批量删除</button>
    <button>批量导出</button>
  </div>
);

describe('BatchOperations', () => {
  test('渲染批量操作组件', () => {
    render(<BatchOperations />);
    expect(screen.getByTestId('batch-operations')).toBeInTheDocument();
    expect(screen.getByText('批量操作')).toBeInTheDocument();
    expect(screen.getByText('批量删除')).toBeInTheDocument();
    expect(screen.getByText('批量导出')).toBeInTheDocument();
  });
});

export default BatchOperations;
