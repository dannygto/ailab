import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  FormHelperText,
  FormControl,
  styled,
} from '@mui/material';

/**
 * �����ߴ�ö��
 */
export enum InputSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * �����������Խӿ�
 */
export interface InputProps extends Omit<TextFieldProps, 'size' | 'variant'> {
  /** �����ߴ� */
  inputSize?: InputSize;
  /** ���ͼ�� */
  startIcon?: React.ReactNode;
  /** �Ҳ�ͼ�� */
  endIcon?: React.ReactNode;
  /** �Ƿ���ʾ�����ť */
  clearable?: boolean;
  /** �����ť����¼� */
  onClear?: () => void;
  /** ��֤״̬ */
  status?: 'success' | 'warning' | 'error' | 'default';
  /** �Ƿ��ޱ߿� */
  borderless?: boolean;
  /** �Զ�����ʽ */
  customStyle?: React.CSSProperties;
}

/**
 * �Զ����������ʽ
 */
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) =>
    !['inputSize', 'startIcon', 'endIcon', 'clearable', 'status', 'borderless', 'customStyle'].includes(String(prop)),
})<{
  inputSize?: InputSize;
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
 * ��������
 * 
 * ͳһ��ʽ������������֧�ֲ�ͬ�ߴ硢ͼ���״̬
 * 
 * @example
 * ```tsx
 * <Input placeholder="������" />
 * <Input inputSize={InputSize.SMALL} startIcon={<SearchIcon />} />
 * <Input status="error" helperText="��������" />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  inputSize = InputSize.MEDIUM,
  startIcon,
  endIcon,
  clearable = false,
  onClear,
  status = 'default',
  borderless = false,
  customStyle,
  helperText,
  error,
  ...rest
}) => {
  // ����inputSizeӳ�䵽MUI��size
  const getMuiSize = (): TextFieldProps['size'] => {
    switch (inputSize) {
      case InputSize.SMALL:
        return 'small';
      case InputSize.MEDIUM:
        return 'medium';
      case InputSize.LARGE:
        return 'medium'; // MUIû��large�ߴ磬ʹ��medium���Զ�����ʽ
      default:
        return 'medium';
    }
  };

  // ����status����error����
  const isError = error || status === 'error';

  return (
    <FormControl fullWidth error={isError} style={customStyle}>
      <StyledTextField
        variant="outlined"
        size={getMuiSize()}
        status={status}
        borderless={borderless}
        error={isError}
        InputProps={{
          startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
          endAdornment: endIcon ? <InputAdornment position="end">{endIcon}</InputAdornment> : undefined,
        }}
        {...rest}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Input;
