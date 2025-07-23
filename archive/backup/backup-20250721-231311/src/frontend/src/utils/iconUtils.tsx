import { Box } from '@mui/material';
import React from 'react';
import { DashboardIcon, ScienceIcon, SettingsIcon, SmartToyIcon as AIIcon, CodeIcon as apiIcon, StorageIcon as ResourceIcon, ImageIcon as MediaIcon, DevicesIcon as DeviceIcon, LibraryBooksIcon as TemplateIcon, SecurityIcon as AdminIcon, SchoolIcon as TeacherIcon, AnalyticsIcon as AnalysisIcon, BookIcon as GuidanceIcon, InfoIcon as HelpIconIcon, NotificationsIcon as NotificationIcon, MonitorIcon, GroupIcon, ComputerIcon, TuneIcon as BuildIcon } from './icons';

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
  security: AdminIcon,
  notification: NotificationIcon,
  monitor: MonitorIcon,
  StorageIcon: ResourceIcon,
  analytics: AnalysisIcon,
  group: GroupIcon,
  computer: ComputerIcon,
  build: BuildIcon
};

export const getIcon = (iconName: string): React.ReactNode => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent /> : <DashboardIcon />;
};

export default iconMap;
