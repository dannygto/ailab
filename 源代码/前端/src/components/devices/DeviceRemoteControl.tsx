import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import { PlayArrowIcon, StopIcon, PauseIcon, SettingsIcon, PowerSettingsNewIcon, SpeedIcon, ThermostatAutoIcon, WaterDropIcon, ElectricBoltIcon, RefreshIcon } from '../../utils/icons';
import { toast } from 'react-hot-toast';

import { Device } from '../../types/devices';

/**
 * �豸Զ�̿������
 * 
 * ? ��ʵ�ֹ���:
 * - �豸�������ƣ�������ֹͣ����ͣ��
 * - ����ʵʱ���ڣ��¶ȡ��ٶȡ����ʵȣ�
 * - �豸״̬ʵʱ���
 * - ����������ʷ��¼
 * - ��ȫȷ�ϻ���
 * - �������ͷ���
 * 
 * ?? �����ƹ���:
 * - �����豸�ĸ߼�����
 * - �����豸����
 * - ��ʱ��������
 * - ����Ȩ�޹���
 */

// ��չDevice������֧��Զ�̿���
interface LocalExtendedDevice extends Omit<Device, 'status'> {
  status?: 'running' | 'idle' | 'error' | 'maintenance';
  parameters?: {
    temperature?: number;
    SpeedIcon?: number;
    power?: number;
    humidity?: number;
    voltage?: number;
    [key: string]: any;
  };
}

interface DeviceControlProps {
  device: LocalExtendedDevice;
  onDeviceUpdate?: (device: LocalExtendedDevice) => void;
}

interface ControlCommand {
  id: string;
  action: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed';
  result?: string;
}

const DeviceRemoteControl: React.FC<DeviceControlProps> = ({
  device,
  onDeviceUpdate
}) => {
  const [controlParameters, setControlParameters] = useState({
    temperature: device.parameters?.temperature || 25,
    SpeedIcon: device.parameters?.SpeedIcon || 0,
    power: device.parameters?.power || 0,
    humidity: device.parameters?.humidity || 50,
    voltage: device.parameters?.voltage || 0
  });

  const [isControlling, setIsControlling] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    action: '',
    message: '',
    onConfirm: () => {}
  });

  const [commandHistory, setCommandHistory] = useState<ControlCommand[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // ģ��ʵʱ��������
  useEffect(() => {
    if (device.status === 'running') {
      const interval = setInterval(() => {
        setControlParameters(prev => ({
          ...prev,
          temperature: prev.temperature + (Math.random() - 0.5) * 2,
          SpeedIcon: Math.max(0, prev.SpeedIcon + (Math.random() - 0.5) * 5),
          power: Math.max(0, prev.power + (Math.random() - 0.5) * 10)
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [device.status]);

  const sendControlCommand = async (
    action: string, 
    parameters?: Record<string, any>
  ): Promise<boolean> => {
    setIsControlling(true);
    
    const command: ControlCommand = {
      id: Date.now().toString(),
      action,
      parameters,
      timestamp: new Date(),
      status: 'pending'
    };

    setCommandHistory(prev => [command, ...prev.slice(0, 9)]);

    try {
      // ģ��api����
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ʵ����Ŀ�е��ú��api
      // const response = await apiService.controlDevice(device.id, action, parameters);
      
      // ģ��ɹ���Ӧ
      const updatedCommand = {
        ...command,
        status: 'success' as const,
        result: `${action} executed successfully`
      };

      setCommandHistory(prev => 
        prev.map(cmd => cmd.id === command.id ? updatedCommand : cmd)
      );

      // �����豸״̬
      const updatedDevice = {
        ...device,
        status: action === 'start' ? 'running' : action === 'stop' ? 'idle' : device.status,
        parameters: { ...device.parameters, ...parameters }
      };

      onDeviceUpdate?.(updatedDevice);
      toast.success(`�豸${action}����ִ�гɹ�`);
      
      return true;
    } catch (error) {
      const failedCommand = {
        ...command,
        status: 'failed' as const,
        result: 'Command execution failed'
      };

      setCommandHistory(prev => 
        prev.map(cmd => cmd.id === command.id ? failedCommand : cmd)
      );

      toast.error(`�豸����ʧ��: ${error}`);
      return false;
    } finally {
      setIsControlling(false);
    }
  };

  const handleStart = () => {
    setConfirmDialog({
      open: true,
      action: '�����豸',
      message: 'ȷ��Ҫ�������豸��',
      onConfirm: () => {
        sendControlCommand('start');
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleStopIcon = () => {
    setConfirmDialog({
      open: true,
      action: 'ֹͣ�豸',
      message: 'ȷ��Ҫֹͣ���豸���⽫�жϵ�ǰ���е�����',
      onConfirm: () => {
        sendControlCommand('stop');
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handlePauseIcon = () => {
    sendControlCommand('pause');
  };

  const handleParameterChange = async (
    parameter: string, 
    value: number
  ) => {
    setControlParameters(prev => ({ ...prev, [parameter]: value }));
    
    // �ӳٷ��Ͳ����������������
    if (device.status === 'running') {
      await sendControlCommand('updateParameter', { [parameter]: value });
    }
  };

  const handleEmergencyStopIcon = () => {
    setConfirmDialog({
      open: true,
      action: '����ֹͣ',
      message: '?? ����ֹͣ�������ж����в���������������ݶ�ʧ��ȷ��������',
      onConfirm: () => {
        sendControlCommand('emergencyStopIcon');
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const RefreshIconConnection = async () => {
    setIsControlling(true);
    try {
      // ģ�����Ӽ��
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      toast.success('�豸��������');
    } catch (error) {
      setIsConnected(false);
      toast.error('�豸����ʧ��');
    } finally {
      setIsControlling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'idle': return 'default';
      case 'error': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getCommandStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* �豸״̬��������Ϣ */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{device.name} Զ�̿���</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={device.status}
                color={getStatusColor(device.status || 'unknown')}
                size="small"
              />
              <Chip
                label={isConnected ? '������' : '���ӶϿ�'}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
              <IconButton
                onClick={RefreshIconConnection}
                disabled={isControlling}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {!isConnected && (
            <Alert severity="error" sx={{ mb: 2 }}>
              �豸�����ѶϿ����޷�����Զ�̿���
            </Alert>
          )}

          {isControlling && (
            <LinearProgress sx={{ mb: 2 }} />
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* ������������ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>��������</Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStart}
                  disabled={device.status === 'running' || !isConnected || isControlling}
                  color="success"
                >
                  ����
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PauseIcon />}
                  onClick={handlePauseIcon}
                  disabled={device.status !== 'running' || !isConnected || isControlling}
                  color="warning"
                >
                  ��ͣ
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  onClick={handleStopIcon}
                  disabled={device.status === 'idle' || !isConnected || isControlling}
                  color="error"
                >
                  ֹͣ
                </Button>
              </Box>

              <Button
                variant="outlined"
                startIcon={<PowerSettingsNewIcon />}
                onClick={handleEmergencyStopIcon}
                disabled={!isConnected || isControlling}
                color="error"
                fullWidth
                size="small"
              >
                ����ֹͣ
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ������������ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">��������</Typography>
                <IconButton
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                >
                  <SettingsIcon />
                </IconButton>
              </Box>

              {/* �¶ȿ��� */}
              {(device.type as string) === 'heater' || (device.type as string) === 'incubator' ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ThermostatAutoIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">
                      �¶�: {controlParameters.temperature.toFixed(1)}��C
                    </Typography>
                  </Box>
                  <Slider
                    value={controlParameters.temperature}
                    onChange={(_, value) => handleParameterChange('temperature', value as number)}
                    min={0}
                    max={100}
                    step={0.5}
                    disabled={!isConnected || isControlling}
                    marks={[
                      { value: 0, label: '0��C' },
                      { value: 37, label: '37��C' },
                      { value: 100, label: '100��C' }
                    ]}
                  />
                </Box>
              ) : null}

              {/* �ٶȿ��� */}
              {(device.type as string) === 'centrifuge' || (device.type as string) === 'mixer' ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SpeedIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">
                      �ٶ�: {controlParameters.SpeedIcon.toFixed(0)} RPM
                    </Typography>
                  </Box>
                  <Slider
                    value={controlParameters.SpeedIcon}
                    onChange={(_, value) => handleParameterChange('SpeedIcon', value as number)}
                    min={0}
                    max={10000}
                    step={100}
                    disabled={!isConnected || isControlling}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 5000, label: '5K' },
                      { value: 10000, label: '10K' }
                    ]}
                  />
                </Box>
              ) : null}

              {/* ���ʿ��� */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ElectricBoltIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    ����: {controlParameters.power.toFixed(0)}W
                  </Typography>
                </Box>
                <Slider
                  value={controlParameters.power}
                  onChange={(_, value) => handleParameterChange('power', value as number)}
                  min={0}
                  max={1000}
                  step={10}
                  disabled={!isConnected || isControlling}
                  marks={[
                    { value: 0, label: '0W' },
                    { value: 500, label: '500W' },
                    { value: 1000, label: '1000W' }
                  ]}
                />
              </Box>

              {/* �߼����� */}
              {showAdvancedControls && (
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>�߼�����</Typography>
                  
                  {(device.type as string) === 'incubator' && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WaterDropIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          ʪ��: {controlParameters.humidity.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Slider
                        value={controlParameters.humidity}
                        onChange={(_, value) => handleParameterChange('humidity', value as number)}
                        min={0}
                        max={100}
                        step={1}
                        disabled={!isConnected || isControlling}
                        size="small"
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={device.status === 'running'}
                        disabled={!isConnected || isControlling}
                      />
                    }
                    label="�Զ�ģʽ"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ������ʷ */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>����������ʷ</Typography>
              
              {commandHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  ���޿��������¼
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {commandHistory.map((command) => (
                    <Box
                      key={command.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          {command.action}
                          {command.parameters && (
                            <span style={{ color: 'gray' }}>
                              {' '}({Object.entries(command.parameters).map(([key, value]) => 
                                `${key}: ${value}`
                              ).join(', ')})
                            </span>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {command.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={command.status}
                        color={getCommandStatusColor(command.status)}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ȷ�϶Ի��� */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.action}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            ȡ��
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
          >
            ȷ��
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceRemoteControl;


