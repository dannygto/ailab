import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Button, Divider, Tooltip, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import VirtualTree, { TreeNode } from '../common/VirtualTree';
import { useComponentPerformance } from '../../utils/performanceMonitoring';

/**
 * 虚拟树演示组件
 *
 * 展示虚拟树组件的使用和性能优势
 */
const VirtualTreeDemo: React.FC = () => {
  // 使用性能监控
  useComponentPerformance('VirtualTreeDemo');

  // 状态管理
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // 生成随机树数据
  const generateMockTreeData = useCallback((depth: number, breadth: number, prefix = ''): TreeNode[] => {
    const result: TreeNode[] = [];

    if (depth <= 0) return result;

    for (let i = 0; i < breadth; i++) {
      const id = prefix ? `${prefix}-${i}` : `node-${i}`;
      const isFolder = depth > 1;

      const node: TreeNode = {
        id,
        name: isFolder ? `文件夹 ${id}` : `文件 ${id}`,
        type: isFolder ? 'folder' : 'file',
        metadata: {
          description: `这是${isFolder ? '文件夹' : '文件'} ${id} 的描述`,
          createdAt: new Date().toISOString(),
          size: isFolder ? undefined : Math.floor(Math.random() * 1000) + 'KB'
        }
      };

      if (isFolder) {
        // 递归生成子节点
        node.children = generateMockTreeData(
          depth - 1,
          Math.max(1, Math.floor(Math.random() * breadth)),
          id
        );
      }

      result.push(node);
    }

    return result;
  }, []);

  // 加载树数据
  const loadTreeData = useCallback(() => {
    setLoading(true);

    // 模拟API延迟
    setTimeout(() => {
      // 生成4层深度，每层最多5个节点的树
      const mockData = generateMockTreeData(4, 5);
      setTreeData(mockData);
      setLoading(false);

      // 默认展开第一级节点
      if (mockData.length > 0) {
        setExpandedIds([mockData[0].id]);
      }
    }, 500);
  }, [generateMockTreeData]);

  // 懒加载子节点
  const loadChildren = useCallback(async (node: TreeNode): Promise<TreeNode[]> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 生成2层深度，每层最多3个节点的树
    return generateMockTreeData(2, 3, node.id);
  }, [generateMockTreeData]);

  // 初始加载数据
  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: TreeNode) => {
    setSelectedNode(node);
  }, []);

  // 处理节点展开/折叠
  const handleNodeToggle = useCallback((node: TreeNode, expanded: boolean) => {
    setExpandedIds(prev => {
      if (expanded) {
        return [...prev, node.id];
      } else {
        return prev.filter(id => id !== node.id);
      }
    });
  }, []);

  // 处理刷新
  const handleRefresh = () => {
    setSelectedNode(null);
    loadTreeData();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">虚拟树组件演示</Typography>

        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            添加节点
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧树 */}
        <Paper
          sx={{
            width: 350,
            overflow: 'hidden',
            mr: 3,
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
          elevation={0}
        >
          <VirtualTree
            data={treeData}
            height={500}
            loading={loading}
            title="文件结构"
            showSearch={true}
            showCheckbox={false}
            onNodeClick={handleNodeClick}
            onNodeToggle={handleNodeToggle}
            defaultExpandedIds={expandedIds}
            lazyLoad={true}
            loadChildren={loadChildren}
            searchPlaceholder="搜索文件或文件夹..."
            emptyContent={
              <Box p={2} textAlign="center">
                <Typography color="text.secondary" gutterBottom>
                  没有数据
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                >
                  加载数据
                </Button>
              </Box>
            }
          />
        </Paper>

        {/* 右侧详情 */}
        <Paper
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
          elevation={0}
        >
          {selectedNode ? (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6">
                    {selectedNode.name}
                  </Typography>

                  <Tooltip title="查看详情">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box>
                  <Tooltip title="删除">
                    <IconButton color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  类型: {selectedNode.type === 'folder' ? '文件夹' : '文件'}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  描述: {selectedNode.metadata?.description || '无描述'}
                </Typography>

                {selectedNode.type === 'file' && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    大小: {selectedNode.metadata?.size || '未知'}
                  </Typography>
                )}

                {selectedNode.type === 'folder' && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    子项数量: {selectedNode.children?.length || 0}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  创建时间: {
                    selectedNode.metadata?.createdAt
                      ? new Date(selectedNode.metadata.createdAt).toLocaleString('zh-CN')
                      : '未知'
                  }
                </Typography>

                {selectedNode.path && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    路径: {selectedNode.path}
                  </Typography>
                )}
              </Box>

              {selectedNode.type === 'folder' && selectedNode.children && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    子项目
                  </Typography>

                  <Box
                    sx={{
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 1,
                      p: 2
                    }}
                  >
                    {selectedNode.children.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {selectedNode.children.map(child => (
                          <li key={child.id}>
                            <Typography variant="body2">
                              {child.name} {child.type === 'folder' && '(文件夹)'}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        没有子项目
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ height: '100%' }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                请从左侧选择一个节点查看详情
              </Typography>

              <Button
                variant="outlined"
                size="small"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                sx={{ mt: 2 }}
              >
                刷新数据
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          虚拟树组件适用于大型层级数据的展示，例如文件系统、组织结构、产品分类等。通过只渲染可见区域的节点，可以显著提高性能，即使处理数千个节点的树结构也能保持流畅的用户体验。
        </Typography>
      </Box>
    </Box>
  );
};

export default VirtualTreeDemo;
