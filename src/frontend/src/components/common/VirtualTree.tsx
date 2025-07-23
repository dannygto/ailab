import React, { useState, useEffect, useCallback, useMemo, CSSProperties } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VirtualList from './VirtualList';
import { useComponentPerformance } from '../../utils/performanceMonitoring';

// 树节点接口
export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  metadata?: Record<string, any>;
  parent?: string;
  path?: string;
  [key: string]: any;
}

// 扁平化树节点接口（用于虚拟列表渲染）
export interface FlatTreeNode extends TreeNode {
  level: number;
  expanded: boolean;
  visible: boolean;
  childrenLoaded: boolean;
  childrenCount: number;
  isLoading: boolean;
  isFiltered: boolean;
}

// 虚拟树属性接口
interface VirtualTreeProps {
  /**
   * 根节点数据
   */
  data: TreeNode[];

  /**
   * 节点点击事件
   */
  onNodeClick?: (node: TreeNode) => void;

  /**
   * 节点展开/折叠事件
   */
  onNodeToggle?: (node: TreeNode, expanded: boolean) => void;

  /**
   * 节点选中事件
   */
  onNodeSelect?: (node: TreeNode, selected: boolean) => void;

  /**
   * 默认展开的节点ID列表
   */
  defaultExpandedIds?: string[];

  /**
   * 默认选中的节点ID列表
   */
  defaultSelectedIds?: string[];

  /**
   * 是否显示复选框
   */
  showCheckbox?: boolean;

  /**
   * 是否显示图标
   */
  showIcon?: boolean;

  /**
   * 是否显示搜索框
   */
  showSearch?: boolean;

  /**
   * 组件高度
   */
  height?: number | string;

  /**
   * 每个节点的高度
   */
  itemHeight?: number;

  /**
   * 加载子节点的函数
   */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;

  /**
   * 是否懒加载子节点
   */
  lazyLoad?: boolean;

  /**
   * 是否显示加载中状态
   */
  loading?: boolean;

  /**
   * 树标题
   */
  title?: string;

  /**
   * 搜索占位文本
   */
  searchPlaceholder?: string;

  /**
   * 空树时显示的内容
   */
  emptyContent?: React.ReactNode;

  /**
   * 渲染自定义节点图标
   */
  renderIcon?: (node: TreeNode) => React.ReactNode;

  /**
   * 渲染自定义节点内容
   */
  renderNode?: (node: TreeNode, toggleExpand: () => void, toggleSelect: () => void) => React.ReactNode;

  /**
   * 容器样式
   */
  containerStyle?: CSSProperties;
}

/**
 * 虚拟树组件
 *
 * 基于虚拟列表的高性能树组件，适用于大型层级数据
 */
const VirtualTree: React.FC<VirtualTreeProps> = ({
  data,
  onNodeClick,
  onNodeToggle,
  onNodeSelect,
  defaultExpandedIds = [],
  defaultSelectedIds = [],
  showCheckbox = false,
  showIcon = true,
  showSearch = true,
  height = 400,
  itemHeight = 40,
  loadChildren,
  lazyLoad = false,
  loading = false,
  title,
  searchPlaceholder = '搜索...',
  emptyContent = <Typography align="center">没有数据</Typography>,
  renderIcon,
  renderNode,
  containerStyle
}) => {
  // 使用性能监控
  useComponentPerformance('VirtualTree');

  // 状态管理
  const [flattenedData, setFlattenedData] = useState<FlatTreeNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(defaultSelectedIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingNodeIds, setLoadingNodeIds] = useState<Set<string>>(new Set());

  // 扁平化树结构
  const flattenTree = useCallback((
    nodes: TreeNode[],
    level = 0,
    parentExpanded = true,
    parentPath = '',
    filteredNodes?: Set<string>
  ): FlatTreeNode[] => {
    let result: FlatTreeNode[] = [];

    nodes.forEach(node => {
      const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
      const isExpanded = expandedIds.has(node.id);
      const isVisible = level === 0 || parentExpanded;
      const isFiltered = !!filteredNodes && filteredNodes.has(node.id);

      // 创建扁平节点
      const flatNode: FlatTreeNode = {
        ...node,
        level,
        expanded: isExpanded,
        visible: isVisible,
        path: nodePath,
        childrenLoaded: !lazyLoad || !!node.children,
        childrenCount: node.children?.length || 0,
        isLoading: loadingNodeIds.has(node.id),
        isFiltered
      };

      if (isVisible || isFiltered) {
        result.push(flatNode);
      }

      // 递归处理子节点
      if (node.children && (isExpanded || isFiltered)) {
        const childNodes = flattenTree(
          node.children,
          level + 1,
          isExpanded && isVisible,
          nodePath,
          filteredNodes
        );
        result = result.concat(childNodes);
      }
    });

    return result;
  }, [expandedIds, loadingNodeIds, lazyLoad]);

  // 初始化树结构
  useEffect(() => {
    const flattened = flattenTree(data);
    setFlattenedData(flattened);
  }, [data, flattenTree]);

  // 搜索更新
  useEffect(() => {
    if (!searchTerm) {
      setFlattenedData(flattenTree(data));
      return;
    }

    // 搜索匹配节点
    const matchedNodeIds = new Set<string>();
    const lowerSearchTerm = searchTerm.toLowerCase();

    const searchInNode = (node: TreeNode): boolean => {
      const nameMatch = node.name.toLowerCase().includes(lowerSearchTerm);

      if (nameMatch) {
        matchedNodeIds.add(node.id);
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (searchInNode(child)) {
            matchedNodeIds.add(node.id); // 父节点也要匹配
            return true;
          }
        }
      }

      return false;
    };

    // 搜索所有根节点
    data.forEach(searchInNode);

    setFlattenedData(flattenTree(data, 0, true, '', matchedNodeIds));
  }, [searchTerm, data, flattenTree]);

  // 处理节点展开/折叠
  const handleToggleExpand = useCallback(async (node: FlatTreeNode) => {
    const newExpandedIds = new Set(expandedIds);

    if (newExpandedIds.has(node.id)) {
      newExpandedIds.delete(node.id);
    } else {
      newExpandedIds.add(node.id);

      // 懒加载子节点
      if (lazyLoad && !node.childrenLoaded && loadChildren) {
        setLoadingNodeIds(prev => new Set(prev).add(node.id));

        try {
          const children = await loadChildren(node);

          // 更新原始数据中的子节点
          const updateNodeChildren = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(n => {
              if (n.id === node.id) {
                return { ...n, children };
              } else if (n.children) {
                return { ...n, children: updateNodeChildren(n.children) };
              }
              return n;
            });
          };

          // 更新数据
          const updatedData = updateNodeChildren(data);
          setFlattenedData(flattenTree(updatedData));
        } catch (error) {
          console.error('加载子节点出错:', error);
        } finally {
          setLoadingNodeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(node.id);
            return newSet;
          });
        }
      }
    }

    setExpandedIds(newExpandedIds);

    if (onNodeToggle) {
      onNodeToggle(node, !newExpandedIds.has(node.id));
    }
  }, [expandedIds, lazyLoad, loadChildren, data, flattenTree, onNodeToggle]);

  // 处理节点选中
  const handleToggleSelect = useCallback((node: FlatTreeNode) => {
    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(node.id)) {
      newSelectedIds.delete(node.id);
    } else {
      newSelectedIds.add(node.id);
    }

    setSelectedIds(newSelectedIds);

    if (onNodeSelect) {
      onNodeSelect(node, newSelectedIds.has(node.id));
    }
  }, [selectedIds, onNodeSelect]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: FlatTreeNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  // 获取可见节点
  const visibleNodes = useMemo(() => {
    return flattenedData.filter(node => node.visible || node.isFiltered);
  }, [flattenedData]);

  // 渲染树节点
  const renderTreeNode = useCallback((node: FlatTreeNode, index: number, style: CSSProperties) => {
    const isSelected = selectedIds.has(node.id);
    const isExpanded = node.expanded;
    const isLoading = node.isLoading;
    const hasChildren = (node.children && node.children.length > 0) || (lazyLoad && node.type === 'folder');

    // 获取缩进样式
    const getIndentStyle = (level: number): CSSProperties => ({
      paddingLeft: `${level * 20 + 16}px`
    });

    // 获取节点图标
    const getNodeIcon = () => {
      if (renderIcon) {
        return renderIcon(node);
      }

      if (node.type === 'folder') {
        return isExpanded ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />;
      } else {
        return <InsertDriveFileIcon color="disabled" />;
      }
    };

    // 自定义节点渲染
    if (renderNode) {
      return renderNode(
        node,
        () => handleToggleExpand(node),
        () => handleToggleSelect(node)
      );
    }

    return (
      <ListItem
        button
        dense
        style={{
          ...style,
          height: itemHeight,
          backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.04)' : undefined,
          cursor: 'pointer',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
        onClick={() => handleNodeClick(node)}
      >
        <Box display="flex" alignItems="center" width="100%" style={getIndentStyle(node.level)}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(node);
              }}
              sx={{ p: 0.5, mr: 0.5 }}
            >
              {isLoading ? (
                <CircularProgress size={16} />
              ) : isExpanded ? (
                <KeyboardArrowDownIcon fontSize="small" />
              ) : (
                <KeyboardArrowRightIcon fontSize="small" />
              )}
            </IconButton>
          )}

          {!hasChildren && (
            <Box width={28} /> // 占位
          )}

          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSelect(node);
              }}
            />
          )}

          {showIcon && (
            <ListItemIcon sx={{ minWidth: 32 }}>
              {getNodeIcon()}
            </ListItemIcon>
          )}

          <ListItemText
            primary={
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: node.isFiltered ? 'bold' : 'normal',
                  color: node.isFiltered ? 'primary.main' : 'text.primary'
                }}
              >
                {node.name}
                {node.childrenCount > 0 && (
                  <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                    ({node.childrenCount})
                  </Typography>
                )}
              </Typography>
            }
            secondary={
              node.metadata?.description && (
                <Typography variant="caption" noWrap color="text.secondary">
                  {node.metadata.description}
                </Typography>
              )
            }
            primaryTypographyProps={{ noWrap: true }}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </Box>
      </ListItem>
    );
  }, [
    selectedIds, lazyLoad, itemHeight, showCheckbox, showIcon,
    handleNodeClick, handleToggleExpand, handleToggleSelect, renderNode, renderIcon
  ]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...containerStyle
      }}
    >
      {/* 标题和搜索框 */}
      {(title || showSearch) && (
        <Box p={2}>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}

          {showSearch && (
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          )}
        </Box>
      )}

      <Divider />

      {/* 树内容 */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <VirtualList
          items={visibleNodes}
          renderItem={renderTreeNode}
          itemHeight={itemHeight}
          height={typeof height === 'number' ? height - (title || showSearch ? 80 : 0) : height}
          loading={loading}
          emptyContent={emptyContent}
          getItemKey={(node) => node.id}
          containerStyle={{ boxShadow: 'none' }}
        />
      </Box>
    </Paper>
  );
};

export default VirtualTree;
