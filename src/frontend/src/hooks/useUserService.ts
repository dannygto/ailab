import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * 用户服务钩子
 * 提供用户相关操作的功能
 */
export const useUserService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 搜索用户
   * @param searchText 搜索文本
   * @returns 匹配的用户列表
   */
  const searchUsers = useCallback(async (searchText: string): Promise<User[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/users/search', {
        params: { query: searchText }
      });

      return response.data.users;
    } catch (err) {
      console.error('搜索用户失败:', err);
      setError('搜索用户时发生错误');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 获取用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  const getUserById = useCallback(async (userId: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setError('获取用户信息时发生错误');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 获取当前登录用户信息
   * @returns 当前用户信息
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/users/me');
      return response.data;
    } catch (err) {
      console.error('获取当前用户信息失败:', err);
      setError('获取当前用户信息时发生错误');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 批量获取用户信息
   * @param userIds 用户ID数组
   * @returns 用户信息数组
   */
  const getUsersByIds = useCallback(async (userIds: string[]): Promise<User[]> => {
    if (userIds.length === 0) return [];

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post('/api/users/batch', { userIds });
      return response.data.users;
    } catch (err) {
      console.error('批量获取用户信息失败:', err);
      setError('批量获取用户信息时发生错误');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 获取所有用户
   * @returns 所有用户列表
   */
  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/users');
      return response.data.users;
    } catch (err) {
      console.error('获取用户列表失败:', err);
      setError('获取用户列表时发生错误');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    searchUsers,
    getUserById,
    getCurrentUser,
    getUsersByIds,
    getUsers
  };
};
