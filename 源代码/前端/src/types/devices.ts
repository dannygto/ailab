// �����豸Զ�̽���ϵͳ���Ͷ���

// �豸����ö��
export enum DeviceType {
  SENSOR = 'sensor',
  METER = 'meter',
  MICROSCOPE = 'microscope',
  SPECTROSCOPE = 'spectroscope',
  DATALOGGER = 'datalogger',
  CAMERA = 'camera',
  CONTROL_UNIT = 'control_unit',
  OTHER = 'other'
}

// �豸����״̬
export enum DeviceConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// �豸ģ�ͽӿ�
export interface Device {
  id: string;
  name: string;
  type: DeviceType | string; // �����ַ�������
  model?: string; // ���ݿ�ѡ�ֶ�
  manufacturer?: string; // ���ݿ�ѡ�ֶ�
  description?: string; // ���ݿ�ѡ�ֶ�
  connectionStatus?: DeviceConnectionStatus | 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'online' | 'offline'; // ���ݸ���״ֵ̬
  location?: string; // ���ݿ�ѡ�ֶ�
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  capabilities?: string[]; // ���ݿ�ѡ�ֶ�
  supportedProtocols?: string[]; // ���ݿ�ѡ�ֶ�
  dataFormats?: string[]; // ���ݿ�ѡ�ֶ�
  configuration?: Record<string, any>; // ���ݿ�ѡ�ֶ�
  metadata?: Record<string, any>; // ���ݿ�ѡ�ֶ�
  createdAt: string;
  updatedAt: string;
  // ����������
  CategoryIcon?: string;
  serialNumber?: string;
  status?: 'online' | 'offline' | 'maintenance' | 'error';
  specifications?: Record<string, any>;
  lastSeen?: string;
  isActive?: boolean;
}

// ��չ�豸�ӿڣ�֧��Զ�̿���
export interface ExtendedDevice extends Omit<Device, 'status'> {
  status?: 'running' | 'idle' | 'error' | 'maintenance' | 'online' | 'offline'; // ��չ״̬�������ͻ
  parameters?: {
    temperature?: number;
    SpeedIcon?: number;
    power?: number;
    humidity?: number;
    voltage?: number;
    [key: string]: any;
  };
}

// �豸���ݵ�ӿ�
export interface DeviceDataPoint {
  id?: string;
  deviceId?: string;
  timestamp: Date | string;
  sensortype?: string;
  value?: number | string | boolean;
  unit?: string;
  quality?: number; // 0-100, ��������ָ��
  metadata?: Record<string, any>;
  
  // ��չ�������ֶΣ�����ͼ����ʾ
  temperature?: number;
  humidity?: number;
  pressure?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

// �豸����ӿ�
export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  result?: any;
  errorMessage?: string;
  executedAt?: string;
}

// �豸�Ự�ӿ�
export interface devicesession {
  id: string;
  deviceId: string;
  userId: string;
  experimentId?: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended' | 'error';
  commands: DeviceCommand[];
  dataPoints: DeviceDataPoint[];
  settings: Record<string, any>;
  notes?: string;
}

// �豸ԤԼ�ӿ�
export interface DeviceReservation {
  id: string;
  deviceId: string;
  userId: string;
  title: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'active' | 'approved' | 'rejected' | 'CancelIconled' | 'completed';
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// �豸����ͼ������
export interface DeviceDataChartConfig {
  title: string;
  dataType: string;
  unit?: string;
  color?: string;
  minValue?: number;
  maxValue?: number;
  timeRange: 'realtime' | '1h' | '1d' | '1w' | 'custom';
  customTimeRange?: {
    start: string;
    end: string;
  };
  aggregation?: 'none' | 'average' | 'max' | 'min' | 'sum';
}

// �豸�����������
export interface DeviceControlPanelConfig {
  layout: 'grid' | 'list' | 'custom';
  sections: {
    id: string;
    title: string;
    controls: {
      id: string;
      type: 'button' | 'slider' | 'toggle' | 'input' | 'select';
      label: string;
      command: string;
      options?: any[];
      min?: number;
      max?: number;
      step?: number;
      defaultValue?: any;
    }[];
  }[];
}

// �豸�������
export interface DeviceMonitoringConfig {
  refreshInterval: number; // ����
  alertThresholds: {
    metric: string;
    condition: 'gt' | 'lt' | 'eq' | 'neq' | 'gte' | 'lte';
    value: number | string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
  }[];
  autoReconnect: boolean;
  logLevel: 'error' | 'warning' | 'info' | 'debug';
}

// �豸�澯�ӿ�
export interface DeviceAlert {
  id: string;
  deviceId: string;
  alertType: 'threshold' | 'anomaly' | 'offline' | 'error' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric?: string;
  currentValue?: number;
  thresholdValue?: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

// �澯����ӿ�
export interface AlertRule {
  id: string;
  deviceId: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'range';
  threshold: number;
  maxThreshold?: number; // for range operator
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  name: string;
  description?: string;
  cooldownMinutes: number; // �澯��ȴʱ��
  createdAt: string;
  updatedAt: string;
}

// �澯ͳ�ƽӿ�
export interface AlertStats {
  total: number;
  unacknowledged: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    threshold: number;
    anomaly: number;
    offline: number;
    error: number;
    maintenance: number;
  };
}

// �豸����api�ӿ�����

/**
 * ��ȡ�豸�б��������
 */
export interface GetdevicesParams {
  type?: string;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * �豸�����������
 */
export interface GetDeviceDataParams {
  startTime?: string;
  endTime?: string;
  sensortype?: string;
  limit?: number;
  aggregation?: 'none' | 'avg' | 'max' | 'min';
  interval?: string; // �� '1m', '5m', '1h' ��
}

/**
 * �豸�����������
 */
export interface SendDeviceCommandParams {
  command: string;
  parameters?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  responseTimeout?: number;
}

/**
 * �豸�Ự��������
 */
export interface CreatedevicesessionParams {
  userId: string;
  experimentId?: string;
  settings?: Record<string, any>;
  purpose?: string;
  plannedDuration?: number; // �ƻ��Ự����ʱ��(����)
}

/**
 * �豸ԤԼ��������
 */
export interface CreateDeviceReservationParams {
  deviceId: string;
  userId: string;
  title: string;
  purpose: string;
  startTime: string;
  endTime: string;
  participantIds?: string[];
  notes?: string;
}

/**
 * �豸ԤԼ��ѯ����
 */
export interface GetDeviceReservationsParams {
  deviceId?: string;
  userId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

/**
 * �豸�����������
 */
export interface DeviceMonitoringData {
  deviceId: string;
  timestamp: string;
  metrics: {
    cpuUsage?: number;
    MemoryIconUsage?: number;
    temperature?: number;
    batteryLevel?: number;
    networkLatency?: number;
    diskUsage?: number;
    [key: string]: any;
  };
  status: DeviceConnectionStatus;
  warnings: string[];
  errors: string[];
}
