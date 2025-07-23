import React from 'react';
import { Box, Paper, Typography, Divider, CircularProgress, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

export interface DataContainerProps {
  /**
   * 标题
   */
  title: string;

  /**
   * 数据加载状态
   */
  loading?: boolean;

  /**
   * 是否显示刷新按钮
   */
  showRefresh?: boolean;

  /**
   * 刷新按钮点击事件
   */
  onRefresh?: () => void;

  /**
   * 额外的标题操作按钮
   */
  actions?: React.ReactNode;

  /**
   * 内容组件
   */
  children: React.ReactNode;

  /**
   * 容器高度
   */
  height?: number | string;

  /**
   * 是否使用固定高度
   */
  fixedHeight?: boolean;

  /**
   * 额外的样式
   */
  sx?: any;
}

/**
 * 数据容器组件
 *
 * 提供一致的数据展示容器，包含标题、加载状态和刷新功能
 */
const DataContainer: React.FC<DataContainerProps> = ({
  title,
  loading = false,
  showRefresh = true,
  onRefresh,
  actions,
  children,
  height = 'auto',
  fixedHeight = false,
  sx = {},
}) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={1}
      sx={{
        height: fixedHeight ? height : 'auto',
        overflow: fixedHeight ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      <Box sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {loading && <CircularProgress size={24} />}
          {actions}
          {showRefresh && onRefresh && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              {t('common.refresh')}
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={{
        p: 2,
        flex: fixedHeight ? 1 : 'auto',
        overflow: 'auto',
        position: 'relative',
      }}>
        {children}
      </Box>
    </Paper>
  );
};

export default DataContainer;
