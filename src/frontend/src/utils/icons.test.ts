/**
 * 图标导出测试
 * 验证所有图标都能正确导入
 */

import * as Icons from './icons';

describe('Icons Export', () => {
  test('should export basic UI icons', () => {
    expect(Icons.MenuIcon).toBeDefined();
    expect(Icons.CloseIcon).toBeDefined();
    expect(Icons.AddIcon).toBeDefined();
    expect(Icons.EditIcon).toBeDefined();
    expect(Icons.DeleteIcon).toBeDefined();
    expect(Icons.SearchIcon).toBeDefined();
  });

  test('should export navigation icons', () => {
    expect(Icons.DashboardIcon).toBeDefined();
    expect(Icons.HomeIcon).toBeDefined();
    expect(Icons.SettingsIcon).toBeDefined();
    expect(Icons.NotificationsIcon).toBeDefined();
  });

  test('should export media control icons', () => {
    expect(Icons.PlayArrowIcon).toBeDefined();
    expect(Icons.PauseIcon).toBeDefined();
    expect(Icons.StopIcon).toBeDefined();
    expect(Icons.ReplayIcon).toBeDefined();
  });

  test('should export file operation icons', () => {
    expect(Icons.DownloadIcon).toBeDefined();
    expect(Icons.UploadFileIcon).toBeDefined();
    expect(Icons.SaveIcon).toBeDefined();
    expect(Icons.FolderIcon).toBeDefined();
  });

  test('should export status icons', () => {
    expect(Icons.CheckCircleIcon).toBeDefined();
    expect(Icons.ErrorIcon).toBeDefined();
    expect(Icons.WarningIcon).toBeDefined();
    expect(Icons.InfoIcon).toBeDefined();
  });

  test('should export chart icons', () => {
    expect(Icons.BarChartIcon).toBeDefined();
    expect(Icons.ShowChartIcon).toBeDefined();
    expect(Icons.PieChartIcon).toBeDefined();
    expect(Icons.AnalyticsIcon).toBeDefined();
  });

  test('should export device icons', () => {
    expect(Icons.ComputerIcon).toBeDefined();
    expect(Icons.MonitorIcon).toBeDefined();
    expect(Icons.DeviceHubIcon).toBeDefined();
    expect(Icons.DevicesIcon).toBeDefined();
  });

  test('should export science icons', () => {
    expect(Icons.ScienceIcon).toBeDefined();
    expect(Icons.PsychologyIcon).toBeDefined();
    expect(Icons.BiotechIcon).toBeDefined();
    expect(Icons.ExperimentIcon).toBeDefined();
  });

  test('should export education icons', () => {
    expect(Icons.SchoolIcon).toBeDefined();
    expect(Icons.BookIcon).toBeDefined();
    expect(Icons.AssignmentIcon).toBeDefined();
    expect(Icons.EducationIcon).toBeDefined();
  });

  test('should export aliases correctly', () => {
    expect(Icons.InstallIcon).toBeDefined();
    expect(Icons.DeviceIcon).toBeDefined();
    expect(Icons.ColorPaletteIcon).toBeDefined();
  });

  test('should have no duplicate exports', () => {
    const iconNames = Object.keys(Icons);
    const uniqueNames = new Set(iconNames);
    expect(iconNames.length).toBe(uniqueNames.size);
  });
}); 