const fs = require('fs');
const path = require('path');

// Find all files with <div sx={...}> and replace with <Box sx={...}>
function findAndReplaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Pattern to match <div with sx prop
        const divSxPattern = /<div(\s+[^>]*?\s+sx=)/g;
        if (divSxPattern.test(content)) {
            content = content.replace(divSxPattern, '<Box$1');
            modified = true;
            console.log(`Found <div sx> in ${filePath}`);
        }
        
        // Pattern to match closing </div> that should be </Box>
        // This is more complex, we need to be careful about nested divs
        // Let's count opening and closing tags to match them properly
        let openBoxCount = 0;
        let lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Count <Box openings
            const boxOpenings = (line.match(/<Box(\s|>)/g) || []).length;
            openBoxCount += boxOpenings;
            
            // Count </Box> closings
            const boxClosings = (line.match(/<\/Box>/g) || []).length;
            openBoxCount -= boxClosings;
            
            // If we have open boxes and find a </div>, it might need to be </Box>
            // But let's be more specific - look for </div> after we've changed <div to <Box
            if (openBoxCount > 0 && line.includes('</div>')) {
                // Only replace if this line doesn't have a corresponding <div> opening
                if (!line.includes('<div')) {
                    lines[i] = line.replace('</div>', '</Box>');
                    modified = true;
                    console.log(`Fixed closing tag in ${filePath} line ${i + 1}`);
                }
            }
        }
        
        if (modified) {
            content = lines.join('\n');
            
            // Make sure Box is imported
            if (!content.includes('import') || !content.includes('Box')) {
                // Check if there's already a MUI import
                const muiImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/);
                if (muiImportMatch) {
                    const imports = muiImportMatch[1];
                    if (!imports.includes('Box')) {
                        const newImports = imports.trim() + ', Box';
                        content = content.replace(muiImportMatch[0], `import { ${newImports} } from '@mui/material'`);
                        console.log(`Added Box import to ${filePath}`);
                    }
                } else {
                    // Add new import for Box
                    const importInsertPoint = content.search(/import\s+React/);
                    if (importInsertPoint !== -1) {
                        const beforeImport = content.substring(0, importInsertPoint);
                        const afterImport = content.substring(importInsertPoint);
                        content = beforeImport + `import { Box } from '@mui/material';\n` + afterImport;
                        console.log(`Added new Box import to ${filePath}`);
                    }
                }
            }
            
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath}`);
        }
        
        return modified;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Files from the TypeScript errors that have <div sx> issues
const filesToFix = [
    'src/components/common/CopyrightInfo.tsx',
    'src/components/common/EditionBadge.tsx',
    'src/components/common/EditionSwitcher.tsx',
    'src/components/core/molecules/DataTable.tsx',
    'src/components/core/molecules/Form.tsx',
    'src/components/devices/DeviceList.tsx',
    'src/components/devices/DeviceRemoteControl.tsx'
];

console.log('Starting to fix <div sx> to <Box sx> conversions...');

let totalFixed = 0;
filesToFix.forEach(file => {
    const fullPath = path.join(__dirname, '../frontend', file);
    if (fs.existsSync(fullPath)) {
        if (findAndReplaceInFile(fullPath)) {
            totalFixed++;
        }
    } else {
        console.log(`File not found: ${fullPath}`);
    }
});

console.log(`Fixed ${totalFixed} files`);
