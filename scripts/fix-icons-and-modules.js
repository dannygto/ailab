const fs = require('fs');
const path = require('path');

// Fix icons file issues
const iconsFilePath = path.join(__dirname, '../frontend/src/utils/icons.ts');

// Add missing icons that were causing errors
const missingIcons = [
    'export { default as InstallDesktopIcon } from \'@mui/icons-material/InstallDesktop\';',
    'export { default as CacheIcon } from \'@mui/icons-material/Cache\';',
    'export { default as Fab } from \'@mui/material/Fab\';',
    'export { default as InstallIcon } from \'@mui/icons-material/GetApp\';',
    'export { default as DragIndicatorIcon } from \'@mui/icons-material/DragIndicator\';'
];

try {
    let content = fs.readFileSync(iconsFilePath, 'utf8');
    
    // Remove duplicate and malformed exports
    content = content.replace(/export { default as DragIndicatorIconIcon }[^;]+;/g, '');
    content = content.replace(/export { default as restore }[^;]+;/g, '');
    content = content.replace(/export { default as visibility }[^;]+;/g, '');
    content = content.replace(/export { default as settings }[^;]+;/g, '');
    content = content.replace(/export { default as email }[^;]+;/g, '');
    content = content.replace(/export { default as chat }[^;]+;/g, '');
    content = content.replace(/export { default as share }[^;]+;/g, '');
    content = content.replace(/export { default as analytics }[^;]+;/g, '');
    content = content.replace(/export { default as logout }[^;]+;/g, '');
    content = content.replace(/export { default as devices }[^;]+;/g, '');
    content = content.replace(/export { default as Screenshare }[^;]+;/g, '');
    
    // Remove duplicate exports from the end
    content = content.replace(/export { default as CloudOffIcon }[^;]+;(?=[\s\S]*export { default as CloudOffIcon })/g, '');
    content = content.replace(/export { default as PhoneAndroidIcon }[^;]+;(?=[\s\S]*export { default as PhoneAndroidIcon })/g, '');
    content = content.replace(/export { default as NotificationsActiveIcon }[^;]+;(?=[\s\S]*export { default as NotificationsActiveIcon })/g, '');
    content = content.replace(/export { default as ElectricBoltIcon }[^;]+;(?=[\s\S]*export { default as ElectricBoltIcon })/g, '');
    content = content.replace(/export { default as PowerSettingsNewIcon }[^;]+;(?=[\s\S]*export { default as PowerSettingsNewIcon })/g, '');
    content = content.replace(/export { default as ThermostatAutoIcon }[^;]+;(?=[\s\S]*export { default as ThermostatAutoIcon })/g, '');
    content = content.replace(/export { default as WaterDropIcon }[^;]+;(?=[\s\S]*export { default as WaterDropIcon })/g, '');
    content = content.replace(/export { default as BlockIcon }[^;]+;(?=[\s\S]*export { default as BlockIcon })/g, '');
    content = content.replace(/export { default as ReportIcon }[^;]+;(?=[\s\S]*export { default as ReportIcon })/g, '');
    content = content.replace(/export { default as UploadFileIcon }[^;]+;(?=[\s\S]*export { default as UploadFileIcon })/g, '');
    content = content.replace(/export { default as ScreenShareIcon }[^;]+;(?=[\s\S]*export { default as ScreenShareIcon })/g, '');
    content = content.replace(/export { default as SummarizeIcon }[^;]+;(?=[\s\S]*export { default as SummarizeIcon })/g, '');
    content = content.replace(/export { default as CategoryIcon }[^;]+;(?=[\s\S]*export { default as CategoryIcon })/g, '');
    content = content.replace(/export { default as TextFieldsIcon }[^;]+;(?=[\s\S]*export { default as TextFieldsIcon })/g, '');
    content = content.replace(/export { default as BookmarkIcon }[^;]+;(?=[\s\S]*export { default as BookmarkIcon })/g, '');
    content = content.replace(/export { default as BookmarkBorderIcon }[^;]+;(?=[\s\S]*export { default as BookmarkBorderIcon })/g, '');
    content = content.replace(/export { default as LabelIcon }[^;]+;(?=[\s\S]*export { default as LabelIcon })/g, '');
    content = content.replace(/export { default as SortIcon }[^;]+;(?=[\s\S]*export { default as SortIcon })/g, '');
    content = content.replace(/export { default as TitleIcon }[^;]+;(?=[\s\S]*export { default as TitleIcon })/g, '');
    content = content.replace(/export { default as ScheduleIcon }[^;]+;(?=[\s\S]*export { default as ScheduleIcon })/g, '');
    content = content.replace(/export { default as AccessTimeIcon }[^;]+;(?=[\s\S]*export { default as AccessTimeIcon })/g, '');
    content = content.replace(/export { default as LanguageIcon }[^;]+;(?=[\s\S]*export { default as LanguageIcon })/g, '');
    content = content.replace(/export { default as BusinessIcon }[^;]+;(?=[\s\S]*export { default as BusinessIcon })/g, '');
    content = content.replace(/export { default as SchoolIcon }[^;]+;(?=[\s\S]*export { default as SchoolIcon })/g, '');
    content = content.replace(/export { default as SmartToyIcon }[^;]+;(?=[\s\S]*export { default as SmartToyIcon })/g, '');
    content = content.replace(/export { default as VideoLibraryIcon }[^;]+;(?=[\s\S]*export { default as VideoLibraryIcon })/g, '');
    content = content.replace(/export { default as DeleteOutlineIcon }[^;]+;(?=[\s\S]*export { default as DeleteOutlineIcon })/g, '');
    content = content.replace(/export { default as HelpOutlineIcon }[^;]+;(?=[\s\S]*export { default as HelpOutlineIcon })/g, '');
    content = content.replace(/export { default as AdminPanelSettingsIcon }[^;]+;(?=[\s\S]*export { default as AdminPanelSettingsIcon })/g, '');
    
    // Add missing icons before the function definitions
    const functionStartIndex = content.indexOf('// 动态导入函数');
    if (functionStartIndex !== -1) {
        const beforeFunction = content.substring(0, functionStartIndex);
        const afterFunction = content.substring(functionStartIndex);
        
        // Add missing icons
        const missingIconsText = missingIcons.join('\n') + '\n\n';
        content = beforeFunction + missingIconsText + afterFunction;
    }
    
    // Fix the malformed alias mappings
    content = content.replace(/export { default as CloudCheckCircleIcon }[^;]+;/g, '');
    
    // Remove the incomplete getIconComponent function
    content = content.replace(/export const getIconComponent = \(iconName: string\) => {[\s\S]*?return null;\s*};/g, '');
    
    // Fix the file ending
    content = content.replace(/}\s*$/, '');
    
    fs.writeFileSync(iconsFilePath, content);
    console.log('Successfully fixed icons file');
    
} catch (error) {
    console.error('Error fixing icons file:', error);
}

// Fix missing modules by adding empty export statements
const filesToMakeModules = [
    'src/components/alerts/AlertManagement.tsx',
    'src/components/api/ApiTestTool.tsx',
    'src/layouts/MainLayout.tsx'
];

filesToMakeModules.forEach(file => {
    const fullPath = path.join(__dirname, '../frontend', file);
    if (fs.existsSync(fullPath)) {
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Check if it already has exports
            if (!content.includes('export ') && !content.includes('export {')) {
                // Add empty export to make it a module
                content += '\n\nexport {};';
                fs.writeFileSync(fullPath, content);
                console.log(`Added export {} to ${file}`);
            }
        } catch (error) {
            console.error(`Error fixing ${file}:`, error);
        }
    }
});

console.log('Icon and module fixes completed');
