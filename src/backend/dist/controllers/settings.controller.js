const defaultSchoolInfo = {
    schoolId: 'demo-school-001',
    schoolName: '示范学校',
    schoolType: 'middle_school',
    schoolCode: 'DEMO001',
    principalName: '张校长',
    principalPhone: '010-12345678',
    principalEmail: 'principal@demo-school.edu.cn',
    establishedYear: 1985,
    studentCount: 2000,
    teacherCount: 150,
    classCount: 60,
    schoolAddress: '北京市朝阳区示范路123号',
    schoolPhone: '010-12345678',
    schoolEmail: 'admin@demo-school.edu.cn',
    schoolWebsite: 'www.demo-school.edu.cn',
    schoolFax: '010-12345679',
    logoUrl: '/assets/school-logo.png',
    motto: '求实创新，全面发展',
    description: '一所历史悠久、特色鲜明的现代化学校',
    currentCampus: 'main',
    campuses: [
        {
            id: 'main',
            name: '主校区',
            address: '北京市朝阳区示范路123号',
            phone: '010-12345678',
            contactPerson: '李主任',
            email: 'main@demo-school.edu.cn',
            isMain: true,
            isActive: true,
            studentCount: 1500,
            teacherCount: 100
        }
    ],
    systemName: 'AILAB智能实验教学平台',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    academicYear: '2024-2025',
    semester: '第一学期',
    allowCampusSwitching: true,
    dataIsolation: true,
    edition: 'general',
    version: 'v1.0.0'
};
const defaultSettings = {
    general: {
        siteName: 'AILAB智能实验教学平台',
        logoUrl: '/assets/school-logo.png',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
    },
    theme: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        darkMode: false,
        fontSize: 'medium',
        fontFamily: 'Roboto, sans-serif',
        density: 'standard',
        borderRadius: '4px',
        customCss: '',
    },
    data: {
        defaultPageSize: 10,
        maxUploadSize: 100,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        autoRefresh: true,
        refreshInterval: 30,
        showAnimations: true,
    },
    school: defaultSchoolInfo
};
let currentSettings = { ...defaultSettings };
export const getSettings = async (req, res) => {
    try {
        res.json({
            success: true,
            data: currentSettings
        });
    }
    catch (error) {
        console.error('获取设置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const getGeneralSettings = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                ...currentSettings.general,
                school: currentSettings.school
            }
        });
    }
    catch (error) {
        console.error('获取通用设置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取通用设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const updateGeneralSettings = async (req, res) => {
    try {
        const updates = req.body;
        console.log('接收到的更新数据:', updates);
        if (updates.general || updates.school || (!updates.general && !updates.school)) {
            if (updates.general) {
                currentSettings.general = {
                    ...currentSettings.general,
                    ...updates.general
                };
            }
            if (updates.school) {
                if (updates.school.schoolName === '') {
                    return res.status(400).json({
                        success: false,
                        message: '学校名称不能为空'
                    });
                }
                if (updates.school.principalName === '') {
                    return res.status(400).json({
                        success: false,
                        message: '校长姓名不能为空'
                    });
                }
                if (updates.school.campuses && updates.school.campuses.length > 0) {
                    const hasMainCampus = updates.school.campuses.some((campus) => campus.isMain);
                    if (!hasMainCampus) {
                        updates.school.campuses[0].isMain = true;
                    }
                }
                currentSettings.school = {
                    ...currentSettings.school,
                    ...updates.school
                };
            }
            if (!updates.general && !updates.school) {
                const { language, timezone, autoSave, saveInterval, defaultExperimentDuration, maxFileSize, enableNotifications, enableAnalytics, ...schoolData } = updates;
                if (language || timezone || autoSave !== undefined) {
                    currentSettings.general = {
                        ...currentSettings.general,
                        language: language || currentSettings.general.language,
                        timezone: timezone || currentSettings.general.timezone
                    };
                }
                if (Object.keys(schoolData).length > 0) {
                    currentSettings.school = {
                        ...currentSettings.school,
                        ...schoolData
                    };
                }
            }
        }
        console.log('更新后的设置:', currentSettings);
        res.json({
            success: true,
            message: '设置已保存',
            data: {
                general: currentSettings.general,
                school: currentSettings.school
            }
        });
    }
    catch (error) {
        console.error('更新通用设置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const getThemeSettings = async (req, res) => {
    try {
        res.json({
            success: true,
            data: currentSettings.theme
        });
    }
    catch (error) {
        console.error('获取主题设置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取主题设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const updateThemeSettings = async (req, res) => {
    try {
        const updates = req.body;
        currentSettings.theme = {
            ...currentSettings.theme,
            ...updates
        };
        res.json({
            success: true,
            message: '主题设置已保存',
            data: currentSettings.theme
        });
    }
    catch (error) {
        console.error('更新主题设置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新主题设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const getSchoolInfo = async (req, res) => {
    try {
        res.json({
            success: true,
            data: currentSettings.school
        });
    }
    catch (error) {
        console.error('获取学校信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取学校信息失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const updateSchoolInfo = async (req, res) => {
    try {
        const updates = req.body;
        if (!updates.schoolName) {
            return res.status(400).json({
                success: false,
                message: '学校名称不能为空'
            });
        }
        currentSettings.school = {
            ...currentSettings.school,
            ...updates
        };
        res.json({
            success: true,
            message: '学校信息已保存',
            data: currentSettings.school
        });
    }
    catch (error) {
        console.error('更新学校信息失败:', error);
        res.status(500).json({
            success: false,
            message: '更新学校信息失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const resetSettings = async (req, res) => {
    try {
        currentSettings = { ...defaultSettings };
        res.json({
            success: true,
            message: '设置已重置为默认值',
            data: currentSettings
        });
    }
    catch (error) {
        console.error('重置设置失败:', error);
        res.status(500).json({
            success: false,
            message: '重置设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const getVersionInfo = async (req, res) => {
    try {
        const versionInfo = {
            edition: currentSettings.school.edition,
            version: currentSettings.school.version,
            schoolType: currentSettings.school.schoolType,
            features: getEditionFeatures(currentSettings.school.edition),
            buildTime: new Date().toISOString()
        };
        res.json({
            success: true,
            data: versionInfo
        });
    }
    catch (error) {
        console.error('获取版本信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取版本信息失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
function getEditionFeatures(edition) {
    const baseFeatures = [
        '实验管理',
        '学生管理',
        '教师管理',
        'AI助手',
        '设备管理',
        '数据分析',
        '校区管理',
        '课程模板'
    ];
    switch (edition) {
        case 'vocational':
            return [
                ...baseFeatures,
                '实训管理',
                '技能评估',
                '企业合作',
                '认证管理'
            ];
        case 'higher':
            return [
                ...baseFeatures,
                '研究管理',
                '学术分析',
                '论文管理',
                '实验室预约',
                '研究生管理',
                '协作平台'
            ];
        default:
            return baseFeatures;
    }
}
export const getDemoDataStats = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                students: 150,
                teachers: 25,
                experiments: 48,
                devices: 32
            }
        });
    }
    catch (error) {
        console.error('获取演示数据统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取演示数据统计失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const generateDemoData = async (req, res) => {
    try {
        res.json({
            success: true,
            message: '演示数据生成成功'
        });
    }
    catch (error) {
        console.error('生成演示数据失败:', error);
        res.status(500).json({
            success: false,
            message: '生成演示数据失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const deleteDemoData = async (req, res) => {
    try {
        res.json({
            success: true,
            message: '演示数据删除成功'
        });
    }
    catch (error) {
        console.error('删除演示数据失败:', error);
        res.status(500).json({
            success: false,
            message: '删除演示数据失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const generateDockerDeployment = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Docker部署配置生成成功'
        });
    }
    catch (error) {
        console.error('生成Docker部署配置失败:', error);
        res.status(500).json({
            success: false,
            message: '生成Docker部署配置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const resetAllSettings = async (req, res) => {
    try {
        currentSettings = { ...defaultSettings };
        res.json({
            success: true,
            message: '所有设置已重置为默认值',
            data: currentSettings
        });
    }
    catch (error) {
        console.error('重置所有设置失败:', error);
        res.status(500).json({
            success: false,
            message: '重置所有设置失败',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export default {
    getSettings,
    getGeneralSettings,
    updateGeneralSettings,
    getThemeSettings,
    updateThemeSettings,
    getSchoolInfo,
    updateSchoolInfo,
    resetSettings,
    getVersionInfo,
    getDemoDataStats,
    generateDemoData,
    deleteDemoData,
    generateDockerDeployment,
    resetAllSettings,
    getAllSettings: getSettings,
    getDataSettings: getSettings,
    updateDataSettings: updateGeneralSettings
};
//# sourceMappingURL=settings.controller.js.map