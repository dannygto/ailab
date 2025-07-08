const fs = require('fs');
const path = require('path');

function fixSpecificIconIssues() {
  // Fix Card.tsx Typography variant issue
  const cardPath = path.join(__dirname, '../src/components/core/atoms/Card.tsx');
  if (fs.existsSync(cardPath)) {
    let content = fs.readFileSync(cardPath, 'utf8');
    
    // Fix the invalid variant
    content = content.replace(
      /variant={cardSize === CardSize\.SMALL \? 'subTitleIcon1' : 'h6'}/,
      "variant={cardSize === CardSize.SMALL ? 'subtitle1' : 'h6'}"
    );
    
    fs.writeFileSync(cardPath, content);
    console.log('Fixed Card.tsx Typography variant');
  }
  
  // Fix useLocalStorageIcon import issue
  const hooksIndexPath = path.join(__dirname, '../src/components/core/hooks/index.ts');
  if (fs.existsSync(hooksIndexPath)) {
    let content = fs.readFileSync(hooksIndexPath, 'utf8');
    
    // Remove the problematic import
    content = content.replace(/import useLocalStorageIcon from '\.\/useLocalStorageIcon';\s*/g, '');
    
    fs.writeFileSync(hooksIndexPath, content);
    console.log('Fixed hooks index import');
  }
  
  // Create a basic PWAPrompt fix
  const pwaPromptPath = path.join(__dirname, '../src/components/common/PWAPrompt.tsx');
  if (fs.existsSync(pwaPromptPath)) {
    let content = fs.readFileSync(pwaPromptPath, 'utf8');
    
    // Ensure all required icons are imported
    const iconImports = `import { 
  WifiIcon, 
  CloudOffIcon, 
  RefreshIcon, 
  PhoneAndroidIcon,
  InstallDesktopIcon,
  CloseIcon,
  DownloadIcon
} from '../../utils/icons';`;
    
    // Replace existing import
    content = content.replace(
      /import.*?from '\.\.\/\.\.\/utils\/icons';/s,
      iconImports
    );
    
    fs.writeFileSync(pwaPromptPath, content);
    console.log('Fixed PWAPrompt imports');
  }
}

// Run the fixes
console.log('Fixing specific icon issues...');
fixSpecificIconIssues();
console.log('✅ Specific icon issues fixed!');
