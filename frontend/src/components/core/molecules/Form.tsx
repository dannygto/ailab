import React from 'react';
import { Button, ButtonType } from '../atoms/Button';
import { styled, Box, Grid, FormHelperText } from '@mui/material';

/**
 * ����������
 */
export interface FormItemConfig {
  /** ���������� */
  name: string;
  /** �������ǩ */
  LabelIcon?: string;
  /** �Ƿ���� */
  required?: boolean;
  /** ��������� */
  component: React.ReactNode;
  /** ������ռλ���� */
  col?: number;
  /** �Ƿ���� */
  disabled?: boolean;
  /** �����ı� */
  helperText?: string;
  /** ��֤״̬ */
  status?: 'success' | 'warning' | 'error' | 'default';
}

/**
 * �������Խӿ�
 */
export interface FormProps {
  /** ���������� */
  items: FormItemConfig[];
  /** �������� */
  title?: string;
  /** �������� */
  description?: string;
  /** �����ύ��ť�ı� */
  submitText?: string;
  /** ����ȡ����ť�ı� */
  CancelIconText?: string;
  /** �����ύ�¼� */
  onSubmit?: () => void;
  /** ����ȡ���¼� */
  onCancelIcon?: () => void;
  /** �Ƿ���ʾ�ύ��ť */
  showSubmit?: boolean;
  /** �Ƿ���ʾȡ����ť */
  showCancelIcon?: boolean;
  /** �Ƿ������ */
  loading?: boolean;
  /** ��ťλ�� */
  buttonAlign?: 'left' | 'center' | 'right';
  /** �������� */
  layout?: 'horizontal' | 'vertical';
  /** դ������ */
  gridCols?: number;
  /** �������� */
  width?: string | number;
  /** ���������� */
  maxWidth?: string | number;
  /** �����ڱ߾� */
  padding?: string | number;
  /** �����߿� */
  withBorder?: boolean;
  /** �Զ������� */
  className?: string;
  /** �Զ�����ʽ */
  style?: React.CSSProperties;
  /** ����� */
  children?: React.ReactNode;
}

/**
 * �Զ��������ʽ
 */
const FormContainer = styled(Box)<{
  withBorder?: boolean;
  width?: string | number;
  maxWidth?: string | number;
  padding?: string | number;
}>(({ theme, withBorder, width, maxWidth, padding }) => ({
  width: width || '100%',
  maxWidth: maxWidth || 'none',
  padding: padding || theme.spacing(3),
  ...(withBorder && {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  }),
}));

/**
 * �������
 * 
 * ͳһ��ʽ�ı��������֧�����û����ɱ�����
 * 
 * @example
 * ```tsx
 * <Form
 *   title="�û���Ϣ"
 *   items={[
 *     {
 *       name: 'username',
 *       label: '�û���',
 *       required: true,
 *       component: <Input placeholder="�������û���" />
 *     },
 *     {
 *       name: 'email',
 *       label: '����',
 *       component: <Input placeholder="����������" />
 *     }
 *   ]}
 *   onSubmit={handleSubmit}
 *   onCancelIcon={handleCancelIcon}
 * />
 * ```
 */
export const Form: React.FC<FormProps> = ({
  items = [],
  title,
  description,
  submitText = '�ύ',
  CancelIconText = 'ȡ��',
  onSubmit,
  onCancelIcon,
  showSubmit = true,
  showCancelIcon = true,
  loading = false,
  buttonAlign = 'right',
  layout = 'horizontal',
  gridCols = 12,
  width,
  maxWidth,
  padding,
  withBorder = false,
  className,
  style,
  children,
}) => {
  // ��ȡ��ť������ʽ
  const getButtonAlignStyle = (): React.CSSProperties => {
    switch (buttonAlign) {
      case 'left':
        return { justifyContent: 'flex-start' };
      case 'center':
        return { justifyContent: 'center' };
      case 'right':
        return { justifyContent: 'flex-end' };
      default:
        return { justifyContent: 'flex-end' };
    }
  };

  return (
    <FormContainer
      component="form"
      withBorder={withBorder}
      width={width}
      maxWidth={maxWidth}
      padding={padding}
      className={className}
      style={style}
    >
      {title && (
        <div mb={2}>
          <div component="h3" sx={{ m: 0, mb: description ? 1 : 0 }}>
            {title}
          </div>
          {description && <div component="p" sx={{ m: 0, color: 'text.secondary' }}>{description}</div>}
        </div>
      )}

      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid item xs={12} md={item.col || gridCols} key={item.name || index}>
            <div mb={layout === 'vertical' ? 2 : 0}>
              {item.label && (
                <div component="label" sx={{ display: 'block', mb: 1 }}>
                  {item.label}
                  {item.required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
                </div>
              )}
              {item.component}
              {item.helperText && (
                <FormHelperText
                  error={item.status === 'error'}
                  sx={{
                    color:
                      item.status === 'success'
                        ? 'success.main'
                        : item.status === 'warning'
                        ? 'warning.main'
                        : undefined,
                  }}
                >
                  {item.helperText}
                </FormHelperText>
              )}
            </div>
          </Grid>
        ))}

        {children && (
          <Grid item xs={12}>
            {children}
          </Grid>
        )}

        {(showSubmit || showCancelIcon) && (
          <Grid item xs={12}>
            <div
              display="flex"
              sx={{
                mt: 3,
                ...getButtonAlignStyle(),
              }}
            >
              {showCancelIcon && (
                <Button
                  buttonType={ButtonType.SECONDARY}
                  onClick={onCancelIcon}
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {CancelIconText}
                </Button>
              )}
              {showSubmit && (
                <Button
                  buttonType={ButtonType.PRIMARY}
                  onClick={onSubmit}
                  loading={loading}
                >
                  {submitText}
                </Button>
              )}
            </div>
          </Grid>
        )}
      </Grid>
    </FormContainer>
  );
};

export default Form;
