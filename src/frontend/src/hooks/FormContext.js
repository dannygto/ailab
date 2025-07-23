import React, { createContext, useState, useCallback, useMemo } from 'react';

// 创建FormContext
export const FormContext = createContext(null);

/**
 * 表单上下文提供者
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.initialValues - 初始表单值
 * @param {Function} props.onSubmit - 提交回调
 * @param {Function} props.validate - 表单级验证函数
 * @param {React.ReactNode} props.children - 子组件
 */
export const FormProvider = ({
  initialValues = {},
  onSubmit,
  validate,
  children
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fieldValidators, setFieldValidators] = useState({});

  // 注册字段
  const registerField = useCallback((name, defaultValue, validator) => {
    setValues(prevValues => {
      // 如果字段已经存在值，则不覆盖
      if (prevValues[name] !== undefined) {
        return prevValues;
      }
      return { ...prevValues, [name]: defaultValue };
    });

    if (validator) {
      setFieldValidators(prev => ({ ...prev, [name]: validator }));
    }
  }, []);

  // 取消注册字段
  const unregisterField = useCallback((name) => {
    setFieldValidators(prev => {
      const newValidators = { ...prev };
      delete newValidators[name];
      return newValidators;
    });
  }, []);

  // 获取字段值
  const getFieldValue = useCallback((name) => {
    return values[name];
  }, [values]);

  // 设置字段值
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);

    // 如果字段被标记为触摸过且有验证器，则重新验证
    if (touched[name] && fieldValidators[name]) {
      validateField(name);
    }
  }, [touched, fieldValidators]);

  // 验证字段
  const validateField = useCallback((name) => {
    const validator = fieldValidators[name];
    if (!validator) return true;

    const value = values[name];
    const error = validator(value, values);

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, [values, fieldValidators]);

  // 获取字段错误
  const getFieldError = useCallback((name) => {
    return errors[name];
  }, [errors]);

  // 标记字段为已触摸
  const touchField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // 判断字段是否已触摸
  const isFieldTouched = useCallback((name) => {
    return !!touched[name];
  }, [touched]);

  // 验证整个表单
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};

    // 验证所有字段
    Object.keys(fieldValidators).forEach(name => {
      const validator = fieldValidators[name];
      if (validator) {
        const value = values[name];
        const error = validator(value, values);
        newErrors[name] = error;
        if (error) isValid = false;
      }
    });

    // 执行表单级验证
    if (validate) {
      const formErrors = validate(values);
      if (formErrors) {
        Object.assign(newErrors, formErrors);
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, fieldValidators, validate]);

  // 判断表单是否有效
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setSubmitting(false);
  }, [initialValues]);

  // 提交表单
  const submitForm = useCallback(async () => {
    setSubmitting(true);

    // 标记所有字段为已触摸
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const isValid = validateForm();

    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setSubmitting(false);
    return isValid;
  }, [values, validateForm, onSubmit]);

  const contextValue = useMemo(() => ({
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    registerField,
    unregisterField,
    getFieldValue,
    setFieldValue,
    validateField,
    getFieldError,
    touchField,
    isFieldTouched,
    validateForm,
    resetForm,
    submitForm,
    setSubmitting
  }), [
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    registerField,
    unregisterField,
    getFieldValue,
    setFieldValue,
    validateField,
    getFieldError,
    touchField,
    isFieldTouched,
    validateForm,
    resetForm,
    submitForm,
    setSubmitting
  ]);

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

export default FormProvider;
