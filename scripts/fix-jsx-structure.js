const fs = require('fs');
const path = require('path');

// 修复剩余的JSX结构问题
function fixJSXStructure(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 检查是否有未匹配的 <div> 标签
        const lines = content.split('\n');
        let divStack = [];
        let boxStack = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 检查 <div> 开启标签（排除自闭合的）
            const divOpenMatches = line.match(/<div(?:[^>]*(?!\/\s*>)[^>]*)>/g);
            if (divOpenMatches) {
                divOpenMatches.forEach(() => divStack.push(i + 1));
            }
            
            // 检查 <Box> 开启标签（排除自闭合的）
            const boxOpenMatches = line.match(/<Box(?:[^>]*(?!\/\s*>)[^>]*)>/g);
            if (boxOpenMatches) {
                boxOpenMatches.forEach(() => boxStack.push(i + 1));
            }
            
            // 检查 </div> 闭合标签
            const divCloseMatches = line.match(/<\/div>/g);
            if (divCloseMatches) {
                divCloseMatches.forEach(() => {
                    if (divStack.length > 0) {
                        divStack.pop();
                    } else if (boxStack.length > 0) {
                        // 如果没有开放的div但有开放的Box，这个</div>应该是</Box>
                        lines[i] = line.replace('</div>', '</Box>');
                        modified = true;
                        boxStack.pop();
                        console.log(`第${i + 1}行: 修复了未匹配的</div>为</Box>`);
                    }
                });
            }
            
            // 检查 </Box> 闭合标签
            const boxCloseMatches = line.match(/<\/Box>/g);
            if (boxCloseMatches) {
                boxCloseMatches.forEach(() => {
                    if (boxStack.length > 0) {
                        boxStack.pop();
                    }
                });
            }
        }
        
        // 如果有未闭合的标签，尝试修复
        if (divStack.length > 0) {
            console.log(`警告: ${path.basename(filePath)} 有${divStack.length}个未闭合的<div>标签`);
        }
        if (boxStack.length > 0) {
            console.log(`警告: ${path.basename(filePath)} 有${boxStack.length}个未闭合的<Box>标签`);
        }
        
        if (modified) {
            content = lines.join('\n');
            fs.writeFileSync(filePath, content);
            console.log(`修复了 ${path.basename(filePath)}`);
        }
        
        return modified;
    } catch (error) {
        console.error(`修复${filePath}时出错:`, error.message);
        return false;
    }
}

// 需要修复的文件
const filesToFix = [
    '../frontend/src/components/devices/DeviceReservations.tsx',
    '../frontend/src/components/domain/devices/DeviceDetailDialog.tsx'
];

console.log('开始修复JSX结构问题...');

filesToFix.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        fixJSXStructure(fullPath);
    } else {
        console.log(`文件不存在: ${fullPath}`);
    }
});

console.log('JSX结构修复完成');
