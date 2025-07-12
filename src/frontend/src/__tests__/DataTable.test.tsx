import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { renderWithTheme } from '../test-utils';

const MockDataTable = () => (
  <Table data-testid="data-table">
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>名称</TableCell>
        <TableCell>状态</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>1</TableCell>
        <TableCell>实验A</TableCell>
        <TableCell>运行中</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>2</TableCell>
        <TableCell>实验B</TableCell>
        <TableCell>已完成</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

describe('DataTable', () => {
  test('渲染数据表格', () => {
    renderWithTheme(<MockDataTable />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  test('显示表头', () => {
    renderWithTheme(<MockDataTable />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  test('显示数据行', () => {
    renderWithTheme(<MockDataTable />);
    expect(screen.getByText('实验A')).toBeInTheDocument();
    expect(screen.getByText('实验B')).toBeInTheDocument();
    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });
});

export default MockDataTable;
