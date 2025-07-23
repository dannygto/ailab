/**
 * 使用FormContext的Hook
 *
 * 提供表单状态管理、数据验证和表单项交互的功能
 */

import { useContext, useState, useCallback, useEffect } from 'react';
import { FormContext } from './FormContext';

/**
 * 使用表单字段的Hook
 *
 * @param {string} name - 字段名称
 * @param {any} defaultValue - 默认值
 * @param {Function} validator - 验证函数 (可选)
 * @returns {Object} 包含字段值、设置值、验证状态等的对象
 */
export const useFormField = (name, defaultValue = '', validator = null) => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormField must be used within a FormProvider');
  }

  const {
    registerField,
    unregisterField,
    getFieldValue,
    setFieldValue,
    validateField,
    getFieldError,
    touchField,
    isFieldTouched
  } = context;

  // 注册字段
  useEffect(() => {
    registerField(name, defaultValue, validator);

    return () => {
      unregisterField(name);
    };
  }, [name, defaultValue, registerField, unregisterField, validator]);

  // 更新字段值
  const setValue = useCallback((value) => {
    setFieldValue(name, value);
  }, [name, setFieldValue]);

  // 验证字段
  const validate = useCallback(() => {
    return validateField(name);
  }, [name, validateField]);

  // 标记字段为已触摸
  const touch = useCallback(() => {
    touchField(name);
  }, [name, touchField]);

  return {
    value: getFieldValue(name),
    setValue,
    error: getFieldError(name),
    validate,
    touch,
    isTouched: isFieldTouched(name)
  };
};

/**
 * 使用表单的Hook
 *
 * @returns {Object} 包含表单状态和方法的对象
 */
export const useForm = () => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }

  const {
    values,
    errors,
    touched,
    validateForm,
    resetForm,
    submitForm,
    setSubmitting,
    isSubmitting,
    isDirty,
    isValid
  } = context;

  return {
    values,
    errors,
    touched,
    validateForm,
    resetForm,
    submitForm,
    setSubmitting,
    isSubmitting,
    isDirty,
    isValid
  };
};

/**
 * 使用表单数组字段的Hook
 *
 * @param {string} name - 数组字段名称
 * @returns {Object} 包含数组操作方法的对象
 */
export const useFieldArray = (name) => {
  const {
    getFieldValue,
    setFieldValue
  } = useContext(FormContext);

  const [fields, setFields] = useState(getFieldValue(name) || []);

  useEffect(() => {
    setFields(getFieldValue(name) || []);
  }, [getFieldValue, name]);

  const append = useCallback((value) => {
    const newFields = [...fields, value];
    setFields(newFields);
    setFieldValue(name, newFields);
  }, [fields, name, setFieldValue]);

  const remove = useCallback((index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    setFieldValue(name, newFields);
  }, [fields, name, setFieldValue]);

  const update = useCallback((index, value) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
    setFieldValue(name, newFields);
  }, [fields, name, setFieldValue]);

  const move = useCallback((from, to) => {
    const newFields = [...fields];
    const item = newFields[from];
    newFields.splice(from, 1);
    newFields.splice(to, 0, item);
    setFields(newFields);
    setFieldValue(name, newFields);
  }, [fields, name, setFieldValue]);

  return {
    fields,
    append,
    remove,
    update,
    move
  };
};

export default {
  useForm,
  useFormField,
  useFieldArray
};
