const fs = require('fs');
const path = require('path');

// 定义需要修复的图标映射
const iconMappings = {
  'ScienceIconIcon': 'ScienceIcon',
  'DevicesIconIcon': 'DevicesIcon',  
  'AssessmentIconIcon': 'AssessmentIcon',
  'NotificationsIconIcon': 'NotificationsIcon',
  'AccountCircleIconIcon': 'AccountCircleIcon',
  'StorageIconIcon': 'StorageIcon',
  'SchoolIconIcon': 'SchoolIcon',
  'ExpandMoreIconIcon': 'ExpandMoreIcon',
  'ExpandLessIconIcon': 'ExpandLessIcon',
  'VisibilityIconIcon': 'VisibilityIcon',
  'VisibilityIconOffIcon': 'VisibilityOffIcon',
  'EmailIconIcon': 'EmailIcon',
  'PaletteIconIcon': 'PaletteIcon',
  'FilterListIconIcon': 'FilterListIcon',
  'FullscreenIconIcon': 'FullscreenIcon',
  'RestoreIconIcon': 'RestoreIcon',
  'CloudUploadIconIcon': 'CloudUploadIcon',
  'BackupIconIcon': 'BackupIcon',
  'LanguageIconIcon': 'LanguageIcon',
  'CheckIconCircleIconIconIcon': 'CheckCircleIcon',
  'CheckIconCircleIconIconOutlineIcon': 'CheckCircleOutlineIcon',
  'GetAppIconIcon': 'GetAppIcon'
};

// 定义属性映射
const propertyMappings = {
  'TitleIcon': 'title',
  'CheckIconed': 'checked',
  'HelpIconerText': 'helperText',
  'disableRestoreIconFocus': 'disableRestoreFocus'
};

// 定义事件处理器映射
const eventMappings = {
  'ChangeEventIcon': 'ChangeEvent',
  'FormEventIcon': 'FormEvent', 
  'SyntheticEventIcon': 'SyntheticEvent',
  'MouseEventIcon': 'MouseEvent',
  'SelectChangeEventIcon': 'SelectChangeEvent'
};

// 定义Typography variant映射
const variantMappings = {
  'subTitleIcon1': 'subtitle1',
  'subTitleIcon2': 'subtitle2'
};

// 定义MUI组件映射
const componentMappings = {
  'CheckIconbox': 'Checkbox',
  'DialogTitleIcon': 'DialogTitle',
  'FormHelpIconerText': 'FormHelperText',
  'DragIndicatorIcon': 'DragIndicator'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // 修复图标导入
  for (const [wrong, correct] of Object.entries(iconMappings)) {
    const regex = new RegExp(wrong, 'g');
    if (content.includes(wrong)) {
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed icon: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复属性名称
  for (const [wrong, correct] of Object.entries(propertyMappings)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    if (content.includes(wrong)) {
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed property: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复事件处理器
  for (const [wrong, correct] of Object.entries(eventMappings)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    if (content.includes(wrong)) {
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed event: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复Typography variants
  for (const [wrong, correct] of Object.entries(variantMappings)) {
    const regex = new RegExp(`"${wrong}"`, 'g');
    if (content.includes(`"${wrong}"`)) {
      content = content.replace(regex, `"${correct}"`);
      changed = true;
      console.log(`Fixed variant: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复MUI组件名称
  for (const [wrong, correct] of Object.entries(componentMappings)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    if (content.includes(wrong)) {
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed component: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复特定的错误模式
  // 修复 localStorageIcon -> localStorage
  if (content.includes('localStorageIcon')) {
    content = content.replace(/localStorageIcon/g, 'localStorage');
    changed = true;
    console.log(`Fixed localStorage in ${filePath}`);
  }
  
  // 修复 MemoryIconRouter -> MemoryRouter
  if (content.includes('MemoryIconRouter')) {
    content = content.replace(/MemoryIconRouter/g, 'MemoryRouter');
    changed = true;
    console.log(`Fixed MemoryRouter in ${filePath}`);
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function fixDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

// 开始修复
const srcDir = path.join(__dirname, 'src');
console.log('Starting icon and type fixes...');
fixDirectory(srcDir);
console.log('Finished fixing files.');
