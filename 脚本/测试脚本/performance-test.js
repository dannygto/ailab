const http = require('http');
const fs = require('fs');

const testConfig = {
  baseUrl: 'http://localhost:3000',
  testDuration: 10000,
  concurrentUsers: 5,
  endpoints: [
    { path: '/', name: '前端首页' },
    { path: '/api/health', name: '后端健康检查' }
  ]
};

class PerformanceTest {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      averageResponseTime: 0
    };
  }

  async makeRequest(url, endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(url + endpoint.path, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.totalRequests++;
        this.results.totalResponseTime += responseTime;
        
        if (res.statusCode === 200) {
          this.results.successfulRequests++;
        } else {
          this.results.failedRequests++;
        }
        
        this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
        this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
        
        resolve(responseTime);
      });
      
      req.on('error', () => {
        this.results.totalRequests++;
        this.results.failedRequests++;
        resolve(0);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        this.results.totalRequests++;
        this.results.failedRequests++;
        resolve(0);
      });
    });
  }

  async runTest() {
    console.log('🚀 开始性能测试...');
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < testConfig.concurrentUsers; i++) {
      const userPromise = this.runUserTest();
      promises.push(userPromise);
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const testDuration = endTime - startTime;
    
    this.results.averageResponseTime = this.results.totalResponseTime / this.results.totalRequests;
    
    console.log('\n📊 性能测试结果:');
    console.log('总请求数: ' + this.results.totalRequests);
    console.log('成功请求: ' + this.results.successfulRequests);
    console.log('失败请求: ' + this.results.failedRequests);
    console.log('成功率: ' + ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2) + '%');
    console.log('平均响应时间: ' + this.results.averageResponseTime.toFixed(2) + 'ms');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: testConfig,
      results: this.results,
      testDuration
    };
    
    fs.writeFileSync('项目管理/进度报告/性能测试报告.json', JSON.stringify(report, null, 2));
    console.log('✅ 性能测试报告已保存');
  }

  async runUserTest() {
    const endTime = Date.now() + testConfig.testDuration;
    
    while (Date.now() < endTime) {
      for (const endpoint of testConfig.endpoints) {
        await this.makeRequest(testConfig.baseUrl, endpoint);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

const test = new PerformanceTest();
test.runTest().catch(console.error);
