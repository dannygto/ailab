/**
 * AICAM系统监控告警系统
 * 
 * 功能：
 * - 实时监控系统资源使用情况
 * - 服务健康状态检查
 * - 异常告警通知
 * - 性能指标收集
 */

const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class SystemMonitor {
  constructor(config = {}) {
    this.config = {
      // 监控间隔（毫秒）
      interval: config.interval || 30000, // 30秒
      
      // 告警阈值
      thresholds: {
        cpu: config.thresholds?.cpu || 80,     // CPU使用率 > 80%
        memory: config.thresholds?.memory || 85, // 内存使用率 > 85%
        disk: config.thresholds?.disk || 90,    // 磁盘使用率 > 90%
        responseTime: config.thresholds?.responseTime || 5000, // 响应时间 > 5秒
      },
      
      // 监控的服务
      services: {
        frontend: { url: 'http://localhost:3000', name: '前端服务' },
        backend: { url: 'http://localhost:3002/health', name: '后端服务' },
      },
      
      // 告警配置
      alerts: {
        enabled: config.alerts?.enabled !== false,
        logFile: config.alerts?.logFile || path.join(__dirname, 'alerts.log'),
        webhooks: config.alerts?.webhooks || [],
      }
    };
    
    this.isRunning = false;
    this.monitoringTimer = null;
    this.metrics = {
      history: [],
      alerts: []
    };
  }

  /**
   * 开始监控
   */
  async start() {
    if (this.isRunning) {
      console.log('🔍 系统监控已在运行中...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 启动AICAM系统监控...');
    console.log(`📊 监控间隔: ${this.config.interval / 1000}秒`);
    console.log(`⚠️ 告警阈值: CPU ${this.config.thresholds.cpu}%, 内存 ${this.config.thresholds.memory}%, 磁盘 ${this.config.thresholds.disk}%`);

    // 创建监控日志目录
    await this.ensureLogDirectory();

    // 开始监控循环
    this.monitoringTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ 监控检查出错:', error.message);
      }
    }, this.config.interval);

    // 立即执行一次检查
    await this.performHealthCheck();
  }

  /**
   * 停止监控
   */
  stop() {
    if (!this.isRunning) {
      console.log('⏹️ 系统监控未在运行');
      return;
    }

    this.isRunning = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    console.log('🛑 系统监控已停止');
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] 执行系统健康检查...`);

    const metrics = {
      timestamp,
      system: await this.getSystemMetrics(),
      services: await this.getServiceStatus(),
      alerts: []
    };

    // 检查告警条件
    await this.checkAlerts(metrics);

    // 保存指标
    this.metrics.history.push(metrics);
    
    // 保持历史记录在合理范围内（最近100条）
    if (this.metrics.history.length > 100) {
      this.metrics.history = this.metrics.history.slice(-100);
    }

    // 输出状态摘要
    this.printStatusSummary(metrics);

    return metrics;
  }

  /**
   * 获取系统指标
   */
  async getSystemMetrics() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // 获取CPU使用率
    const cpuUsage = await this.getCpuUsage();

    // 获取磁盘使用率
    const diskUsage = await this.getDiskUsage();

    return {
      cpu: {
        cores: cpus.length,
        usage: cpuUsage,
        model: cpus[0]?.model || 'Unknown'
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercent: memUsagePercent
      },
      disk: diskUsage,
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  }

  /**
   * 获取CPU使用率
   */
  async getCpuUsage() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic cpu get loadpercentage /value');
        const match = stdout.match(/LoadPercentage=(\d+)/);
        return match ? parseFloat(match[1]) : 0;
      } else {
        // Linux/Mac 系统
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | awk -F'%' '{print $1}'");
        return parseFloat(stdout.trim()) || 0;
      }
    } catch (error) {
      console.warn('⚠️ 无法获取CPU使用率:', error.message);
      return 0;
    }
  }

  /**
   * 获取磁盘使用率
   */
  async getDiskUsage() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Caption'));
        
        const disks = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const caption = parts[0];
            const freeSpace = parseInt(parts[1]) || 0;
            const totalSpace = parseInt(parts[2]) || 1;
            const usedSpace = totalSpace - freeSpace;
            const usagePercent = (usedSpace / totalSpace) * 100;
            
            return {
              drive: caption,
              total: totalSpace,
              free: freeSpace,
              used: usedSpace,
              usagePercent
            };
          }
          return null;
        }).filter(Boolean);

        return disks;
      } else {
        // Linux/Mac 系统
        const { stdout } = await execAsync("df -h | grep -E '^/' | awk '{print $1,$2,$3,$4,$5,$6}'");
        const lines = stdout.split('\n').filter(line => line.trim());
        
        return lines.map(line => {
          const parts = line.split(/\s+/);
          return {
            filesystem: parts[0],
            total: parts[1],
            used: parts[2],
            available: parts[3],
            usagePercent: parseFloat(parts[4]) || 0,
            mountpoint: parts[5]
          };
        });
      }
    } catch (error) {
      console.warn('⚠️ 无法获取磁盘使用率:', error.message);
      return [];
    }
  }

  /**
   * 获取服务状态
   */
  async getServiceStatus() {
    const services = {};
    
    for (const [key, service] of Object.entries(this.config.services)) {
      services[key] = await this.checkService(service);
    }
    
    return services;
  }

  /**
   * 检查单个服务状态
   */
  async checkService(service) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        timeout: 10000, // 10秒超时
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      return {
        name: service.name,
        url: service.url,
        status: isHealthy ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: service.name,
        url: service.url,
        status: 'error',
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查告警条件
   */
  async checkAlerts(metrics) {
    const alerts = [];

    // CPU告警
    if (metrics.system.cpu.usage > this.config.thresholds.cpu) {
      alerts.push({
        type: 'cpu',
        level: 'warning',
        message: `CPU使用率过高: ${metrics.system.cpu.usage.toFixed(1)}% (阈值: ${this.config.thresholds.cpu}%)`,
        value: metrics.system.cpu.usage,
        threshold: this.config.thresholds.cpu
      });
    }

    // 内存告警
    if (metrics.system.memory.usagePercent > this.config.thresholds.memory) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `内存使用率过高: ${metrics.system.memory.usagePercent.toFixed(1)}% (阈值: ${this.config.thresholds.memory}%)`,
        value: metrics.system.memory.usagePercent,
        threshold: this.config.thresholds.memory
      });
    }

    // 磁盘告警
    metrics.system.disk.forEach(disk => {
      if (disk.usagePercent > this.config.thresholds.disk) {
        alerts.push({
          type: 'disk',
          level: 'warning',
          message: `磁盘使用率过高: ${disk.drive || disk.filesystem} ${disk.usagePercent.toFixed(1)}% (阈值: ${this.config.thresholds.disk}%)`,
          value: disk.usagePercent,
          threshold: this.config.thresholds.disk,
          disk: disk.drive || disk.filesystem
        });
      }
    });

    // 服务告警
    Object.values(metrics.services).forEach(service => {
      if (service.status !== 'healthy') {
        alerts.push({
          type: 'service',
          level: 'error',
          message: `服务异常: ${service.name} (${service.url}) - ${service.error || '状态码: ' + service.statusCode}`,
          service: service.name,
          url: service.url,
          status: service.status
        });
      } else if (service.responseTime > this.config.thresholds.responseTime) {
        alerts.push({
          type: 'performance',
          level: 'warning',
          message: `服务响应时间过长: ${service.name} ${service.responseTime}ms (阈值: ${this.config.thresholds.responseTime}ms)`,
          service: service.name,
          responseTime: service.responseTime,
          threshold: this.config.thresholds.responseTime
        });
      }
    });

    metrics.alerts = alerts;

    // 处理告警
    if (alerts.length > 0) {
      await this.handleAlerts(alerts);
    }
  }

  /**
   * 处理告警
   */
  async handleAlerts(alerts) {
    if (!this.config.alerts.enabled) return;

    for (const alert of alerts) {
      // 记录告警历史
      this.metrics.alerts.push({
        ...alert,
        timestamp: new Date().toISOString()
      });

      // 输出告警信息
      const icon = alert.level === 'error' ? '🚨' : '⚠️';
      console.log(`${icon} [${alert.type.toUpperCase()}] ${alert.message}`);

      // 写入告警日志
      await this.writeAlertLog(alert);

      // 发送Webhook通知（如果配置了）
      await this.sendWebhookAlert(alert);
    }

    // 保持告警历史在合理范围内（最近200条）
    if (this.metrics.alerts.length > 200) {
      this.metrics.alerts = this.metrics.alerts.slice(-200);
    }
  }

  /**
   * 写入告警日志
   */
  async writeAlertLog(alert) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...alert
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.config.alerts.logFile, logLine);
    } catch (error) {
      console.error('❌ 写入告警日志失败:', error.message);
    }
  }

  /**
   * 发送Webhook告警
   */
  async sendWebhookAlert(alert) {
    if (!this.config.alerts.webhooks.length) return;

    const payload = {
      timestamp: new Date().toISOString(),
      system: 'AICAM',
      alert
    };

    for (const webhook of this.config.alerts.webhooks) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error(`❌ Webhook通知失败 (${webhook}):`, error.message);
      }
    }
  }

  /**
   * 确保日志目录存在
   */
  async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.config.alerts.logFile);
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('❌ 创建日志目录失败:', error.message);
    }
  }

  /**
   * 打印状态摘要
   */
  printStatusSummary(metrics) {
    const { system, services, alerts } = metrics;
    
    console.log('📊 系统状态摘要:');
    console.log(`   💻 CPU: ${system.cpu.usage.toFixed(1)}% (${system.cpu.cores}核)`);
    console.log(`   🧠 内存: ${system.memory.usagePercent.toFixed(1)}% (${this.formatBytes(system.memory.used)}/${this.formatBytes(system.memory.total)})`);
    
    if (system.disk.length > 0) {
      system.disk.forEach(disk => {
        console.log(`   💾 磁盘 ${disk.drive || disk.filesystem}: ${disk.usagePercent.toFixed(1)}%`);
      });
    }

    console.log(`   🌐 服务状态:`);
    Object.values(services).forEach(service => {
      const status = service.status === 'healthy' ? '✅' : '❌';
      console.log(`      ${status} ${service.name}: ${service.status} (${service.responseTime}ms)`);
    });

    if (alerts.length > 0) {
      console.log(`   🚨 当前告警: ${alerts.length}条`);
    } else {
      console.log(`   ✅ 系统正常运行`);
    }
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      metrics: {
        historyCount: this.metrics.history.length,
        alertCount: this.metrics.alerts.length,
        lastCheck: this.metrics.history[this.metrics.history.length - 1]?.timestamp
      }
    };
  }

  /**
   * 获取监控历史
   */
  getHistory(limit = 10) {
    return this.metrics.history.slice(-limit);
  }

  /**
   * 获取告警历史
   */
  getAlerts(limit = 50) {
    return this.metrics.alerts.slice(-limit);
  }
}

module.exports = SystemMonitor;

// 如果直接运行此文件，启动监控
if (require.main === module) {
  const monitor = new SystemMonitor({
    interval: 30000, // 30秒检查一次
    thresholds: {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 5000
    }
  });

  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n🛑 接收到退出信号，正在停止监控...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 接收到终止信号，正在停止监控...');
    monitor.stop();
    process.exit(0);
  });

  // 启动监控
  monitor.start().catch(error => {
    console.error('❌ 启动监控失败:', error);
    process.exit(1);
  });
}
