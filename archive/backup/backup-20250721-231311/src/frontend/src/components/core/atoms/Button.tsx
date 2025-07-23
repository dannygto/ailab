import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled, Box } from '@mui/material';

/**
 * 按钮类型枚举
 */
export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  TEXT = 'text',
}

/**
 * 按钮尺寸枚举
 */
export enum ButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * 按钮组件属性接�?
 */
export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'size'> {
  /** 按钮类型 */
  buttonType?: ButtonType;
  /** 按钮尺寸 */
  buttonSize?: ButtonSize;
  /** 是否全宽�?*/
  fullWidth?: boolean;
  /** 是否加载�?*/
  loading?: boolean;
  /** 图标 */
  icon?: React.ReactNode;
  /** 图标位置 */
  iconPosition?: 'start' | 'end';
}

/**
 * 自定义按钮样�?
 */
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'loading' && prop !== 'buttonType' && prop !== 'buttonSize',
})<{ loading?: boolean; buttonType?: ButtonType; buttonSize?: ButtonSize }>(
  ({ loading, buttonType, buttonSize }) => ({
    position: 'relative',
    ...(loading && {
      '& .MuiCircularProgress-root': {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: '-12px',
        marginTop: '-12px',
      },
      '& .button-content': {
        visibility: 'hidden',
      },
    }),
  })
);

/**
 * 按钮组件
 * 
 * 统一样式的按钮组件，支持不同类型、尺寸和加载状�?
 * 
 * @example
 * ```tsx
 * <Button buttonType={ButtonType.PRIMARY}>点击�?/Button>
 * <Button buttonType={ButtonType.SECONDARY} loading={true}>加载�?/Button>
 * <Button buttonType={ButtonType.SUCCESS} icon={<CheckIconIcon />}>成功</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  buttonType = ButtonType.PRIMARY,
  buttonSize = ButtonSize.MEDIUM,
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'start',
  disabled = false,
  ...rest
}) => {
  // 根据buttonType映射到MUI的color
  const getColor = (): MuiButtonProps['color'] => {
    switch (buttonType) {
      case ButtonType.PRIMARY:
        return 'primary';
      case ButtonType.SECONDARY:
        return 'secondary';
      case ButtonType.SUCCESS:
        return 'success';
      case ButtonType.WARNING:
        return 'warning';
      case ButtonType.DANGER:
        return 'error';
      case ButtonType.INFO:
        return 'info';
      case ButtonType.TEXT:
        return 'inherit';
      default:
        return 'primary';
    }
  };

  // 根据buttonSize映射到MUI的size
  const getSize = (): MuiButtonProps['size'] => {
    switch (buttonSize) {
      case ButtonSize.SMALL:
        return 'small';
      case ButtonSize.MEDIUM:
        return 'medium';
      case ButtonSize.LARGE:
        return 'large';
      default:
        return 'medium';
    }
  };

  // 根据buttonType映射到MUI的variant
  const getVariant = (): MuiButtonProps['variant'] => {
    return buttonType === ButtonType.TEXT ? 'text' : 'contained';
  };

  return (
    <StyledButton
      color={getColor()}
      size={getSize()}
      variant={getVariant()}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      loading={loading}
      buttonType={buttonType}
      buttonSize={buttonSize}
      startIcon={icon && iconPosition === 'start' ? icon : undefined}
      endIcon={icon && iconPosition === 'end' ? icon : undefined}
      {...rest}
    >
      <span className="button-content">{children}</span>
    </StyledButton>
  );
};

export default Button;
