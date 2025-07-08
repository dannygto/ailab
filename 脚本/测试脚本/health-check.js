const http = require('http');
const https = require('https');

const healthConfig = {
  services: [
    { name: '前端服务', url: 'http://localhost:3000', path: '/' },
    { name: '后端服务', url: 'http://localhost:8000', path: '/api/health' },
    { name: 'AI服务', url: 'http://localhost:8001', path: '/ai/health' },
    { name: 'Nginx', url: 'http://localhost', path: '/' }
  ],
  timeout: 5000
};

class HealthChecker {
  constructor() {
    this.results = [];
  }

  async checkService(service) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(service.url + service.path, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.push({
          service: service.name,
          status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
          responseTime: responseTime,
          statusCode: res.statusCode
        });
        
        resolve();
      });
      
      req.on('error', () => {
        this.results.push({
          service: service.name,
          status: 'unreachable',
          responseTime: 0,
          statusCode: 0
        });
        resolve();
      });
      
      req.setTimeout(healthConfig.timeout, () => {
        req.destroy();
        this.results.push({
          service: service.name,
          status: 'timeout',
          responseTime: healthConfig.timeout,
          statusCode: 0
        });
        resolve();
      });
    });
  }

  async runHealthCheck() {
    console.log('🔍 开始健康检查...');
    
    const promises = healthConfig.services.map(service => this.checkService(service));
    await Promise.all(promises);
    
    console.log('\n📊 健康检查结果:');
    this.results.forEach(result => {
      const statusIcon = result.status === 'healthy' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.service}: ${result.status} (${result.responseTime}ms)`);
    });
    
    const healthyCount = this.results.filter(r => r.status === 'healthy').length;
    const totalCount = this.results.length;
    
    console.log(`\n📈 健康状态: ${healthyCount}/${totalCount} 服务正常`);
    
    if (healthyCount === totalCount) {
      console.log('🎉 所有服务运行正常！');
      process.exit(0);
    } else {
      console.log('⚠️  部分服务存在问题，请检查日志');
      process.exit(1);
    }
  }
}

const checker = new HealthChecker();
checker.runHealthCheck().catch(console.error);
