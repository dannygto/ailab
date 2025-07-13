/**
 * AILAB 版本配置文件
 * 部署时根据目标版本生成此文件
 */

// 从环境变量获取版本信息，默认为普教版
const AILAB_EDITION = process.env.AILAB_EDITION || 'general';
const AILAB_SCHOOL_ID = process.env.AILAB_SCHOOL_ID || 'demo-school-001';
const AILAB_SCHOOL_NAME = process.env.AILAB_SCHOOL_NAME || '示范学校';

module.exports = {
  // 版本信息
  edition: AILAB_EDITION,
  version: `1.0.0-${AILAB_EDITION}`,
  buildTime: new Date().toISOString(),

  // 学校信息
  school: {
    id: AILAB_SCHOOL_ID,
    name: AILAB_SCHOOL_NAME,
    deploymentType: 'single-school', // 单校部署
  },

  // 版本特性配置
  features: {
    general: {
      name: '普教版',
      description: '面向普通中小学的AI实验教学平台',
      supportedSchoolTypes: ['elementary', 'middle_school', 'high_school', 'comprehensive'],
      maxStudents: 5000,
      maxTeachers: 500,
      maxCampuses: 10,
      modules: [
        'experiment-management',
        'student-management',
        'teacher-management',
        'ai-assistant',
        'device-management',
        'data-analytics',
        'campus-management',
        'course-template'
      ]
    },

    vocational: {
      name: '职教版',
      description: '面向职业学校的AI实验教学平台',
      supportedSchoolTypes: ['vocational'],
      maxStudents: 8000,
      maxTeachers: 800,
      maxCampuses: 15,
      modules: [
        'experiment-management',
        'student-management',
        'teacher-management',
        'ai-assistant',
        'device-management',
        'data-analytics',
        'campus-management',
        'course-template',
        'skills-training',
        'skill-assessment',
        'enterprise-cooperation',
        'certification-management'
      ]
    },

    higher: {
      name: '高校版',
      description: '面向大学院校的AI实验教学平台',
      supportedSchoolTypes: ['college', 'university'],
      maxStudents: 20000,
      maxTeachers: 2000,
      maxCampuses: 20,
      modules: [
        'experiment-management',
        'student-management',
        'teacher-management',
        'ai-assistant',
        'device-management',
        'data-analytics',
        'campus-management',
        'course-template',
        'research-management',
        'academic-analytics',
        'paper-management',
        'lab-booking',
        'graduate-management',
        'collaboration-platform'
      ]
    }
  },

  // 当前版本配置
  current: function() {
    return {
      ...this.features[this.edition],
      edition: this.edition,
      version: this.version,
      buildTime: this.buildTime,
      school: this.school
    };
  }
};
