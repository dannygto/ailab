import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorageIcon hook�ķ�������
 */
type UseLocalStorageIconReturn<T> = [
  T,
  (value: T | ((val: T) => T)) => void,
  () => void
];

/**
 * ���ش洢Hook
 * 
 * ����localStorage�е�״̬��֧�ֶ���ͻ�������
 * 
 * @param key - �洢����
 * @param initialValue - ��ʼֵ
 * @returns [�洢��ֵ, ����ֵ�ĺ���, �Ƴ�ֵ�ĺ���]
 * 
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorageIcon('theme', 'light');
 * 
 * // ����ֵ
 * setTheme('dark');
 * 
 * // ʹ�ú���ʽ����
 * setTheme(prev => prev === 'light' ? 'dark' : 'light');
 * 
 * // �Ƴ���
 * removeTheme();
 * ```
 */
export function useLocalStorageIcon<T>(key: string, initialValue: T): UseLocalStorageIconReturn<T> {
  // ״̬��ʼ������
  const initialize = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      // ����Ƿ��Ѿ���ֵ
      if (item) {
        return JSON.parse(item);
      }
      
      // ����ʹ�ó�ʼֵ
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // ʵ�ʵ�״̬�洢
  const [storedValue, setStoredValue] = useState<T>(initialize);

  // ����״̬���ú���
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // ��������ʽ����
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // ���浽state
      setStoredValue(valueToStore);
      
      // ���浽localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // �Ƴ��洢��
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // ��������ҳ����ǩ�Ըü��ĸ���
  useEffect(() => {
    const handleStorageIconChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    // 监听事件变化
    window.addEventListener('storage', handleStorageIconChange as EventListener);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageIconChange as EventListener);
    };
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorageIcon;
