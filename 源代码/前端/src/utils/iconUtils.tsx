import { Box } from '@mui/material';
import React from 'react';
import { DashboardIcon, ScienceIcon, SettingsIcon, SmartToyIcon as AIIcon, CodeIcon as apiIcon, StorageIcon as ResourceIcon, ImageIcon as MediaIcon, DevicesIcon as DeviceIcon, LibraryBooksIcon as TemplateIcon, SecurityIcon as AdminIcon, SchoolIcon as TeacherIcon, AnalyticsIcon as AnalysisIcon, MenuBookIcon as GuidanceIcon, InfoIcon as HelpIconIcon, SecurityIcon, NotificationsIcon as NotificationIcon, MonitorIcon, StorageIcon, AnalyticsIcon, GroupIcon, ComputerIcon, TuneIcon as BuildIcon } from './icons';

const iconMap: Record<string, React.ComponentType> = {
  dashboard: DashboardIcon,
  ScienceIcon: ScienceIcon,
  settings: SettingsIcon,
  ai: AIIcon,
  api: apiIcon,
  resource: ResourceIcon,
  media: MediaIcon,
  device: DeviceIcon,
  template: TemplateIcon,
  admin: AdminIcon,
  teacher: TeacherIcon,
  analysis: AnalysisIcon,
  guidance: GuidanceIcon,
  HelpIcon: HelpIconIcon,
  security: SecurityIcon,
  notification: NotificationIcon,
  monitor: MonitorIcon,
  StorageIcon: StorageIcon,
  analytics: AnalyticsIcon,
  group: GroupIcon,
  computer: ComputerIcon,
  build: BuildIcon
};

export const getIcon = (iconName: string): React.ReactNode => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent /> : <DashboardIcon />;
};

export default iconMap;
