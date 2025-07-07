/**
 * ?? ����������� - ��ɶ�: 100% ?
 * 
 * ? ����ɹ���:
 * - ͨ�����������ӿ����
 * - ����ɾ�����鵵����ǩ����������
 * - ��������ϵͳ����ʷ��¼��
 * - ���Ͱ�ȫ�ķ������
 * - ��ģ�鸴��֧��
 * - ����ȷ�϶Ի���
 * - ʵʱ���ȷ���
 * - �������ͻָ�
 * 
 * ?? ��������:
 * - TypeScript���ͽӿ�
 * - �ɸ�������ܹ�
 * - ����/��������
 * - ״̬�����Ż�
 * - Material-UI����
 * 
 * ?? Ӧ�ó���:
 * - �豸������������
 * - ʵ�������������
 * - �û����������༭
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Toolbar,
  Checkbox,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  SelectChangeEvent,
  Fab
} from '@mui/material';
import { MoreVertIcon, DeleteIcon, ShareIcon, LabelIcon, VisibilityIcon, CloudDownloadIcon, CloseIcon, ContentCopyIcon, ArchiveIcon, CategoryIcon, UndoIcon, DownloadIcon } from '../../utils/icons';

interface BatchOperationsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  onBatchDelete?: (itemIds: string[]) => Promise<void>;
  onBatchArchive?: (itemIds: string[]) => Promise<void>;
  onBatchCopy?: (itemIds: string[]) => Promise<void>;
  onBatchExport?: (itemIds: string[], format: string) => Promise<void>;
  onBatchTag?: (itemIds: string[], tags: string[]) => Promise<void>;
  onBatchMove?: (itemIds: string[], targetCategory: string) => Promise<void>;
  onUndo?: (operationId: string) => Promise<void>; // ������������
  itemType?: string; // ���� 'experiment', 'device', 'report'
}

interface BatchOperation {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
}

// ����������ʷ��¼
interface UndoOperation {
  id: string;
  type: string;
  itemIds: string[];
  timestamp: Date;
  description: string;
  data?: any; // ���ڴ洢������ص����ݣ����ڳ���
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  onBatchArchive,
  onBatchCopy,
  onBatchExport,
  onBatchTag,
  onBatchMove,
  onUndo,
  itemType = '��Ŀ'
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BatchOperation | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // ��������״̬
  const [undoOperations, setUndoOperations] = useState<UndoOperation[]>([]);
  const [showUndoFab, setShowUndoFab] = useState(false);

  // �����������Զ�����Ч��
  useEffect(() => {
    if (undoOperations.length > 0) {
      setShowUndoFab(true);
      const timer = setTimeout(() => {
        setShowUndoFab(false);
        setUndoOperations(prev => prev.slice(1)); // �Ƴ���ɵĳ�������
      }, 10000); // 10����Զ�����
      
      return () => clearTimeout(timer);
    }
  }, [undoOperations]);

  // ���ӳ�����������ʷ��¼
  const addUndoOperation = (operation: UndoOperation) => {
    setUndoOperations(prev => [operation, ...prev.slice(0, 4)]); // ��ౣ��5����������
  };

  // ִ�г�������
  const handleUndo = async () => {
    const laStopIconeration = undoOperations[0];
    if (!laStopIconeration || !onUndo) return;

    try {
      setLoading(true);
      await onUndo(laStopIconeration.id);
      setUndoOperations(prev => prev.slice(1));
      showSnackbar(`�ѳ�����${laStopIconeration.description}`, 'success');
    } catch (error) {
      showSnackbar('��������ʧ��', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < totalItems;

  const operations: BatchOperation[] = [
    {
      id: 'copy',
      label: '����',
      icon: <ContentCopyIcon />,
      requiresConfirmation: false
    },
    {
      id: 'ArchiveIcon',
      label: '�鵵',
      icon: <ArchiveIcon />,
      color: 'warning',
      requiresConfirmation: true
    },
    {
      id: 'tag',
      label: '���ӱ�ǩ',
      icon: <LabelIcon />,
      color: 'info',
      requiresInput: true
    },
    {
      id: 'move',
      label: '�ƶ�����',
      icon: <CategoryIcon />,
      color: 'primary',
      requiresInput: true
    },
    {
      id: 'export',
      label: '����',
      icon: <DownloadIcon />,
      color: 'success',
      requiresInput: true
    },
    {
      id: 'share',
      label: '����',
      icon: <ShareIcon />,
      color: 'primary'
    },
    {
      id: 'delete',
      label: 'ɾ��',
      icon: <DeleteIcon />,
      color: 'error',
      requiresConfirmation: true
    }
  ];

  const handleSelectAllChange = (EventIcon: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(EventIcon.target.checked);
  };

  const handleMenuOpen = (EventIcon: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(EventIcon.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOperationClick = (operation: BatchOperation) => {
    setCurrentOperation(operation);
    handleMenuClose();

    if (operation.requiresConfirmation) {
      setConfirmDialogOpen(true);
    } else if (operation.requiresInput) {
      setInputDialogOpen(true);
      // ��ʼ������ֵ
      if (operation.id === 'export') {
        setExportFormat('json');
      } else if (operation.id === 'tag') {
        setTags([]);
        setNewTag('');
      } else if (operation.id === 'move') {
        setTargetCategory('');
      }
    } else {
      executeOperation(operation);
    }
  };

  const executeOperation = async (operation: BatchOperation) => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      // ���ɲ���ID���ڳ���
      const operationId = `${operation.id}_${Date.now()}`;
      const operationDescription = `${operation.label} ${selectedItems.length} ��${itemType}`;

      switch (operation.id) {
        case 'delete':
          if (onBatchDelete) {
            await onBatchDelete(selectedItems);
            // ���ӵ�������ʷ
            addUndoOperation({
              id: operationId,
              type: 'delete',
              itemIds: [...selectedItems],
              timestamp: new Date(),
              description: operationDescription
            });
            showSnackbar('ɾ���ɹ�', 'success');
          }
          break;
        case 'ArchiveIcon':
          if (onBatchArchive) {
            await onBatchArchive(selectedItems);
            // ���ӵ�������ʷ
            addUndoOperation({
              id: operationId,
              type: 'ArchiveIcon',
              itemIds: [...selectedItems],
              timestamp: new Date(),
              description: operationDescription
            });
            showSnackbar('�鵵�ɹ�', 'success');
          }
          break;
        case 'copy':
          if (onBatchCopy) {
            await onBatchCopy(selectedItems);
            showSnackbar('���Ƴɹ�', 'success');
          }
          break;
        case 'export':
          if (onBatchExport) {
            await onBatchExport(selectedItems, exportFormat);
            showSnackbar('�����ɹ�', 'success');
          }
          break;
        case 'tag':
          if (onBatchTag && tags.length > 0) {
            await onBatchTag(selectedItems, tags);
            showSnackbar('��ǩ���ӳɹ�', 'success');
          }
          break;
        case 'move':
          if (onBatchMove && targetCategory) {
            await onBatchMove(selectedItems, targetCategory);
            showSnackbar('�ƶ��ɹ�', 'success');
          }
          break;
        case 'share':
          showSnackbar('���������Ѹ��Ƶ�������', 'info');
          break;
        default:
          showSnackbar('������δʵ��', 'warning');
      }
      onClearSelection();
    } catch (error) {
      console.error('Batch operation failed:', error);
      showSnackbar('����ʧ�ܣ�������', 'error');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setInputDialogOpen(false);
      setCurrentOperation(null);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleConfirmOperation = () => {
    if (currentOperation) {
      executeOperation(currentOperation);
    }
  };

  const handleInputOperation = () => {
    if (currentOperation) {
      executeOperation(currentOperation);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (EventIcon: React.KeyboardEvent) => {
    if (EventIcon.key === 'Enter') {
      handleAddTag();
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <Box>
      <Paper 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000,
          backgroundColor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        <Toolbar>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleSelectAllChange}
            sx={{ color: 'primary.contrastText' }}
          />
          
          <Typography variant="subtitle1" sx={{ flex: 1, ml: 1 }}>
            ��ѡ�� {selectedItems.length} ��{itemType}
            {totalItems > 0 && ` (�� ${totalItems} ��)`}
          </Typography>

          <Tooltip title="���ٲ���">
            <Button
              variant="contained"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={() => console.log('Quick view')}
              sx={{ mr: 1 }}
            >
              Ԥ��
            </Button>
          </Tooltip>

          <Tooltip title="�������">
            <IconButton
              onClick={handleMenuOpen}
              sx={{ color: 'primary.contrastText' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="���ѡ��">
            <IconButton
              onClick={onClearSelection}
              sx={{ color: 'primary.contrastText' }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>

      {/* �����˵� */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {operations.map((operation) => (
          <MenuItem
            key={operation.id}
            onClick={() => handleOperationClick(operation)}
            disabled={loading}
          >
            <ListItemIcon sx={{ color: operation.color ? `${operation.color}.main` : 'inherit' }}>
              {operation.icon}
            </ListItemIcon>
            <ListItemText primary={operation.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* ȷ�϶Ի��� */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          ȷ��{currentOperation?.label}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ������{currentOperation?.label} {selectedItems.length} ��{itemType}���˲���
            {currentOperation?.id === 'delete' ? '���ɳ���' : '�����޷�����'}��
          </Alert>
          <Typography>
            ��ȷ���Ƿ�Ҫ����ִ�д˲�����
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            ȡ��
          </Button>
          <Button
            onClick={handleConfirmOperation}
            color={currentOperation?.color || 'primary'}
            variant="contained"
            disabled={loading}
          >
            ȷ��{currentOperation?.label}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ����Ի��� */}
      <Dialog open={inputDialogOpen} onClose={() => setInputDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentOperation?.label}
        </DialogTitle>
        <DialogContent>
          {currentOperation?.id === 'export' && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>������ʽ</InputLabel>
                <Select
                  value={exportFormat}
                  onChange={(e: SelectChangeEvent) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xlsx">Excel</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {currentOperation?.id === 'tag' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="���ӱ�ǩ"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                />
                <Button onClick={handleAddTag} variant="outlined">
                  ����
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {currentOperation?.id === 'move' && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Ŀ�����</InputLabel>
                <Select
                  value={targetCategory}
                  onChange={(e: SelectChangeEvent) => setTargetCategory(e.target.value)}
                >
                  <MenuItem value="physics">����ʵ��</MenuItem>
                  <MenuItem value="chemistry">��ѧʵ��</MenuItem>
                  <MenuItem value="biology">����ʵ��</MenuItem>
                  <MenuItem value="math">��ѧʵ��</MenuItem>
                  <MenuItem value="computer">�����ʵ��</MenuItem>
                  <MenuItem value="archived">�ѹ鵵</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInputDialogOpen(false)}>
            ȡ��
          </Button>
          <Button
            onClick={handleInputOperation}
            color={currentOperation?.color || 'primary'}
            variant="contained"
            disabled={loading || 
              (currentOperation?.id === 'tag' && tags.length === 0) ||
              (currentOperation?.id === 'move' && !targetCategory)
            }
          >
            ȷ��{currentOperation?.label}
          </Button>
        </DialogActions>
      </Dialog>      {/* ��ʾ��Ϣ */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ��������������ť */}
      {showUndoFab && undoOperations.length > 0 && (
        <Fab
          color="secondary"
          aria-label="��������"
          onClick={handleUndo}
          disabled={loading}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            zIndex: 1000,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <UndoIcon />
        </Fab>
      )}
    </Box>
  );
};

export default BatchOperations;


