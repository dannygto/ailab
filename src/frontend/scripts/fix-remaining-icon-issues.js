const fs = require('fs');
const path = require('path');

function fixRemainingIconIssues() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  let content = fs.readFileSync(iconsPath, 'utf8');
  
  // Remove duplicate exports and fix missing icons
  const fixes = [
    // Remove duplicate CopyIcon export (keep ContentCopyIcon and alias it)
    { from: /export \{ default as CopyIcon \} from '@mui\/icons-material\/ContentCopy';\s*/g, to: '' },
    
    // Fix icon aliases to use correct exported names
    { from: /'copy': CopyIcon,/g, to: "'copy': ContentCopyIcon," },
    { from: /'schedule': ScheduleIcon,/g, to: "'schedule': AccessTimeIcon," },
    { from: /'access': AccessTimeIcon,/g, to: "'access': AccessTimeIcon," },
    { from: /'help': HelpOutlineIcon,/g, to: "'help': HelpOutlineIcon," },
    { from: /'admin': AdminPanelSettingsIcon,/g, to: "'admin': AdminPanelSettingsIcon," }
  ];
  
  fixes.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  fs.writeFileSync(iconsPath, content);
  console.log('Fixed remaining icon export issues');
}

function fixPWAPromptFile() {
  const filePath = path.join(__dirname, '../src/components/common/PWAPrompt.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix missing imports
  const fixes = [
    // Add missing imports
    { 
      from: /import.*?from '\.\.\/\.\.\/utils\/icons';/, 
      to: `import { 
  WifiIcon, 
  CloudOffIcon, 
  RefreshIcon, 
  PhoneAndroidIcon,
  InstallDesktopIcon,
  CloseIcon,
  DownloadIcon
} from '../../utils/icons';` 
    }
  ];
  
  fixes.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed PWAPrompt icon imports');
}

function fixAnalyticsFiles() {
  const files = [
    '../src/components/analytics/NLPAnalytics-fixed.tsx',
    '../src/components/analytics/NLPAnalytics.tsx'
  ];
  
  files.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix CopyIcon import
      content = content.replace(/CopyIcon/g, 'ContentCopyIcon');
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${fileName}`);
    }
  });
}

function addMissingIconExports() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  let content = fs.readFileSync(iconsPath, 'utf8');
  
  // Check if InstallDesktopIcon is missing and add it
  if (!content.includes('InstallDesktopIcon')) {
    const insertPoint = content.indexOf('// 补充缺失的图标');
    if (insertPoint > -1) {
      const beforeInsert = content.substring(0, insertPoint);
      const afterInsert = content.substring(insertPoint);
      
      content = beforeInsert + 
        `export { default as InstallDesktopIcon } from '@mui/icons-material/InstallDesktop';\n` +
        afterInsert;
      
      fs.writeFileSync(iconsPath, content);
      console.log('Added InstallDesktopIcon export');
    }
  }
}

// Main execution
console.log('Fixing remaining icon issues...');

try {
  fixRemainingIconIssues();
  addMissingIconExports();
  fixPWAPromptFile();
  fixAnalyticsFiles();
  console.log('✅ All remaining icon issues fixed!');
} catch (error) {
  console.error('❌ Error during fix:', error);
}
