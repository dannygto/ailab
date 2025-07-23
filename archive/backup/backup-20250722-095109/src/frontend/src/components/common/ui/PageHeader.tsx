import React from 'react';
import { Box, Typography, Link, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface BreadcrumbItem {
  /**
   * 显示的文本
   */
  label: string;

  /**
   * 链接路径，如果不提供则为非链接文本
   */
  path?: string;

  /**
   * 是否使用国际化，如果为true，则使用label作为国际化键名
   */
  useTranslation?: boolean;
}

export interface PageHeaderProps {
  /**
   * 页面标题
   */
  title: string;

  /**
   * 页面副标题
   */
  subtitle?: string;

  /**
   * 面包屑路径
   */
  breadcrumbs?: BreadcrumbItem[];

  /**
   * 标题右侧操作区域
   */
  actions?: React.ReactNode;

  /**
   * 是否使用国际化，如果为true，则使用title和subtitle作为国际化键名
   */
  useTranslation?: boolean;
}

/**
 * 页面头部组件
 *
 * 提供统一的页面标题、副标题、面包屑导航和操作区域
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  useTranslation = false,
}) => {
  const { t } = useTranslation();

  // 处理国际化文本
  const displayTitle = useTranslation ? t(title) : title;
  const displaySubtitle = subtitle ? (useTranslation ? t(subtitle) : subtitle) : '';

  return (
    <Box sx={{ mb: 3 }}>
      {/* 面包屑导航 */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const label = item.useTranslation ? t(item.label) : item.label;
            const isLast = index === breadcrumbs.length - 1;

            return item.path && !isLast ? (
              <Link
                component={RouterLink}
                to={item.path}
                key={index}
                underline="hover"
                color="inherit"
              >
                {label}
              </Link>
            ) : (
              <Typography
                key={index}
                color={isLast ? 'text.primary' : 'inherit'}
              >
                {label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      {/* 标题区域 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!displaySubtitle}>
            {displayTitle}
          </Typography>

          {displaySubtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {displaySubtitle}
            </Typography>
          )}
        </Box>

        {/* 操作区域 */}
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
