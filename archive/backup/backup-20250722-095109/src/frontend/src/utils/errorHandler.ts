/**
 * Unified Error Handling Utility
 * Provides a unified error handling mechanism for API calls
 */
import { message } from 'antd';

/**
 * Error type definition
 */
export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  data?: any;
}

/**
 * Error handler options
 */
interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  throwError?: boolean;
  context?: string;
}

/**
 * Default error handler options
 */
const defaultOptions: ErrorHandlerOptions = {
  showNotification: true,
  logToConsole: process.env.NODE_ENV !== 'production',
  throwError: false,
  context: '',
};

/**
 * Handle API errors
 * @param error The caught error object
 * @param options Error handling options
 * @returns Formatted error object
 */
export const handleApiError = (error: any, options: ErrorHandlerOptions = {}): ApiError => {
  const opts = { ...defaultOptions, ...options };

  // Format error object
  const apiError: ApiError = formatError(error);

  // Add context information
  if (opts.context) {
    apiError.message = `${opts.context}: ${apiError.message}`;
  }

  // Show notification
  if (opts.showNotification) {
    showErrorNotification(apiError);
  }

  // Log output
  if (opts.logToConsole) {
    // Only output detailed logs outside production environment
    console.error('[API Error]', apiError);
    if (error?.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  }

  // Whether to continue throwing error
  if (opts.throwError) {
    throw apiError;
  }

  return apiError;
};

/**
 * Format error object to unified format
 * @param error The caught error object
 * @returns Formatted error object
 */
const formatError = (error: any): ApiError => {
  // If it's an Axios error
  if (error?.response) {
    const { status, data } = error.response;
    return {
      status,
      message: data?.message || `Request failed (${status})`,
      code: data?.code,
      data: data
    };
  }

  // If it's a network error
  if (error?.request) {
    return {
      status: 0,
      message: 'Network connection failed, please check your network connection',
      code: 'NETWORK_ERROR'
    };
  }

  // Other error types
  return {
    message: error?.message || 'Unknown error occurred',
    code: error?.code,
    data: error?.data
  };
};

/**
 * Show error notification
 * @param error API error object
 */
const showErrorNotification = (error: ApiError) => {
  // Customize message based on error status code
  let errorMessage = error.message;

  // Provide friendly messages for common HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        errorMessage = error.message || 'Request parameter error';
        break;
      case 401:
        errorMessage = 'User not logged in or session expired, please log in again';
        break;
      case 403:
        errorMessage = 'No operation permission';
        break;
      case 404:
        errorMessage = 'Requested resource does not exist';
        break;
      case 500:
        errorMessage = 'Internal server error, please try again later';
        break;
      default:
        if (error.status >= 500) {
          errorMessage = 'Server error, please contact administrator';
        } else if (error.status >= 400) {
          errorMessage = 'Request error, please check input';
        }
    }
  }

  // Use Ant Design's message component to display error
  message.error(errorMessage);
};

/**
 * Try to execute a function and handle possible errors
 * @param fn The async function to execute
 * @param errorOptions Error handling options
 * @returns Function execution result Promise
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorOptions: ErrorHandlerOptions = {}
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, errorOptions);
    return null;
  }
};
