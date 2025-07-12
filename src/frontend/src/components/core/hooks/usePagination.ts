import('@mui/material');
import { useState, useCallback } from 'react';

/**
 * 分页状态接�?
 */
export interface PaginationState {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总数据量 */
  total: number;
}

/**
 * 分页操作接口
 */
export interface PaginationActions {
  /** 设置当前页码 */
  setPage: (page: number) => void;
  /** 设置每页条数 */
  setPageSize: (pageSize: number) => void;
  /** 设置总数据量 */
  setTotal: (total: number) => void;
  /** 重置分页状�?*/
  reset: () => void;
  /** 前往第一�?*/
  goToFirstPage: () => void;
  /** 前往最后一�?*/
  goToLastPage: () => void;
  /** 前往下一�?*/
  goToNextPage: () => void;
  /** 前往上一�?*/
  goToPreviousPage: () => void;
}

/**
 * 分页Hook的返回类�?
 */
export type UsePaginationReturn = [
  PaginationState,
  PaginationActions
];

/**
 * 分页Hook配置
 */
export interface UsePaginationOptions {
  /** 默认页码 */
  defaultPage?: number;
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 默认总数据量 */
  defaultTotal?: number;
}

/**
 * 分页Hook
 * 
 * 管理分页状态和操作
 * 
 * @param options - 分页配置选项
 * @returns [分页状�? 分页操作]
 * 
 * @example
 * ```tsx
 * const [
 *   { page, pageSize, total },
 *   { setPage, setPageSize, goToNextPage, goToPreviousPage }
 * ] = usePagination({ defaultPageSize: 10 });
 * 
 * // 在fetchData中使�?
 * useEffect(() => {
 *   const fetchData = async () => {
 *     const response = await api.getData(page, pageSize);
 *     setData(response.data);
 *     setTotal(response.total);
 *   };
 *   
 *   fetchData();
 * }, [page, pageSize]);
 * ```
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    defaultPage = 0,
    defaultPageSize = 10,
    defaultTotal = 0
  } = options;

  // 分页状�?
  const [page, setPage] = useState<number>(defaultPage);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [total, setTotal] = useState<number>(defaultTotal);

  // 计算最大页�?
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);

  // 重置分页状�?
  const reset = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setTotal(defaultTotal);
  }, [defaultPage, defaultPageSize, defaultTotal]);

  // 前往第一�?
  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  // 前往最后一�?
  const goToLastPage = useCallback(() => {
    setPage(maxPage);
  }, [maxPage]);

  // 前往下一�?
  const goToNextPage = useCallback(() => {
    setPage((prevPage) => Math.min(prevPage + 1, maxPage));
  }, [maxPage]);

  // 前往上一�?
  const goToPreviousPage = useCallback(() => {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  }, []);

  // 合并状态和操作
  return [
    { page, pageSize, total },
    {
      setPage,
      setPageSize,
      setTotal,
      reset,
      goToFirstPage,
      goToLastPage,
      goToNextPage,
      goToPreviousPage
    }
  ];
}

export default usePagination;
