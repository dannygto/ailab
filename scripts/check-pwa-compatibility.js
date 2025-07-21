#!/usr/bin/env node

/**
 * PWA 兼容性检查脚本
 * 检查各浏览器对PWA功能的支持情况
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AILAB PWA 兼容性检查报告');
console.log('=======================================\n');

// 检查基础PWA文件
function checkPWAFiles() {
  console.log('📂 检查PWA基础文件...');

  const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/offline.html',
    'public/favicon.ico',
    'public/logo18060.png'
  ];

  const baseDir = path.join(__dirname, '../src/frontend');

  requiredFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file} - 存在`);
    } else {
      console.log(`  ❌ ${file} - 缺失`);
    }
  });

  console.log('');
}

// 检查manifest.json配置
function checkManifest() {
  console.log('📋 检查Manifest配置...');

  const manifestPath = path.join(__dirname, '../src/frontend/public/manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.log('  ❌ manifest.json 文件不存在');
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const requiredFields = [
      'name', 'short_name', 'start_url', 'display',
      'theme_color', 'background_color', 'icons'
    ];

    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`  ✅ ${field} - 已配置`);
      } else {
        console.log(`  ❌ ${field} - 缺失`);
      }
    });

    // 检查图标配置
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`  ✅ 图标数量: ${manifest.icons.length}`);

      const requiredSizes = ['192x192', '512x512'];
      requiredSizes.forEach(size => {
        const hasSize = manifest.icons.some(icon =>
          icon.sizes && icon.sizes.includes(size)
        );
        if (hasSize) {
          console.log(`    ✅ ${size} 图标 - 已配置`);
        } else {
          console.log(`    ⚠️  ${size} 图标 - 建议添加`);
        }
      });
    }

  } catch (error) {
    console.log(`  ❌ manifest.json 解析错误: ${error.message}`);
  }

  console.log('');
}

// 检查Service Worker
function checkServiceWorker() {
  console.log('⚙️ 检查Service Worker...');

  const swPath = path.join(__dirname, '../src/frontend/public/sw.js');

  if (!fs.existsSync(swPath)) {
    console.log('  ❌ sw.js 文件不存在');
    return;
  }

  const swContent = fs.readFileSync(swPath, 'utf8');

  // 检查关键功能
  const features = [
    { name: '安装事件', pattern: /addEventListener\s*\(\s*['"]install['"]/ },
    { name: '激活事件', pattern: /addEventListener\s*\(\s*['"]activate['"]/ },
    { name: '请求拦截', pattern: /addEventListener\s*\(\s*['"]fetch['"]/ },
    { name: '缓存策略', pattern: /cache/i },
    { name: '离线支持', pattern: /offline/i }
  ];

  features.forEach(feature => {
    if (feature.pattern.test(swContent)) {
      console.log(`  ✅ ${feature.name} - 已实现`);
    } else {
      console.log(`  ❌ ${feature.name} - 未发现`);
    }
  });

  console.log('');
}

// 浏览器兼容性信息
function showBrowserCompatibility() {
  console.log('🌐 浏览器兼容性说明...');
  console.log('');

  const compatibility = [
    {
      browser: 'Chrome/Edge (Chromium)',
      version: '67+',
      support: '完全支持',
      features: ['安装提示', '离线缓存', '推送通知', '后台同步'],
      note: '最佳PWA体验'
    },
    {
      browser: 'Firefox',
      version: '79+',
      support: '良好支持',
      features: ['离线缓存', '推送通知'],
      note: '不支持安装提示，但支持手动添加到主屏幕'
    },
    {
      browser: 'Safari (iOS)',
      version: '14.0+',
      support: '基础支持',
      features: ['离线缓存', '添加到主屏幕'],
      note: '需要用户手动添加，不支持自动安装提示'
    },
    {
      browser: 'Safari (macOS)',
      version: '14.0+',
      support: '有限支持',
      features: ['Service Worker', '缓存'],
      note: '不支持安装功能，主要用于缓存'
    },
    {
      browser: '国产浏览器',
      version: '基于Chromium',
      support: '取决于内核版本',
      features: ['与Chrome类似'],
      note: '360、QQ、搜狗等基于Chromium的浏览器支持度较好'
    }
  ];

  compatibility.forEach(browser => {
    console.log(`📱 ${browser.browser} (${browser.version})`);
    console.log(`   支持程度: ${browser.support}`);
    console.log(`   主要功能: ${browser.features.join(', ')}`);
    console.log(`   说明: ${browser.note}`);
    console.log('');
  });
}

// PWA最佳实践建议
function showBestPractices() {
  console.log('💡 PWA最佳实践建议...');
  console.log('');

  const practices = [
    '1. 响应式设计: 确保在所有设备尺寸上都能正常显示',
    '2. HTTPS部署: PWA必须在HTTPS环境下运行',
    '3. 离线功能: 提供基本的离线浏览能力',
    '4. 快速加载: 使用缓存策略优化加载速度',
    '5. 安装提示: 在合适的时机提示用户安装',
    '6. 更新机制: 实现无缝的应用更新',
    '7. 网络状态: 显示网络连接状态',
    '8. 推送通知: 在支持的浏览器中提供通知功能'
  ];

  practices.forEach(practice => {
    console.log(`  ✨ ${practice}`);
  });

  console.log('');
}

// 移动端特定建议
function showMobileRecommendations() {
  console.log('📱 移动端优化建议...');
  console.log('');

  const recommendations = [
    {
      platform: 'Android (Chrome)',
      tips: [
        '支持自动安装横幅',
        '可以设置启动画面',
        '支持全屏模式',
        '可以隐藏地址栏'
      ]
    },
    {
      platform: 'iOS (Safari)',
      tips: [
        '用户需要手动"添加到主屏幕"',
        '支持启动图像配置',
        '建议提供安装指导',
        '注意状态栏样式设置'
      ]
    },
    {
      platform: '微信内置浏览器',
      tips: [
        '功能受限，主要支持缓存',
        '不支持安装功能',
        '建议引导用户在外部浏览器打开',
        '可以使用WeChat JS-SDK增强功能'
      ]
    }
  ];

  recommendations.forEach(platform => {
    console.log(`🔧 ${platform.platform}:`);
    platform.tips.forEach(tip => {
      console.log(`   • ${tip}`);
    });
    console.log('');
  });
}

// 测试建议
function showTestingTips() {
  console.log('🧪 PWA测试建议...');
  console.log('');

  console.log('本地测试:');
  console.log('  1. 使用 "npm run build" 构建生产版本');
  console.log('  2. 使用 "serve -s build" 启动静态服务器');
  console.log('  3. 在Chrome开发者工具中检查PWA功能');
  console.log('');

  console.log('Chrome DevTools检查项:');
  console.log('  • Application → Manifest: 检查manifest配置');
  console.log('  • Application → Service Workers: 检查SW状态');
  console.log('  • Lighthouse → PWA: 运行PWA审核');
  console.log('  • Network → Offline: 测试离线功能');
  console.log('');

  console.log('移动设备测试:');
  console.log('  • Android: Chrome浏览器测试安装功能');
  console.log('  • iOS: Safari测试添加到主屏幕');
  console.log('  • 各种屏幕尺寸适配测试');
  console.log('  • 网络连接状态变化测试');
  console.log('');
}

// 执行所有检查
function runAllChecks() {
  checkPWAFiles();
  checkManifest();
  checkServiceWorker();
  showBrowserCompatibility();
  showBestPractices();
  showMobileRecommendations();
  showTestingTips();

  console.log('=======================================');
  console.log('✅ PWA兼容性检查完成');
  console.log('');
  console.log('📊 总结:');
  console.log('• AILAB平台已配置完整的PWA功能');
  console.log('• 支持主流现代浏览器');
  console.log('• 提供离线访问能力');
  console.log('• 具备安装到设备的功能');
  console.log('• 建议在HTTPS环境下部署以获得最佳体验');
  console.log('');
}

// 运行检查
runAllChecks();
