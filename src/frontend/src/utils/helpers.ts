// 通用工具函数

/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param func 需要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模板 (默认: 'YYYY-MM-DD HH:mm:ss')
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的新对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }

  return obj;
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 11) +
    Date.now().toString(36);
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名（小写）
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * 判断是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 判断是否为空对象
 * @param obj 对象
 * @returns 是否为空对象
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 安全解析JSON
 * @param jsonString JSON字符串
 * @param fallback 解析失败时的返回值
 * @returns 解析结果
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

/**
 * 提取URL参数
 * @param url URL字符串
 * @returns 参数对象
 */
export function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);

  for (const [key, value] of searchParams) {
    params[key] = value;
  }

  return params;
}

/**
 * 从对象中选择指定的字段
 * @param obj 源对象
 * @param keys 要选择的字段
 * @returns 新对象，只包含指定字段
 */
export function pickFromObject<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * 从对象中排除指定的字段
 * @param obj 源对象
 * @param keys 要排除的字段
 * @returns 新对象，不包含指定字段
 */
export function omitFromObject<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
}
