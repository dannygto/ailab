import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  styled,
  Checkbox,
  Skeleton,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { RefreshIcon } from '../../../utils/icons';
import { FilterListIcon } from '../../../utils/icons';
import { ViewColumnIcon } from '../../../utils/icons';
import { DownloadIcon } from '../../../utils/icons';

/**
 * ����������
 */
export interface DataTableColumn<T = any> {
  /** ��ID */
  id: string;
  /** �б��� */
  label: string;
  /** �п� */
  width?: string | number;
  /** ���뷽ʽ */
  align?: 'left' | 'center' | 'right';
  /** �Ƿ����� */
  sortable?: boolean;
  /** �Ƿ�ɼ� */
  visible?: boolean;
  /** �Ƿ�̶� */
  fixed?: boolean;
  /** ��Ԫ����Ⱦ���� */
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

/**
 * �������Խӿ�
 */
export interface DataTableProps<T = any> {
  /** ���������� */
  columns: DataTableColumn<T>[];
  /** �������� */
  data: T[];
  /** �Ƿ������ */
  loading?: boolean;
  /** �Ƿ���ʾ��� */
  showIndex?: boolean;
  /** �Ƿ���ʾ��ѡ�� */
  showCheckIconbox?: boolean;
  /** �Ƿ���ʾ��ͷ */
  showHeader?: boolean;
  /** �Ƿ���ʾ��ҳ */
  showPagination?: boolean;
  /** �Ƿ���ʾ������ */
  showToolbar?: boolean;
  /** �Ƿ��ѡ�� */
  selectable?: boolean;
  /** ������� */
  title?: string;
  /** �����ܶ� */
  size?: 'small' | 'medium';
  /** ����߶� */
  height?: string | number;
  /** ��С�߶� */
  minHeight?: string | number;
  /** ���߶� */
  maxHeight?: string | number;
  /** �Ƿ���߿� */
  withBorder?: boolean;
  /** �Ƿ����Ӱ */
  withShadow?: boolean;
  /** �Ƿ���ʾ����ɫ */
  striped?: boolean;
  /** �Ƿ����ͣ */
  hoverable?: boolean;
  /** �������ı� */
  emptyText?: string;
  /** �������� */
  total?: number;
  /** ��ǰҳ�� */
  page?: number;
  /** ÿҳ���� */
  pageSize?: number;
  /** ��ѡ��ÿҳ���� */
  pageSizeOptions?: number[];
  /** ������عǼ������� */
  loadingRows?: number;
  /** ��ҳ���� */
  pagination?: {
    page: number;
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    totalCount: number;
    onPageChange: (Event: unknown, newPage: number) => void;
    onRowsPerPageChange: (Event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  /** ѡ�е��� */
  selectedRows?: T[];
  /** �����е���¼� */
  onRowClick?: (row: T, index: number) => void;
  /** ѡ���б仯�¼� */
  onSelectChange?: (selectedRows: T[]) => void;
  /** ҳ��仯�¼� */
  onPageChange?: (page: number) => void;
  /** ÿҳ�����仯�¼� */
  onPageSizeChange?: (pageSize: number) => void;
  /** ����仯�¼� */
  onsortChange?: (column: string, direction: 'asc' | 'desc') => void;
  /** ˢ���¼� */
  onRefreshIcon?: () => void;
  /** ��������� */
  children?: React.ReactNode;
  /** �Զ������� */
  className?: string;
  /** �Զ�����ʽ */
  style?: React.CSSProperties;
}

/**
 * �Զ��������ʽ
 */
const StyledTableContainer = styled(TableContainer)<{
  withBorder?: boolean;
  withShadow?: boolean;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}>(({ theme, withBorder, withShadow, height, minHeight, maxHeight }) => ({
  height: height || 'auto',
  minHeight: minHeight || 'auto',
  maxHeight: maxHeight || 'none',
  ...(withBorder && {
    border: `1px solid ${theme.palette.divider}`,
  }),
  ...(withShadow && {
    boxShadow: theme.shadows[1],
  }),
  ...(!withShadow && !withBorder && {
    boxShadow: 'none',
  }),
}));

/**
 * �Զ����������ʽ
 */
const StyledTableRow = styled(TableRow)<{
  striped?: boolean;
  hoverable?: boolean;
  isClickable?: boolean;
}>(({ theme, striped, hoverable, isClickable }) => ({
  ...(striped && {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(hoverable && {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(isClickable && {
    cursor: 'pointer',
  }),
}));

/**
 * ���ݱ������
 * 
 * ͳһ��ʽ�����ݱ��������֧�ַ�ҳ������ѡ��ȹ���
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { id: 'name', label: '����' },
 *     { id: 'age', label: '����' },
 *     { id: 'address', label: '��ַ' }
 *   ]}
 *   data={userData}
 *   loading={loading}
 *   showPagination={true}
 *   onPageChange={handlePageChange}
 * />
 * ```
 */
export const DataTable = <T extends Record<string, any> = any>({
  columns = [],
  data = [],
  loading = false,
  showIndex = false,
  showCheckIconbox = false,
  showHeader = true,
  showPagination = false,
  showToolbar = false,
  selectable = false,
  title,
  size = 'medium',
  height,
  minHeight,
  maxHeight,
  withBorder = true,
  withShadow = false,
  striped = false,
  hoverable = true,
  emptyText = '��������',
  total = 0,
  page = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  loadingRows = 5,
  onRowClick,
  onSelectChange,
  onPageChange,
  onPageSizeChange,
  onsortChange,
  onRefreshIcon,
  children,
  className,
  style,
}: DataTableProps<T>) => {
  // ѡ����״̬
  const [selected, setSelected] = React.useState<T[]>([]);
  
  // ����״̬
  const [sortColumn, setsortColumn] = React.useState<string>('');
  const [sortDirection, setsortDirection] = React.useState<'asc' | 'desc'>('asc');

  // ����ȫѡ���
  const handleSelectAllClick = (Event: React.ChangeEvent<HTMLInputElement>) => {
    if (Event.target.checked) {
      setSelected(data);
      onSelectChange?.(data);
    } else {
      setSelected([]);
      onSelectChange?.([]);
    }
  };

  // ������ѡ����
  const handleRowSelect = (row: T) => {
    const selectedIndex = selected.findIndex((item) => item === row);
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((_, index) => index !== selectedIndex);
    }

    setSelected(newSelected);
    onSelectChange?.(newSelected);
  };

  // ����������
  const handlesortClick = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setsortColumn(column);
    setsortDirection(newDirection);
    onsortChange?.(column, newDirection);
  };

  // ����ҳ��仯
  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  // ����ÿҳ�����仯
  const handlePageSizeChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange?.(parseInt(Event.target.value, 10));
  };

  // �ж����Ƿ�ѡ��
  const isSelected = (row: T) => selected.indexOf(row) !== -1;

  // ��Ⱦ����״̬�Ǽ���
  const renderLoadingSkeleton = () => {
    return Array.from({ length: loadingRows }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {showCheckIconbox && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
        )}
        {showIndex && (
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
        )}
        {columns
          .filter((column) => column.visible !== false)
          .map((column) => (
            <TableCell key={`skeleton-cell-${column.id}`} align={column.align || 'left'}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
      </TableRow>
    ));
  };

  // ��Ⱦ������״̬
  const renderEmptyData = () => {
    return (
      <TableRow>
        <TableCell
          colSpan={
            (showCheckIconbox ? 1 : 0) +
            (showIndex ? 1 : 0) +
            columns.filter((column) => column.visible !== false).length
          }
          align="center"
          sx={{ py: 4 }}
        >
          <Typography variant="body1" color="text.secondary">
            {emptyText}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  // ��Ⱦ������
  const renderToolbar = () => {
    if (!showToolbar && !title) return null;

    return (
      <div
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {title && (
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        )}
        <div>
          {onRefreshIcon && (
            <Tooltip title="ˢ��">
              <IconButton size="small" onClick={onRefreshIcon}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="ɸѡ">
            <IconButton size="small">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="������">
            <IconButton size="small">
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="����">
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <div className={className} style={style}>
      <StyledTableContainer
        withBorder={withBorder}
        withShadow={withShadow}
        height={height}
        minHeight={minHeight}
        maxHeight={maxHeight}
      >
        {renderToolbar()}

        <Table size={size} stickyHeader>
          {showHeader && (
            <TableHead>
              <TableRow>
                {showCheckIconbox && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < data.length}
                      checked={data.length > 0 && selected.length === data.length}
                      onChange={handleSelectAllClick}
                      disabled={!selectable || loading}
                    />
                  </TableCell>
                )}
                {showIndex && <TableCell width={60}>#</TableCell>}
                {columns
                  .filter((column) => column.visible !== false)
                  .map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      width={column.width}
                      sortDirection={sortColumn === column.id ? sortDirection : false}
                      onClick={() => column.sortable && handlesortClick(column.id)}
                      sx={{
                        cursor: column.sortable ? 'pointer' : 'default',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {loading
              ? renderLoadingSkeleton()
              : data.length === 0
              ? renderEmptyData()
              : data.map((row, index) => {
                  const isItemSelected = isSelected(row);
                  return (
                    <StyledTableRow
                      key={`row-${index}`}
                      selected={isItemSelected}
                      striped={striped}
                      hoverable={hoverable}
                      isClickable={!!onRowClick}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {showCheckIconbox && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleRowSelect(row)}
                            disabled={!selectable}
                          />
                        </TableCell>
                      )}
                      {showIndex && <TableCell>{index + 1 + page * pageSize}</TableCell>}
                      {columns
                        .filter((column) => column.visible !== false)
                        .map((column) => (
                          <TableCell key={`cell-${column.id}-${index}`} align={column.align || 'left'}>
                            {column.render
                              ? column.render(row[column.id], row, index)
                              : row[column.id] !== undefined
                              ? String(row[column.id])
                              : ''}
                          </TableCell>
                        ))}
                    </StyledTableRow>
                  );
                })}
          </TableBody>
        </Table>

        {children}

        {showPagination && (
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={total || data.length}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handlePageSizeChange}
          />
        )}
      </StyledTableContainer>
    </div>
  );
};

export default DataTable;

