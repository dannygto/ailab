// DataTable组件基础测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 简单的DataTable组件模拟
interface Column {
  key: string;
  title: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => (
  <table data-testid="data-table">
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.key}>{col.title}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          {columns.map(col => (
            <td key={col.key}>{row[col.key]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

describe('DataTable组件测试', () => {
  const mockColumns = [
    { key: 'name', title: '姓名' },
    { key: 'age', title: '年龄' },
    { key: 'city', title: '城市' }
  ];

  const mockData = [
    { name: '张三', age: 25, city: '北京' },
    { name: '李四', age: 30, city: '上海' }
  ];

  test('渲染表格基础结构', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
  });

  test('显示表头', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('姓名')).toBeInTheDocument();
    expect(screen.getByText('年龄')).toBeInTheDocument();
    expect(screen.getByText('城市')).toBeInTheDocument();
  });

  test('显示数据行', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('北京')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('上海')).toBeInTheDocument();
  });

  test('空数据表格', () => {
    render(<DataTable columns={mockColumns} data={[]} />);
    
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    
    // 应该只有表头，没有数据行
    expect(screen.getByText('姓名')).toBeInTheDocument();
    expect(screen.queryByText('张三')).not.toBeInTheDocument();
  });
});
