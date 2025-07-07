import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  styled,
} from '@mui/material';

/**
 * ѡ����ӿ�
 */
export interface SelectOption {
  /** ѡ��ֵ */
  value: string | number;
  /** ѡ���ǩ */
  label: string;
  /** �Ƿ���� */
  disabled?: boolean;
  /** �����ʶ */
  group?: string;
  /** ͼ�� */
  icon?: React.ReactNode;
}

/**
 * ѡ���ߴ�ö��
 */
export enum SelectSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * ѡ���������Խӿ�
 */
export interface SelectProps extends Omit<MuiSelectProps, 'size'> {
  /** ѡ���ߴ� */
  selectSize?: SelectSize;
  /** ѡ���б� */
  options: SelectOption[];
  /** ��ǩ */
  LabelIcon?: string;
  /** �����ı� */
  helperText?: string;
  /** ��֤״̬ */
  status?: 'success' | 'warning' | 'error' | 'default';
  /** �Ƿ�֧������ */
  searchable?: boolean;
  /** �Ƿ�֧����� */
  clearable?: boolean;
  /** �����ť����¼� */
  onClear?: () => void;
  /** �����ı��仯�¼� */
  onSearch?: (value: string) => void;
  /** �Զ�����ʽ */
  customStyle?: React.CSSProperties;
  /** �Ƿ���ʾ�߿� */
  borderless?: boolean;
}

/**
 * �Զ���ѡ�����ʽ
 */
const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) =>
    !['selectSize', 'status', 'searchable', 'clearable', 'customStyle', 'borderless'].includes(String(prop)),
})<{
  selectSize?: SelectSize;
  status?: 'success' | 'warning' | 'error' | 'default';
  borderless?: boolean;
}>(({ theme, status, borderless }) => ({
  '& .MuiOutlinedInput-root': {
    ...(borderless && {
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: 'none',
      },
    }),
    ...(status === 'success' && {
      '& fieldset': {
        borderColor: theme.palette.success.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.success.dark,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.success.main,
      },
    }),
    ...(status === 'warning' && {
      '& fieldset': {
        borderColor: theme.palette.warning.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.warning.dark,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.warning.main,
      },
    }),
  },
}));

/**
 * ѡ������
 * 
 * ͳһ��ʽ��ѡ��������֧�ֲ�ͬ�ߴ��״̬
 * 
 * @example
 * ```tsx
 * <Select
 *   label="ѡ����Ŀ"
 *   options={[
 *     { value: '1', label: 'ѡ��1' },
 *     { value: '2', label: 'ѡ��2' }
 *   ]}
 * />
 * <Select
 *   selectSize={SelectSize.SMALL}
 *   status="error"
 *   helperText="��ѡ��һ��"
 *   options={options}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  selectSize = SelectSize.MEDIUM,
  options = [],
  label,
  helperText,
  status = 'default',
  searchable = false,
  clearable = false,
  onClear,
  onSearch,
  customStyle,
  borderless = false,
  error,
  ...rest
}) => {
  // ����selectSizeӳ�䵽MUI��size
  const getMuiSize = (): 'small' | 'medium' => {
    switch (selectSize) {
      case SelectSize.SMALL:
        return 'small';
      case SelectSize.MEDIUM:
      case SelectSize.LARGE:
        return 'medium';
      default:
        return 'medium';
    }
  };

  // ����status����error����
  const isError = error || status === 'error';

  // ����options����MenuItem
  const renderOptions = () => {
    // ����Ƿ��з���
    const hasGroups = options.some(option => option.group);
    
    if (hasGroups) {
      // ������ۺ�ѡ��
      const groups = options.reduce<Record<string, SelectOption[]>>((acc, option) => {
        const groupName = option.group || 'default';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(option);
        return acc;
      }, {});

      // ��Ⱦ����ѡ��
      return Object.entries(groups).map(([groupName, groupOptions]) => (
        <React.Fragment key={groupName}>
          {groupName !== 'default' && (
            <MenuItem disabled style={{ opacity: 0.6, fontSize: '0.8rem' }}>
              {groupName}
            </MenuItem>
          )}
          {groupOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
              {option.label}
            </MenuItem>
          ))}
        </React.Fragment>
      ));
    }

    // ������ֱ����Ⱦ
    return options.map((option) => (
      <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
        {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
        {option.label}
      </MenuItem>
    ));
  };

  return (
    <StyledFormControl
      fullWidth
      error={isError}
      size={getMuiSize()}
      status={status}
      borderless={borderless}
      style={customStyle}
    >
      {label && <InputLabel>{label }</InputLabel>}
      <MuiSelect
        size={getMuiSize()}
        label={label }
        error={isError}
        {...rest}
      >
        {renderOptions()}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  );
};

export default Select;

