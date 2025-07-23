let schools = [
    {
        id: 1,
        name: '北京实验中学',
        code: 'bjsyzx',
        logoUrl: '/assets/schools/bjsyzx-logo.png',
        themeSettings: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
        },
        active: true
    },
    {
        id: 2,
        name: '上海科技高中',
        code: 'shkjgz',
        logoUrl: '/assets/schools/shkjgz-logo.png',
        themeSettings: {
            primaryColor: '#009688',
            secondaryColor: '#ff5722',
        },
        active: true
    }
];
class SchoolController {
    constructor() {
        this.getAllSchools = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    data: schools
                });
            }
            catch (error) {
                console.error('获取校区列表失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取校区列表失败'
                });
            }
        };
        this.getSchoolByCode = async (req, res) => {
            try {
                const { code } = req.params;
                const school = schools.find(s => s.code === code);
                if (!school) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定校区'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: school
                });
            }
            catch (error) {
                console.error('获取校区信息失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取校区信息失败'
                });
            }
        };
        this.createSchool = async (req, res) => {
            try {
                const schoolData = req.body;
                if (!schoolData.name || !schoolData.code) {
                    res.status(400).json({
                        success: false,
                        error: '校区名称和代码不能为空'
                    });
                    return;
                }
                if (schools.some(s => s.code === schoolData.code)) {
                    res.status(400).json({
                        success: false,
                        error: '校区代码已存在'
                    });
                    return;
                }
                const newSchool = {
                    id: schools.length > 0 ? Math.max(...schools.map(s => s.id)) + 1 : 1,
                    name: schoolData.name,
                    code: schoolData.code,
                    logoUrl: schoolData.logoUrl,
                    themeSettings: schoolData.themeSettings || {},
                    active: true
                };
                schools.push(newSchool);
                res.status(201).json({
                    success: true,
                    data: newSchool
                });
            }
            catch (error) {
                console.error('创建校区失败:', error);
                res.status(500).json({
                    success: false,
                    error: '创建校区失败'
                });
            }
        };
        this.updateSchool = async (req, res) => {
            try {
                const { id } = req.params;
                const schoolData = req.body;
                const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
                if (schoolIndex === -1) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定校区'
                    });
                    return;
                }
                schools[schoolIndex] = {
                    ...schools[schoolIndex],
                    ...schoolData,
                    id: schools[schoolIndex].id
                };
                res.status(200).json({
                    success: true,
                    data: schools[schoolIndex]
                });
            }
            catch (error) {
                console.error('更新校区失败:', error);
                res.status(500).json({
                    success: false,
                    error: '更新校区失败'
                });
            }
        };
        this.deleteSchool = async (req, res) => {
            try {
                const { id } = req.params;
                const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
                if (schoolIndex === -1) {
                    res.status(404).json({
                        success: false,
                        error: '找不到指定校区'
                    });
                    return;
                }
                schools.splice(schoolIndex, 1);
                res.status(200).json({
                    success: true,
                    message: '校区已成功删除'
                });
            }
            catch (error) {
                console.error('删除校区失败:', error);
                res.status(500).json({
                    success: false,
                    error: '删除校区失败'
                });
            }
        };
    }
}
export default new SchoolController();
//# sourceMappingURL=school.controller.js.map