/**
 * 校区控制器
 * 处理校区相关的API请求
 */

// 模拟数据
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
  },
  {
    id: 3,
    name: '深圳创新实验学校',
    code: 'szcxsyxx',
    logoUrl: '/assets/schools/szcxsyxx-logo.png',
    themeSettings: {
      primaryColor: '#4caf50',
      secondaryColor: '#ff9800',
    },
    active: true
  }
];

/**
 * 获取所有校区
 */
const getAllSchools = async (req, res) => {
  try {
    console.log('📋 获取所有校区列表');

    // 在实际应用中，这里应该从数据库查询
    res.status(200).json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error('❌ 获取校区列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取校区列表失败'
    });
  }
};

/**
 * 获取特定校区
 */
const getSchoolByCode = async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🔍 获取校区信息: ${code}`);

    const school = schools.find(s => s.code === code);

    if (!school) {
      console.log(`❌ 找不到校区: ${code}`);
      res.status(404).json({
        success: false,
        error: '找不到指定校区'
      });
      return;
    }

    console.log(`✅ 找到校区: ${school.name}`);
    res.status(200).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('❌ 获取校区信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取校区信息失败'
    });
  }
};

/**
 * 创建校区
 */
const createSchool = async (req, res) => {
  try {
    const schoolData = req.body;
    console.log('📝 创建新校区:', schoolData);

    // 验证必填字段
    if (!schoolData.name || !schoolData.code) {
      return res.status(400).json({
        success: false,
        error: '校区名称和代码为必填项'
      });
    }

    // 检查代码是否已存在
    const existingSchool = schools.find(s => s.code === schoolData.code);
    if (existingSchool) {
      return res.status(409).json({
        success: false,
        error: '校区代码已存在'
      });
    }

    // 创建新校区
    const newSchool = {
      id: Math.max(...schools.map(s => s.id)) + 1,
      name: schoolData.name,
      code: schoolData.code,
      logoUrl: schoolData.logoUrl || '/assets/schools/default-logo.png',
      themeSettings: schoolData.themeSettings || {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      },
      active: schoolData.active !== undefined ? schoolData.active : true
    };

    schools.push(newSchool);

    console.log('✅ 校区创建成功:', newSchool);
    res.status(201).json({
      success: true,
      data: newSchool
    });
  } catch (error) {
    console.error('❌ 创建校区失败:', error);
    res.status(500).json({
      success: false,
      error: '创建校区失败'
    });
  }
};

/**
 * 更新校区
 */
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log(`📝 更新校区 ID: ${id}`, updateData);

    const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
    if (schoolIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '找不到指定校区'
      });
    }

    // 更新校区信息
    schools[schoolIndex] = {
      ...schools[schoolIndex],
      ...updateData,
      id: parseInt(id) // 确保ID不被更改
    };

    console.log('✅ 校区更新成功:', schools[schoolIndex]);
    res.status(200).json({
      success: true,
      data: schools[schoolIndex]
    });
  } catch (error) {
    console.error('❌ 更新校区失败:', error);
    res.status(500).json({
      success: false,
      error: '更新校区失败'
    });
  }
};

/**
 * 删除校区
 */
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  删除校区 ID: ${id}`);

    const schoolIndex = schools.findIndex(s => s.id === parseInt(id));
    if (schoolIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '找不到指定校区'
      });
    }

    const deletedSchool = schools[schoolIndex];
    schools.splice(schoolIndex, 1);

    console.log('✅ 校区删除成功:', deletedSchool);
    res.status(200).json({
      success: true,
      message: '校区删除成功'
    });
  } catch (error) {
    console.error('❌ 删除校区失败:', error);
    res.status(500).json({
      success: false,
      error: '删除校区失败'
    });
  }
};

export {
  getAllSchools,
  getSchoolByCode,
  createSchool,
  updateSchool,
  deleteSchool
};

// 默认导出
export default {
  getAllSchools,
  getSchoolByCode,
  createSchool,
  updateSchool,
  deleteSchool
};
