/**
 * 文档编码检查和修复工具
 *
 * 用途：
 * 1. 扫描项目中的Markdown文件
 * 2. 检测可能存在乱码的文件
 * 3. 生成修复建议报告
 *
 * 使用方法：
 * node check-document-encoding.js [修复模式]
 *
 * 参数：
 * 修复模式 - 如果传入 --fix，则尝试自动修复发现的乱码文件
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// 使用 promisify 转换 fs 的回调函数
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// 是否启用修复模式
const fixMode = process.argv.includes('--fix');

// 常见的乱码字符序列及其可能对应的中文
const brokenPatterns = [
  {pattern: /浜哄伐鏅鸿兘/g, replacement: '人工智能'},
  {pattern: /瀹為獙骞冲彴/g, replacement: '实验平台'},
  {pattern: /閮ㄧ讲杩愮淮鎸囧崡/g, replacement: '部署运维指南'},
  {pattern: /椤圭洰/g, replacement: '项目'},
  {pattern: /杩涘害鎶ュ憡/g, replacement: '进度报告'},
  {pattern: /鍩烘湰瀹屾垚/g, replacement: '基本完成'},
  {pattern: /鏂规硶/g, replacement: '方法'},
  {pattern: /寮€鍙戠幆澧/g, replacement: '开发环境'},
  {pattern: /鍚姩/g, replacement: '启动'}
];

// 用于检测文件是否包含乱码的函数
function containsBrokenEncoding(content) {
  return brokenPatterns.some(item => item.pattern.test(content));
}

// 修复文件内容中的乱码
function fixBrokenEncoding(content) {
  let fixedContent = content;

  for (const item of brokenPatterns) {
    fixedContent = fixedContent.replace(item.pattern, item.replacement);
  }

  return fixedContent;
}

// 递归获取目录下的所有Markdown文件
async function getMarkdownFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getMarkdownFiles(res) : res;
  }));

  return files.flat()
    .filter(file => file.endsWith('.md'));
}

// 主函数
async function main() {
  try {
    console.log('正在扫描项目文档...');

    // 获取项目根目录
    const rootDir = path.resolve(__dirname, '../..');

    // 获取所有Markdown文件
    const markdownFiles = await getMarkdownFiles(rootDir);
    console.log(`找到 ${markdownFiles.length} 个Markdown文件`);

    // 检查每个文件是否有乱码
    const suspiciousFiles = [];
    const fixedFiles = [];

    for (const file of markdownFiles) {
      try {
        const content = await readFile(file, 'utf8');

        if (containsBrokenEncoding(content)) {
          suspiciousFiles.push(file);

          if (fixMode) {
            // 尝试修复文件
            const fixedContent = fixBrokenEncoding(content);
            await writeFile(file, fixedContent, 'utf8');
            fixedFiles.push(file);
            console.log(`已修复: ${file}`);
          }
        }
      } catch (err) {
        console.error(`处理文件 ${file} 时出错:`, err);
      }
    }

    // 输出结果
    console.log('\n检查结果:');
    console.log(`发现 ${suspiciousFiles.length} 个可能存在乱码的文件`);

    if (suspiciousFiles.length > 0) {
      console.log('\n可疑文件列表:');
      suspiciousFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${path.relative(rootDir, file)}`);
      });
    }

    if (fixMode) {
      console.log(`\n已修复 ${fixedFiles.length} 个文件`);
    } else if (suspiciousFiles.length > 0) {
      console.log('\n若要自动修复这些文件，请运行:');
      console.log('node check-document-encoding.js --fix');
    }

    // 生成报告
    if (suspiciousFiles.length > 0) {
      const reportContent = generateReport(rootDir, suspiciousFiles, fixedFiles);
      const reportPath = path.join(rootDir, 'encoding-check-report.md');
      await writeFile(reportPath, reportContent, 'utf8');
      console.log(`\n已生成报告: ${reportPath}`);
    }

  } catch (err) {
    console.error('执行过程中出错:', err);
  }
}

// 生成检查报告
function generateReport(rootDir, suspiciousFiles, fixedFiles) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  let report = `# 文档编码检查报告\n\n`;
  report += `## 检查日期\n\n${dateStr}\n\n`;

  report += `## 检查结果\n\n`;
  report += `- 总共发现 ${suspiciousFiles.length} 个可能存在乱码的文件\n`;
  report += `- 已修复 ${fixedFiles.length} 个文件\n\n`;

  if (suspiciousFiles.length > 0) {
    report += `## 可疑文件列表\n\n`;
    suspiciousFiles.forEach((file, index) => {
      const relativePath = path.relative(rootDir, file);
      report += `${index + 1}. \`${relativePath}\`\n`;
    });
    report += '\n';
  }

  if (fixedFiles.length > 0) {
    report += `## 已修复文件列表\n\n`;
    fixedFiles.forEach((file, index) => {
      const relativePath = path.relative(rootDir, file);
      report += `${index + 1}. \`${relativePath}\`\n`;
    });
    report += '\n';
  }

  report += `## 建议\n\n`;
  report += `1. 确保所有文档统一使用 UTF-8 编码\n`;
  report += `2. 配置编辑器默认使用 UTF-8 编码保存文件\n`;
  report += `3. 添加 .editorconfig 文件到项目根目录，统一团队编码设置\n`;

  return report;
}

// 执行主函数
main();
