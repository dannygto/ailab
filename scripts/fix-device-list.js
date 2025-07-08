const fs = require('fs');
const path = require('path');

// Fix DeviceList.tsx
const filePath = path.join(__dirname, '../frontend/src/components/devices/DeviceList.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all <div sx={...}> with <Box sx={...}>
    content = content.replace(/<div\s+sx=\{/g, '<Box sx={');
    
    // Fix closing tags
    let lines = content.split('\n');
    let openBoxCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Count <Box openings
        const boxOpenings = (line.match(/<Box(\s|>)/g) || []).length;
        openBoxCount += boxOpenings;
        
        // Count </Box> closings
        const boxClosings = (line.match(/<\/Box>/g) || []).length;
        openBoxCount -= boxClosings;
        
        // If we have open boxes and find a </div>, it might need to be </Box>
        if (openBoxCount > 0 && line.includes('</div>')) {
            // Only replace if this line doesn't have a corresponding <div> opening
            if (!line.includes('<div')) {
                lines[i] = line.replace('</div>', '</Box>');
                console.log(`Fixed closing tag in line ${i + 1}: ${line.trim()}`);
            }
        }
    }
    
    content = lines.join('\n');
    
    // Make sure Box is imported
    const muiImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/);
    if (muiImportMatch) {
        const imports = muiImportMatch[1];
        if (!imports.includes('Box')) {
            const newImports = imports.trim() + ', Box';
            content = content.replace(muiImportMatch[0], `import { ${newImports} } from '@mui/material'`);
            console.log('Added Box import');
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed DeviceList.tsx');
    
} catch (error) {
    console.error('Error fixing DeviceList.tsx:', error);
}
