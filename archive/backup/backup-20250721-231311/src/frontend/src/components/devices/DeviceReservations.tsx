import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  LinearProgress,
  SelectChangeEvent
} from '@mui/material';
import { AddIcon, DeleteIcon, WarningIcon, AccountCircleIcon, InfoIcon, BlockIcon } from '../../utils/icons';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { DeviceReservation, Device, CreateDeviceReservationParams } from '../../types/devices';
import api from '../../services/api';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

interface DeviceReservationsProps {
  devices: Device[];
  reservations: DeviceReservation[];
  onReservationCreated?: () => void;
  onReservationDeleted?: (id: string) => void;
}

// 时间冲突检测帮助函数
const CheckIconTimeConflict = (
  startTime: Date | null, 
  endTime: Date | null, 
  existingReservations: DeviceReservation[],
  deviceId: string,
  excludeReservationId?: string
): boolean => {
  if (!startTime || !endTime || !deviceId) return false;
  
  // 仅检查所选设备的预约
  const deviceReservations = existingReservations.filter(
    r => r.deviceId === deviceId && r.id !== excludeReservationId
  );
  
  // 检查是否与任何现有预约重叠
  return deviceReservations.some(reservation => {
    const reservationStart = new Date(reservation.startTime);
    const reservationEnd = new Date(reservation.endTime);
    
    // 检查重叠情况：
    // 1. 新预约开始时间在已有预约时间范围内
    // 2. 新预约结束时间在已有预约时间范围内
    // 3. 新预约完全包含已有预约
    return (
      (startTime >= reservationStart && startTime < reservationEnd) ||
      (endTime > reservationStart && endTime <= reservationEnd) ||
      (startTime <= reservationStart && endTime >= reservationEnd)
    );
  });
};

const DeviceReservations: React.FC<DeviceReservationsProps> = ({ devices, reservations, onReservationCreated, onReservationDeleted }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [purpose, setPurpose] = useState('');
  const [title, setTitleIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeConflict, setTimeConflict] = useState(false);
  const [filteredReservations, setFilteredReservations] = useState<DeviceReservation[]>(reservations);
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 过滤设备
  const filtereddevices = Array.isArray(devices) ? devices.filter(device => true) : [];

  // 应用过滤器
  const applyFilters = useCallback(() => {
    let filtered = [...reservations];
    
    // 按设备过滤
    if (deviceFilter !== 'all') {
      filtered = filtered.filter(r => r.deviceId === deviceFilter);
    }
    
    // 按状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // 按时间排序
    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    setFilteredReservations(filtered);
  }, [deviceFilter, statusFilter, reservations]);

  // 当外部传入的reservations变化时更新过滤后的预约
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 处理设备筛选变化
  const handleDeviceFilterChange = (Event: SelectChangeEvent<string>) => {
    setDeviceFilter(Event.target.value);
  };

  // 处理状态筛选变化
  const handleStatusFilterChange = (Event: SelectChangeEvent<string>) => {
    setStatusFilter(Event.target.value);
  };

  const handleChangePage = (Event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(Event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpen(true);
    // 重置表单状态
    setError(null);
    setTimeConflict(false);
  };

  const handleClose = () => {
    setOpen(false);
    // 重置表单
    resetForm();
  };

  const resetForm = () => {
    setSelectedDevice('');
    setStartTime(new Date());
    setEndTime(new Date(new Date().getTime() + 60 * 60 * 1000));
    setPurpose('');
    setTitleIcon('');
    setError(null);
    setTimeConflict(false);
  };

  // 检查表单是否有效
  const isFormValid = () => {
    return (
      selectedDevice &&
      startTime &&
      endTime &&
      title.trim() !== '' &&
      purpose.trim() !== '' &&
      !timeConflict &&
      startTime < endTime
    );
  };

  // 检查时间冲突
  const CheckIconConflict = useCallback(() => {
    if (startTime && endTime && selectedDevice) {
      const hasConflict = CheckIconTimeConflict(startTime, endTime, reservations, selectedDevice);
      setTimeConflict(hasConflict);
    }
  }, [startTime, endTime, selectedDevice, reservations]);

  // 当开始时间、结束时间或选择的设备改变时，检查冲突
  useEffect(() => {
    CheckIconConflict();
  }, [CheckIconConflict]);

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 创建预约参数
      const reservationParams: CreateDeviceReservationParams = {
        deviceId: selectedDevice,
        userId: 'current-user', // 实际应用中应该使用当前登录用户的ID
        title,
        purpose,
        startTime: startTime!.toISOString(),
        endTime: endTime!.toISOString()
      };
      
      // 调用api创建预约
      await api.createDeviceReservation(selectedDevice, reservationParams);
      
      // 关闭对话框
      handleClose();
      
      // 触发刷新
      if (onReservationCreated) {
        onReservationCreated();
      }
    } catch (err: any) {
      setError(err.message || '创建预约失败，请重试');
      console.error('创建预约失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 设备选择处理
  const handleDeviceChange = (Event: SelectChangeEvent<string>) => {
    setSelectedDevice(Event.target.value);
  };

  // 删除预约
  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('确定要删除这个预约吗？')) {
      try {
        // 这里应该调用api删除预约
        // await api.deleteDeviceReservation(id);
        
        // 模拟删除成功
        if (onReservationDeleted) {
          onReservationDeleted(id);
        }
      } catch (err: any) {
        console.error('删除预约失败:', err);
        alert(`删除预约失败: ${err.message}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'CancelIconled':
        return 'default';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'approved':
        return <AccountCircleIcon fontSize="small" />;
      case 'pending':
        return <InfoIcon fontSize="small" />;
      case 'rejected':
        return <BlockIcon fontSize="small" />;
      case 'CancelIconled':
        return <DeleteIcon fontSize="small" />;
      case 'completed':
        return <AccountCircleIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  // 获取设备名称
  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : '未知设备';
  };

  // 渲染筛选器
  const renderFilters = () => (
    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="device-filter-LabelIcon">按设备筛选</InputLabel>
        <Select
          labelId="device-filter-LabelIcon"
          id="device-filter"
          value={deviceFilter}
          onChange={handleDeviceFilterChange}
          label="按设备筛选"
        >
          <MenuItem value="all">所有设备</MenuItem>
          {filtereddevices.map((device) => (
            <MenuItem key={device.id} value={device.id}>{device.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-LabelIcon">按状态筛选</InputLabel>
        <Select
          labelId="status-filter-LabelIcon"
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          label="按状态筛选"
        >
          <MenuItem value="all">所有状态</MenuItem>
          <MenuItem value="pending">待审批</MenuItem>
          <MenuItem value="approved">已批准</MenuItem>
          <MenuItem value="rejected">已拒绝</MenuItem>
          <MenuItem value="CancelIconled">已取消</MenuItem>
          <MenuItem value="completed">已完成</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            设备预约管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            新建预约
          </Button>
        </Box>
        
        {renderFilters()}
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="设备预约表">
            <TableHead>
              <TableRow>
                <TableCell>设备</TableCell>
                <TableCell>预约标题</TableCell>
                <TableCell>开始时间</TableCell>
                <TableCell>结束时间</TableCell>
                <TableCell>目的</TableCell>
                <TableCell>状态</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{getDeviceName(reservation.deviceId)}</TableCell>
                    <TableCell>{reservation.title}</TableCell>
                    <TableCell>{format(new Date(reservation.startTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>{format(new Date(reservation.endTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>{reservation.purpose}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(reservation.status)}
                        label={
                          reservation.status === 'confirmed' ? '已确认' :
                          reservation.status === 'pending' ? '待审批' :
                          reservation.status === 'cancelled' ? '已取消' :
                          reservation.status === 'completed' ? '已完成' :
                          reservation.status === 'active' ? '进行中' :
                          reservation.status
                        }
                        color={getStatusColor(reservation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteReservation(reservation.id)}
                        disabled={reservation.status === 'completed'}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredReservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                      没有找到符合条件的预约记录
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredReservations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="每页行数:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count}`}
          />
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>创建新预约</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="device-select-LabelIcon">设备</InputLabel>
                  <Select
                    labelId="device-select-LabelIcon"
                    id="device-select"
                    value={selectedDevice}
                    label="设备"
                    onChange={handleDeviceChange}
                  >
                    {filtereddevices.map((device) => (
                      <MenuItem key={device.id} value={device.id} disabled={device.connectionStatus !== 'online'}>
                        {device.name}
                        {device.connectionStatus !== 'online' && ' (离线)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="title"
                  label="预约标题"
                  value={title}
                  onChange={(e) => setTitleIcon(e.target.value)}
                />
              </Grid>
                <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="开始时间"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: Boolean(timeConflict || (startTime && endTime && startTime >= endTime))
                    }
                  }}
                  disablePast
                />
              </Grid>
                <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="结束时间"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: Boolean(timeConflict || (startTime && endTime && startTime >= endTime))
                    }
                  }}
                  disablePast
                />
              </Grid>
              
              {timeConflict && (
                <Grid item xs={12}>
                  <Alert severity="warning" icon={<WarningIcon />}>
                    选择的时间段与现有预约冲突，请选择其他时间段
                  </Alert>
                </Grid>
              )}
              
              {startTime && endTime && startTime >= endTime && (
                <Grid item xs={12}>
                  <Alert severity="error" icon={<WarningIcon />}>
                    结束时间必须晚于开始时间
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="purpose"
                  label="预约目的"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {loading && <LinearProgress sx={{ width: '100%', height: 4, position: 'absolute', top: 0, left: 0 }} />}
            <Button onClick={handleClose}>取消</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={!isFormValid() || loading}
            >
              提交预约
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default DeviceReservations; 