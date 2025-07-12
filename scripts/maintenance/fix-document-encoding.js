/**
 * 文档编码修复脚本
 * 将存在乱码的Markdown文件重新编码为UTF-8
 */

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

// 待修复的文件列表
const filesToFix = [
  'docs/03-部署指南/部署指南.md',
  'docs/03-部署指南/启动指南.md',
  'docs/05-项目管理/进度报告.md',
  'docs/01-项目概述/项目概述.md'
];

// 乱码检测和替换映射 - 常见的乱码模式
const encodingFixMap = {
  // 常见乱码字符替换 - 根据上面文件中的模式整理
  '浜哄伐鏅鸿兘': '人工智能',
  '瀹為獙骞冲彴': '实验平台',
  '閮ㄧ讲杩愮淮鎸囧崡': '部署运维指南',
  '椤圭洰': '项目',
  '杩涘害鎶ュ憡': '进度报告',
  '鏈枃妗': '本文档',
  '蹇€熷惎鍔': '快速启动',
  '馃殌': '🚀',
  '鉁?': '✅',
  '馃搵': '📋',
  '馃帀': '🌐',
  '馃搳': '📊',
  '馃幆': '🔄',
  '骞': '年',
  '鏈': '月',
  '鏃': '日',
  '鍩烘湰瀹屾垚': '基本完成',
  '浜や粯瀹屾垚': '交付完成',
  '鍛戒护琛屽惎鍔': '命令行启动',
  '宸插畬鎴': '已完成',
  '鍔熻兘妯″潡': '功能模块',
  '鐢ㄦ埛绠＄悊': '用户管理',
  '娉ㄥ唽': '注册',
  '绯荤粺': '系统',
  '鐗堟湰': '版本',
  '褰撳墠': '当前',
  '璇曠幆澧': '试环境',
  '寮€鍙戠幆澧': '开发环境',
  '鐢熶骇鐜': '生产环境',
  '鏂规硶': '方法'
};

function fixEncodingInContent(content) {
  // 尝试检测是否是常见的乱码模式
  let fixedContent = content;
  
  // 应用乱码修复映射
  Object.keys(encodingFixMap).forEach(brokenText => {
    fixedContent = fixedContent.replace(new RegExp(brokenText, 'g'), encodingFixMap[brokenText]);
  });
  
  return fixedContent;
}

function fixFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`文件不存在: ${fullPath}`);
    return false;
  }
  
  try {
    // 读取原始文件内容
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 进行乱码修复
    const fixedContent = fixEncodingInContent(content);
    
    // 创建修复后的文件名（临时文件）
    const fileDir = path.dirname(fullPath);
    const fileName = path.basename(fullPath, path.extname(fullPath));
    const fixedFilePath = path.join(fileDir, `${fileName}-fixed${path.extname(fullPath)}`);
    
    // 写入修复后的内容
    fs.writeFileSync(fixedFilePath, fixedContent, 'utf8');
    
    console.log(`文件修复完成: ${fixedFilePath}`);
    return true;
  } catch (error) {
    console.error(`处理文件时出错: ${fullPath}`, error);
    return false;
  }
}

// 运行修复
console.log('开始修复文档编码问题...');
let successCount = 0;

filesToFix.forEach(file => {
  if (fixFile(file)) {
    successCount++;
  }
});

console.log(`修复完成! 成功修复 ${successCount}/${filesToFix.length} 个文件`);
