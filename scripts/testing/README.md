## TCP/Socket协议适配器测试环境准备

本工具包包含用于准备TCP/Socket协议适配器实际设备测试环境的脚本和配置文件。

### 包含的工具

1. **Start-TestEnvironment.ps1**
   - 主启动脚本，用于配置整个测试环境
   - 调用其他工具脚本，简化测试环境设置过程
   - 生成测试环境设置报告

2. **Configure-TestNetwork.ps1**
   - 配置测试网络环境
   - 设置网络适配器参数
   - 配置防火墙规则
   - 创建虚拟测试网络（可选）
   - 配置网络监控
   - 测试网络连接性

3. **Check-DeviceConnectivity.ps1**
   - 检查设备网络连接状态
   - 测试TCP端口是否可访问
   - 尝试与设备建立简单的TCP连接
   - 验证基本命令响应
   - 生成设备连接报告

### 配置文件

- **devices.json**
  - 包含测试设备的配置信息
  - 定义设备连接参数
  - 设置测试命令和预期响应

### 使用方法

#### 准备工作

1. 确保所有测试设备已连接到测试网络
2. 检查设备配置是否正确
3. 确保您具有管理员权限

#### 启动测试环境

使用PowerShell以管理员身份运行以下命令：

```powershell
# 完整设置（配置网络和检查设备）
.\Start-TestEnvironment.ps1

# 仅检查设备连接，不配置网络
.\Start-TestEnvironment.ps1 -ConfigureNetwork $false -CheckDevices $true

# 仅配置网络，不检查设备
.\Start-TestEnvironment.ps1 -ConfigureNetwork $true -CheckDevices $false

# 使用自定义设备配置文件
.\Start-TestEnvironment.ps1 -DeviceConfigPath "C:\path\to\custom-devices.json"
```

### 脚本运行后

1. 查看生成的测试环境设置报告
2. 检查设备连接报告，确保所有设备都可以正常连接
3. 如果有连接问题，请参考报告中的详细信息进行故障排除
4. 准备开始TCP/Socket协议适配器测试

### 故障排除

如果遇到问题，请检查以下内容：

1. 网络连接问题
   - 检查物理连接
   - 验证IP地址和子网掩码设置
   - 检查防火墙规则

2. 设备连接问题
   - 确保设备已开机并处于正常工作状态
   - 验证设备网络设置
   - 检查设备是否需要特殊的认证或初始化

3. 脚本执行问题
   - 确保以管理员身份运行PowerShell
   - 检查PowerShell执行策略设置
   - 查看生成的日志文件

### 注意事项

- 这些脚本应在隔离的测试环境中运行，避免影响生产网络
- 部分功能可能需要管理员权限
- 配置防火墙规则可能会影响系统安全设置，请谨慎操作
- 在生产环境中使用前，请先在测试环境中验证脚本功能

### 更多信息

有关TCP/Socket协议适配器的更多信息，请参阅项目文档。
