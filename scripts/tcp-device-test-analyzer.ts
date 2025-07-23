/**
 * TCP设备集成测试分析工具
 * 用于对测试结果进行深入分析，生成统计报告和优化建议
 */

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// 测试结果接口
interface TestResult {
  deviceId: string;
  name: string;
  connectionSuccess: boolean;
  dataExchangeSuccess: boolean;
  responseTime: number;
  error?: string;
  rawResponse?: string;
  parsedData?: any;
  timestamp?: string;
}

// 设备性能统计
interface DevicePerformanceStats {
  deviceId: string;
  name: string;
  testCount: number;
  successRate: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  commonErrors: { [key: string]: number };
  lastTested: string;
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
}

// 分析结果
interface AnalysisReport {
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    overallSuccessRate: number;
    avgResponseTime: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  deviceStats: DevicePerformanceStats[];
  recommendations: string[];
  criticalIssues: string[];
  charts: {
    successRateByDevice: any;
    responseTimeByDevice: any;
    successRateOverTime: any;
    responseTimeOverTime: any;
  };
}

/**
 * 加载测试报告文件
 */
function loadTestReports(): TestResult[][] {
  const reportsDir = path.join(__dirname, '../tests/reports');

  if (!fs.existsSync(reportsDir)) {
    console.error('测试报告目录不存在:', reportsDir);
    return [];
  }

  // 获取所有JSON报告文件
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('tcp-device-test-') && file.endsWith('.json'))
    .sort(); // 按名称排序，通常包含时间戳

  if (reportFiles.length === 0) {
    console.log('没有找到测试报告文件');
    return [];
  }

  console.log(`找到 ${reportFiles.length} 个测试报告文件`);

  // 加载所有报告
  return reportFiles.map(file => {
    const filePath = path.join(reportsDir, file);
    try {
      const timestamp = file.match(/tcp-device-test-(.*?)\.json/)?.[1];
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // 添加时间戳到每个测试结果
      return data.map((result: TestResult) => ({ ...result, timestamp }));
    } catch (error) {
      console.error(`读取报告文件失败: ${filePath}`, error);
      return [];
    }
  });
}

/**
 * 计算设备性能统计
 */
function calculateDeviceStats(testResults: TestResult[][]): DevicePerformanceStats[] {
  // 先将所有测试结果按设备ID分组
  const deviceMap = new Map<string, TestResult[]>();

  // 合并所有测试报告的结果
  const allResults = testResults.flat();

  allResults.forEach(result => {
    if (!deviceMap.has(result.deviceId)) {
      deviceMap.set(result.deviceId, []);
    }
    deviceMap.get(result.deviceId)!.push(result);
  });

  // 为每个设备计算统计数据
  const stats: DevicePerformanceStats[] = [];

  deviceMap.forEach((results, deviceId) => {
    if (results.length === 0) return;

    // 按时间戳排序
    results.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });

    const successfulTests = results.filter(r => r.connectionSuccess && r.dataExchangeSuccess);
    const successRate = successfulTests.length / results.length;

    // 响应时间统计
    const responseTimes = successfulTests.map(r => r.responseTime).filter(t => t > 0);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // 错误分析
    const errors = results.filter(r => r.error).map(r => r.error as string);
    const errorRate = errors.length / results.length;

    // 统计常见错误
    const commonErrors: { [key: string]: number } = {};
    errors.forEach(error => {
      const errorType = error.split(':')[0].trim();
      commonErrors[errorType] = (commonErrors[errorType] || 0) + 1;
    });

    // 计算性能趋势
    let trend: 'improving' | 'stable' | 'degrading' | 'unknown' = 'unknown';
    if (results.length >= 3) {
      // 将结果分为前半部分和后半部分，比较性能
      const midIndex = Math.floor(results.length / 2);
      const firstHalf = results.slice(0, midIndex);
      const secondHalf = results.slice(midIndex);

      const firstHalfSuccessRate = firstHalf.filter(r => r.connectionSuccess && r.dataExchangeSuccess).length / firstHalf.length;
      const secondHalfSuccessRate = secondHalf.filter(r => r.connectionSuccess && r.dataExchangeSuccess).length / secondHalf.length;

      const firstHalfResponseTimes = firstHalf
        .filter(r => r.connectionSuccess && r.dataExchangeSuccess)
        .map(r => r.responseTime);
      const secondHalfResponseTimes = secondHalf
        .filter(r => r.connectionSuccess && r.dataExchangeSuccess)
        .map(r => r.responseTime);

      const firstHalfAvgTime = firstHalfResponseTimes.length > 0
        ? firstHalfResponseTimes.reduce((sum, time) => sum + time, 0) / firstHalfResponseTimes.length
        : 0;
      const secondHalfAvgTime = secondHalfResponseTimes.length > 0
        ? secondHalfResponseTimes.reduce((sum, time) => sum + time, 0) / secondHalfResponseTimes.length
        : 0;

      // 判断趋势
      if (secondHalfSuccessRate > firstHalfSuccessRate + 0.1 ||
          (secondHalfAvgTime > 0 && firstHalfAvgTime > 0 && secondHalfAvgTime < firstHalfAvgTime * 0.8)) {
        trend = 'improving';
      } else if (secondHalfSuccessRate < firstHalfSuccessRate - 0.1 ||
                (secondHalfAvgTime > 0 && firstHalfAvgTime > 0 && secondHalfAvgTime > firstHalfAvgTime * 1.2)) {
        trend = 'degrading';
      } else {
        trend = 'stable';
      }
    }

    stats.push({
      deviceId,
      name: results[0].name,
      testCount: results.length,
      successRate,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      errorRate,
      commonErrors,
      lastTested: results[results.length - 1].timestamp || 'unknown',
      trend
    });
  });

  // 按成功率降序排序
  return stats.sort((a, b) => b.successRate - a.successRate);
}

/**
 * 生成优化建议
 */
function generateRecommendations(deviceStats: DevicePerformanceStats[]): string[] {
  const recommendations: string[] = [];

  // 通用建议
  recommendations.push('定期清理设备缓存以保持最佳性能');
  recommendations.push('确保网络稳定性，减少干扰源');

  // 基于设备统计的具体建议
  deviceStats.forEach(stat => {
    if (stat.successRate < 0.7) {
      recommendations.push(`设备 ${stat.name} (${stat.deviceId}) 的连接成功率过低，建议检查网络配置和设备状态`);
    }

    if (stat.avgResponseTime > 2000) {
      recommendations.push(`设备 ${stat.name} (${stat.deviceId}) 的平均响应时间超过2秒，建议优化命令处理逻辑或减少数据传输量`);
    }

    if (stat.trend === 'degrading') {
      recommendations.push(`设备 ${stat.name} (${stat.deviceId}) 的性能呈下降趋势，建议进行硬件检查和维护`);
    }

    // 根据常见错误给出建议
    const errorTypes = Object.keys(stat.commonErrors);
    if (errorTypes.includes('连接超时') && stat.commonErrors['连接超时'] > stat.testCount * 0.3) {
      recommendations.push(`设备 ${stat.name} (${stat.deviceId}) 频繁出现连接超时，建议检查设备网络状态和防火墙设置`);
    }

    if (errorTypes.includes('连接被关闭') && stat.commonErrors['连接被关闭'] > stat.testCount * 0.3) {
      recommendations.push(`设备 ${stat.name} (${stat.deviceId}) 频繁出现连接被关闭，建议检查设备是否配置了自动断开连接的功能`);
    }
  });

  // 如果有多个设备性能不稳定，添加整体建议
  const unstableDevices = deviceStats.filter(stat => stat.successRate < 0.8 || stat.trend === 'degrading');
  if (unstableDevices.length > 1) {
    recommendations.push('多个设备表现不稳定，建议检查网络基础设施和交换机状态');
  }

  return [...new Set(recommendations)]; // 去重
}

/**
 * 识别关键问题
 */
function identifyCriticalIssues(deviceStats: DevicePerformanceStats[]): string[] {
  const criticalIssues: string[] = [];

  // 识别完全失败的设备
  const failedDevices = deviceStats.filter(stat => stat.successRate === 0);
  if (failedDevices.length > 0) {
    failedDevices.forEach(device => {
      criticalIssues.push(`设备 ${device.name} (${device.deviceId}) 所有测试均失败，需要立即检查`);
    });
  }

  // 识别严重超时的设备
  const timeoutDevices = deviceStats.filter(stat =>
    stat.commonErrors['连接超时'] && stat.commonErrors['连接超时'] > stat.testCount * 0.7
  );
  if (timeoutDevices.length > 0) {
    timeoutDevices.forEach(device => {
      criticalIssues.push(`设备 ${device.name} (${device.deviceId}) 严重连接超时，可能离线或网络不可达`);
    });
  }

  // 识别响应时间异常的设备
  const slowDevices = deviceStats.filter(stat => stat.avgResponseTime > 5000);
  if (slowDevices.length > 0) {
    slowDevices.forEach(device => {
      criticalIssues.push(`设备 ${device.name} (${device.deviceId}) 响应时间异常（${device.avgResponseTime.toFixed(2)}ms），性能严重下降`);
    });
  }

  // 识别全局网络问题
  if (deviceStats.length > 3 && deviceStats.filter(stat => stat.successRate < 0.5).length > deviceStats.length * 0.7) {
    criticalIssues.push('大多数设备测试失败，可能存在全局网络问题或测试环境问题');
  }

  return criticalIssues;
}

/**
 * 生成分析报告
 */
function generateAnalysisReport(testResults: TestResult[][]): AnalysisReport {
  // 合并所有测试报告的结果
  const allResults = testResults.flat();

  // 计算设备统计
  const deviceStats = calculateDeviceStats(testResults);

  // 生成整体摘要
  const successfulTests = allResults.filter(r => r.connectionSuccess && r.dataExchangeSuccess);
  const summary = {
    totalTests: allResults.length,
    successfulTests: successfulTests.length,
    failedTests: allResults.length - successfulTests.length,
    overallSuccessRate: successfulTests.length / allResults.length,
    avgResponseTime: successfulTests.length > 0
      ? successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length
      : 0,
    dateRange: {
      start: allResults.length > 0
        ? new Date(allResults[0].timestamp || '').toISOString().split('T')[0]
        : 'unknown',
      end: allResults.length > 0
        ? new Date(allResults[allResults.length - 1].timestamp || '').toISOString().split('T')[0]
        : 'unknown'
    }
  };

  // 生成建议和关键问题
  const recommendations = generateRecommendations(deviceStats);
  const criticalIssues = identifyCriticalIssues(deviceStats);

  // 创建图表数据(实际实现中这里可以生成图表数据)
  const charts = {
    successRateByDevice: deviceStats.map(stat => ({ name: stat.name, rate: stat.successRate })),
    responseTimeByDevice: deviceStats.map(stat => ({ name: stat.name, time: stat.avgResponseTime })),
    successRateOverTime: {},
    responseTimeOverTime: {}
  };

  return {
    summary,
    deviceStats,
    recommendations,
    criticalIssues,
    charts
  };
}

/**
 * 保存分析报告
 */
function saveAnalysisReport(report: AnalysisReport): string {
  const reportsDir = path.join(__dirname, '../tests/reports/analysis');

  // 确保目录存在
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(reportsDir, `tcp-device-analysis-${timestamp}.json`);

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

  return filePath;
}

/**
 * 生成可读的HTML报告
 */
function generateHtmlReport(report: AnalysisReport): string {
  const reportsDir = path.join(__dirname, '../tests/reports/analysis');

  // 确保目录存在
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(reportsDir, `tcp-device-analysis-${timestamp}.html`);

  // 创建HTML内容
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TCP设备测试分析报告</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { color: #2c3e50; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary-box { background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .stats-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .stats-table th, .stats-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .stats-table th { background-color: #f2f2f2; }
    .stats-table tr:hover { background-color: #f5f5f5; }
    .success-rate-high { color: #27ae60; }
    .success-rate-medium { color: #f39c12; }
    .success-rate-low { color: #e74c3c; }
    .trend-improving { color: #27ae60; }
    .trend-stable { color: #3498db; }
    .trend-degrading { color: #e74c3c; }
    .recommendations, .issues { background-color: #f8f9fa; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .recommendations li, .issues li { margin-bottom: 8px; }
    .issues li { color: #e74c3c; }
    .footer { margin-top: 30px; font-size: 0.9em; color: #7f8c8d; text-align: center; }
    .chart-container { margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TCP设备测试分析报告</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>

    <h2>测试摘要</h2>
    <div class="summary-box">
      <p><strong>测试总数:</strong> ${report.summary.totalTests}</p>
      <p><strong>成功测试:</strong> ${report.summary.successfulTests} (${(report.summary.overallSuccessRate * 100).toFixed(1)}%)</p>
      <p><strong>失败测试:</strong> ${report.summary.failedTests}</p>
      <p><strong>平均响应时间:</strong> ${report.summary.avgResponseTime.toFixed(2)}ms</p>
      <p><strong>测试日期范围:</strong> ${report.summary.dateRange.start} 至 ${report.summary.dateRange.end}</p>
    </div>

    <h2>设备性能统计</h2>
    <table class="stats-table">
      <thead>
        <tr>
          <th>设备名称</th>
          <th>设备ID</th>
          <th>测试次数</th>
          <th>成功率</th>
          <th>平均响应时间</th>
          <th>性能趋势</th>
          <th>最后测试时间</th>
        </tr>
      </thead>
      <tbody>
`;

  // 添加设备统计行
  report.deviceStats.forEach(stat => {
    // 确定成功率的样式类
    let successRateClass = '';
    if (stat.successRate >= 0.8) {
      successRateClass = 'success-rate-high';
    } else if (stat.successRate >= 0.5) {
      successRateClass = 'success-rate-medium';
    } else {
      successRateClass = 'success-rate-low';
    }

    // 确定趋势的样式类和文本
    let trendClass = '';
    let trendText = '';
    switch (stat.trend) {
      case 'improving':
        trendClass = 'trend-improving';
        trendText = '改善中';
        break;
      case 'stable':
        trendClass = 'trend-stable';
        trendText = '稳定';
        break;
      case 'degrading':
        trendClass = 'trend-degrading';
        trendText = '下降中';
        break;
      default:
        trendText = '未知';
    }

    html += `
        <tr>
          <td>${stat.name}</td>
          <td>${stat.deviceId}</td>
          <td>${stat.testCount}</td>
          <td class="${successRateClass}">${(stat.successRate * 100).toFixed(1)}%</td>
          <td>${stat.avgResponseTime.toFixed(2)}ms</td>
          <td class="${trendClass}">${trendText}</td>
          <td>${stat.lastTested}</td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <div class="chart-container">
      <!-- 这里可以添加图表，如使用Chart.js -->
      <p><em>注: 在实际报告中，这里会显示设备性能图表</em></p>
    </div>

    <h2>常见错误分析</h2>
    <table class="stats-table">
      <thead>
        <tr>
          <th>设备名称</th>
          <th>错误率</th>
          <th>常见错误</th>
        </tr>
      </thead>
      <tbody>
`;

  // 添加错误分析行
  report.deviceStats.forEach(stat => {
    const errorItems = Object.entries(stat.commonErrors)
      .map(([error, count]) => `${error}: ${count}次 (${(count / stat.testCount * 100).toFixed(1)}%)`)
      .join('<br>');

    html += `
        <tr>
          <td>${stat.name}</td>
          <td>${(stat.errorRate * 100).toFixed(1)}%</td>
          <td>${errorItems || '无错误'}</td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>
`;

  // 添加关键问题
  if (report.criticalIssues.length > 0) {
    html += `
    <h2>关键问题</h2>
    <div class="issues">
      <ul>
    `;

    report.criticalIssues.forEach(issue => {
      html += `        <li>${issue}</li>\n`;
    });

    html += `
      </ul>
    </div>
    `;
  }

  // 添加优化建议
  html += `
    <h2>优化建议</h2>
    <div class="recommendations">
      <ul>
  `;

  report.recommendations.forEach(recommendation => {
    html += `        <li>${recommendation}</li>\n`;
  });

  html += `
      </ul>
    </div>

    <div class="footer">
      <p>AI实验平台 - TCP设备测试分析工具 &copy; 2025</p>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(filePath, html);

  return filePath;
}

/**
 * 主函数
 */
async function main() {
  console.log('===== 开始分析TCP设备测试结果 =====');

  // 加载测试报告
  const testReports = loadTestReports();

  if (testReports.length === 0 || testReports.flat().length === 0) {
    console.log('没有找到有效的测试报告数据，无法进行分析');
    return;
  }

  console.log(`已加载 ${testReports.length} 个测试报告，包含 ${testReports.flat().length} 条测试结果`);

  // 生成分析报告
  const analysisReport = generateAnalysisReport(testReports);

  // 保存JSON报告
  const jsonReportPath = saveAnalysisReport(analysisReport);
  console.log(`JSON分析报告已保存至: ${jsonReportPath}`);

  // 生成HTML报告
  const htmlReportPath = generateHtmlReport(analysisReport);
  console.log(`HTML分析报告已保存至: ${htmlReportPath}`);

  // 打印摘要
  console.log('\n===== 分析摘要 =====');
  console.log(`总测试数: ${analysisReport.summary.totalTests}`);
  console.log(`成功率: ${(analysisReport.summary.overallSuccessRate * 100).toFixed(1)}%`);
  console.log(`平均响应时间: ${analysisReport.summary.avgResponseTime.toFixed(2)}ms`);

  if (analysisReport.criticalIssues.length > 0) {
    console.log('\n关键问题:');
    analysisReport.criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('\n优化建议:');
  analysisReport.recommendations.slice(0, 5).forEach((recommendation, index) => {
    console.log(`${index + 1}. ${recommendation}`);
  });

  if (analysisReport.recommendations.length > 5) {
    console.log(`... 以及其他 ${analysisReport.recommendations.length - 5} 条建议 (详见完整报告)`);
  }

  console.log('\n分析完成！请查看报告获取详细信息。');
}

// 执行主函数
main().catch(console.error);
