#!/usr/bin/env python3
"""
TypeScript错误批量修复脚本
修复sx属性、图标导入、API方法等问题
"""

import os
import re
import glob

def fix_sx_attributes(content):
    """修复sx属性 - 将div的sx替换为Box或移除sx"""
    # 将带sx属性的div替换为Box
    pattern = r'<div\s+sx=\{([^}]+)\}'
    replacement = r'<Box sx={\1}'
    content = re.sub(pattern, replacement, content)
    
    # 确保导入Box
    if '<Box' in content and 'import' in content and 'Box' not in content:
        # 在Material-UI导入中添加Box
        mui_import_pattern = r'(import\s*\{[^}]*)\}\s*from\s*[\'"]@mui/material[\'"]'
        def add_box(match):
            imports = match.group(1)
            if 'Box' not in imports:
                return imports + ', Box} from \'@mui/material\''
            return match.group(0)
        content = re.sub(mui_import_pattern, add_box, content)
        
        # 如果没有Material-UI导入，添加Box导入
        if 'from \'@mui/material\'' not in content:
            first_import = re.search(r'^import.*$', content, re.MULTILINE)
            if first_import:
                content = content[:first_import.end()] + '\nimport { Box } from \'@mui/material\';' + content[first_import.end():]
    
    return content

def fix_icon_imports(content):
    """修复图标导入问题"""
    
    # 修复常见的图标名称错误
    icon_fixes = {
        'visibility': 'VisibilityIcon',
        'email': 'EmailIcon', 
        'devices': 'DevicesIcon',
        'analytics': 'AnalyticsIcon',
        'settings': 'SettingsIcon',
        'share': 'ShareIcon',
        'ScienceIcon': 'Science',
        'logout': 'LogoutIcon',
        'sort': 'SortIcon',
        'restore': 'RestoreIcon',
        'Event': 'EventIcon',
        'HelpIcon': 'HelpOutlineIcon',
        'FiberManualRecordIcon': 'FiberManualRecord',
        'ArrowDownwardIcon': 'ArrowDownward',
        'FormatSizeIcon': 'FormatSize',
        'DragIndicatorIcon': 'DragIndicator',
        'ArticleIcon': 'Article',
        'AutoGraphIcon': 'AutoGraph',
        'LightbulbIcon': 'Lightbulb',
        'MenuBookIcon': 'MenuBook',
        'DataObjectIcon': 'DataObject',
        'FavoriteIcon': 'Favorite',
        'FavoriteBorderIcon': 'FavoriteBorder'
    }
    
    # 替换错误的图标名称
    for wrong_name, correct_name in icon_fixes.items():
        content = re.sub(f'\\b{wrong_name}\\b', correct_name, content)
    
    # 修复icons.ts导入路径
    content = re.sub(r'from\s*[\'"]\.\.\/\.\.\/utils\/icons[\'"]', 'from \'../../utils/icons\'', content)
    content = re.sub(r'from\s*[\'"]\.\.\/utils\/icons[\'"]', 'from \'../utils/icons\'', content)
    
    return content

def fix_api_service_methods(content):
    """修复API服务方法调用"""
    
    # 常见的API方法修复
    api_method_fixes = {
        'api.login': 'authService.login',
        'api.getCurrentUser': 'authService.getCurrentUser', 
        'api.getExperiments': 'experimentService.getExperiments',
        'api.getDevices': 'deviceService.getDevices',
        'api.getTemplates': 'templateService.getTemplates',
        'api.getResources': 'resourceService.getResources',
        'api.getDashboardStats': 'api.get(\'/dashboard/stats\')',
        'api.getRecentExperiments': 'experimentService.getExperiments',
        'apiService.post': 'api.post',
        'apiService.get': 'api.get',
        'apiService.put': 'api.put',
        'apiService.delete': 'api.delete'
    }
    
    for wrong_method, correct_method in api_method_fixes.items():
        content = re.sub(re.escape(wrong_method), correct_method, content)
    
    return content

def fix_property_errors(content):
    """修复属性错误"""
    
    # 修复常见的属性名错误
    property_fixes = {
        'EmailIcon': 'email',
        'SettingsIcon': 'settings',
        'BackupIconInterval': 'backupInterval',
        'CloudSyncIcon': 'cloudSync',
        'autoBackupIcon': 'autoBackup',
        'CategoryIcon': 'category'
    }
    
    for wrong_prop, correct_prop in property_fixes.items():
        content = re.sub(f'\\.{wrong_prop}\\b', f'.{correct_prop}', content)
    
    return content

def fix_component_attributes(content):
    """修复组件属性错误"""
    
    # 修复常见的属性错误
    content = re.sub(r'textAlign="center"', 'style={{textAlign: "center"}}', content)
    content = re.sub(r'display="flex"', 'style={{display: "flex"}}', content)
    content = re.sub(r'justifyContent="([^"]*)"', r'style={{justifyContent: "\1"}}', content)
    content = re.sub(r'alignItems="([^"]*)"', r'style={{alignItems: "\1"}}', content)
    content = re.sub(r'gap=\{(\d+)\}', r'style={{gap: \1}}', content)
    content = re.sub(r'mb=\{(\d+)\}', r'style={{marginBottom: \1 * 8}}', content)
    
    return content

def fix_typescript_syntax(content):
    """修复TypeScript语法错误"""
    
    # 修复隐式any类型
    content = re.sub(r'\.map\((\w+)\s*=>', r'.map((\1: any) =>', content)
    content = re.sub(r'\.filter\((\w+)\s*=>', r'.filter((\1: any) =>', content)
    content = re.sub(r'\.find\((\w+)\s*=>', r'.find((\1: any) =>', content)
    
    # 修复duplicate identifier错误
    content = re.sub(r'(export\s*\{\s*default\s+as\s+\w+\s*\}[^;]*;)\s*\n\s*\1', r'\1', content)
    
    return content

def fix_module_imports(content):
    """修复模块导入错误"""
    
    # 修复错误的导入路径
    import_fixes = {
        'ExperimentResultsNew': './ExperimentResultsNew',
        'ExperimentDataPanel': './components/ExperimentDataPanel',
        'ExperimentCreateV2': './ExperimentCreateV2',
        'ExperimentCreate': './ExperimentCreate',
        '../components/ai/AIChatInterface': '../components/ai/AIChatInterface',
        './features/licensing': './features/licensing',
        './base/apiService': './base/apiService',
        './fixtures/devices': './fixtures/devices'
    }
    
    for wrong_import, correct_import in import_fixes.items():
        content = re.sub(re.escape(f'from \'{wrong_import}\''), f'from \'{correct_import}\'', content)
        content = re.sub(re.escape(f'from "{wrong_import}"'), f'from "{correct_import}"', content)
    
    return content

def fix_chart_js_imports(content):
    """修复Chart.js导入错误"""
    
    # 修复title导入 - 应该是Title
    content = re.sub(r'import\s*\{([^}]*)\btitle\b([^}]*)\}\s*from\s*[\'"]chart\.js[\'"]', 
                    r'import {\1Title\2} from \'chart.js\'', content)
    
    return content

def process_file(file_path):
    """处理单个文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 应用所有修复
        content = fix_sx_attributes(content)
        content = fix_icon_imports(content)
        content = fix_api_service_methods(content)
        content = fix_property_errors(content)
        content = fix_component_attributes(content)
        content = fix_typescript_syntax(content)
        content = fix_module_imports(content)
        content = fix_chart_js_imports(content)
        
        # 只有内容发生变化时才写入文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
            return True
        
        return False
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """主函数"""
    print("开始修复TypeScript错误...")
    
    # 获取所有TypeScript和TSX文件
    tsx_files = glob.glob('src/**/*.tsx', recursive=True)
    ts_files = glob.glob('src/**/*.ts', recursive=True)
    
    all_files = tsx_files + ts_files
    fixed_count = 0
    
    for file_path in all_files:
        if process_file(file_path):
            fixed_count += 1
    
    print(f"修复完成！共处理 {len(all_files)} 个文件，修复了 {fixed_count} 个文件。")

if __name__ == '__main__':
    main()
