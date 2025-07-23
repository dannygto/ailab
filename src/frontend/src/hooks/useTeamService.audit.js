/**
 * 团队资源服务钩子扩展 - 审计日志相关功能
 * 用于处理团队资源共享及访问日志的API调用
 */

// 注意：这些函数应该集成到现有的useTeamService钩子中
// 以下是需要添加到useTeamService.js的函数

/**
 * 获取资源访问日志
 * @param {string} resourceId 资源ID
 * @param {Object} params 查询参数（可选）
 * @returns {Promise} API响应
 */
const getResourceAccessLogs = async (resourceId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/team-resources/access-logs/${resourceId}`,
      {
        params,
        headers: authHeaders
      }
    );
    return response.data;
  } catch (error) {
    console.error('获取资源访问日志失败:', error);
    throw error;
  }
};

/**
 * 获取团队访问日志
 * @param {string} teamId 团队ID
 * @param {Object} params 查询参数（可选）
 * @returns {Promise} API响应
 */
const getTeamAccessLogs = async (teamId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/team-resources/team-access-logs/${teamId}`,
      {
        params,
        headers: authHeaders
      }
    );
    return response.data;
  } catch (error) {
    console.error('获取团队访问日志失败:', error);
    throw error;
  }
};

// 将这些方法添加到useTeamService钩子的返回对象中：
//
// return {
//   ...其他方法,
//   getResourceAccessLogs,
//   getTeamAccessLogs
// };
