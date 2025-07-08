import React from 'react';
import { Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  styled,
  Typography,
  IconButton, Box } from '@mui/material';

/**
 * ��Ƭ�ߴ�ö��
 */
export enum CardSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * ��Ƭ������Խӿ�
 */
export interface CardProps extends Omit<MuiCardProps, 'title'> {
  /** ��Ƭ���� */
  title?: React.ReactNode;
  /** ��Ƭ������ */
  subTitleIcon?: React.ReactNode;
  /** ��Ƭ�ߴ� */
  cardSize?: CardSize;
  /** �Ƿ�����Ӱ */
  withShadow?: boolean;
  /** �Ƿ��б߿� */
  withBorder?: boolean;
  /** �Ƿ����ڱ߾� */
  withPadding?: boolean;
  /** ͷ��������ť */
  actions?: React.ReactNode[];
  /** �ײ��������� */
  footerActions?: React.ReactNode;
  /** ���Ͻǲ���ͼ�� */
  headerIcon?: React.ReactNode;
  /** �������¼� */
  onTitleIconClick?: () => void;
  /** �Զ���ͷ����ʽ */
  headerStyle?: React.CSSProperties;
  /** �Զ���������ʽ */
  contentStyle?: React.CSSProperties;
  /** �Զ���ײ���ʽ */
  footerStyle?: React.CSSProperties;
}

/**
 * �Զ��忨Ƭ��ʽ
 */
const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) =>
    !['cardSize', 'withShadow', 'withBorder', 'withPadding'].includes(String(prop)),
})<{
  cardSize?: CardSize;
  withShadow?: boolean;
  withBorder?: boolean;
  withPadding?: boolean;
}>(({ theme, cardSize, withShadow, withBorder, withPadding }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  ...(cardSize === CardSize.SMALL && {
    '& .MuiCardHeader-root': {
      padding: theme.spacing(1, 2),
    },
    '& .MuiCardContent-root': {
      padding: withPadding ? theme.spacing(1, 2) : 0,
    },
    '& .MuiCardActions-root': {
      padding: theme.spacing(1),
    },
  }),
  ...(cardSize === CardSize.MEDIUM && {
    '& .MuiCardHeader-root': {
      padding: theme.spacing(2),
    },
    '& .MuiCardContent-root': {
      padding: withPadding ? theme.spacing(2) : 0,
    },
    '& .MuiCardActions-root': {
      padding: theme.spacing(1, 2),
    },
  }),
  ...(cardSize === CardSize.LARGE && {
    '& .MuiCardHeader-root': {
      padding: theme.spacing(3),
    },
    '& .MuiCardContent-root': {
      padding: withPadding ? theme.spacing(3) : 0,
    },
    '& .MuiCardActions-root': {
      padding: theme.spacing(2, 3),
    },
  }),
  ...(withShadow && {
    boxShadow: theme.shadows[3],
  }),
  ...(withBorder && {
    border: `1px solid ${theme.palette.divider}`,
  }),
  ...(!withShadow && !withBorder && {
    boxShadow: 'none',
  }),
}));

/**
 * ��Ƭ���
 * 
 * ͳһ��ʽ�Ŀ�Ƭ�����֧�ֲ�ͬ�ߴ����ʽ
 * 
 * @example
 * ```tsx
 * <Card title="��Ƭ����">
 *   ��Ƭ����
 * </Card>
 * <Card 
 *   title="�������Ŀ�Ƭ" 
 *   actions={[<RefreshIcon />, <MoreVertIcon />]}
 *   footerActions={<Button>ȷ��</Button>}
 * >
 *   ��Ƭ����
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  subTitleIcon,
  cardSize = CardSize.MEDIUM,
  withShadow = true,
  withBorder = false,
  withPadding = true,
  actions = [],
  footerActions,
  headerIcon,
  onTitleIconClick,
  headerStyle,
  contentStyle,
  footerStyle,
  children,
  ...rest
}) => {
  // ����������
  const handleTitleIconClick = () => {
    if (onTitleIconClick) {
      onTitleIconClick();
    }
  };

  // ��Ⱦͷ��������ť
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;
    
    return actions.map((action, index) => (
      <IconButton key={index} size="small">
        {action}
      </IconButton>
    ));
  };

  return (
    <StyledCard
      cardSize={cardSize}
      withShadow={withShadow}
      withBorder={withBorder}
      withPadding={withPadding}
      {...rest}
    >
      {(title || subTitleIcon || actions.length > 0 || headerIcon) && (
        <CardHeader
          title={
            title && (
              <Typography
                variant={cardSize === CardSize.SMALL ? 'subtitle1' : 'h6'}
                component="div"
                sx={{ cursor: onTitleIconClick ? 'pointer' : 'default' }}
                onClick={handleTitleIconClick}
              >
                {title}
              </Typography>
            )
          }
          subheader={subTitleIcon}
          action={
            <>
              {renderActions()}
              {headerIcon && <IconButton size="small">{headerIcon}</IconButton>}
            </>
          }
          style={headerStyle}
        />
      )}
      <CardContent style={{ flexGrow: 1, ...contentStyle }}>
        {children}
      </CardContent>
      {footerActions && (
        <CardActions style={footerStyle}>
          {footerActions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card;
