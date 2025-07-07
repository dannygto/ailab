import {
  GuidanceSuggestion,
  GuidanceSession,
  GuidanceSuggestionType,
  AIGuidanceResponse,
  GenerateGuidanceRequest
} from '../types/guidance';
import { apiService } from '../types/api';

/**
 * 智能指导系统服务�?
 * 提供指导建议获取、AI生成指导、会话历史等功能
 */
export class GuidanceService {
  private apiService: apiService;
  
  constructor(apiService: apiService) {
    this.apiService = apiService;
  }
  
  /**
   * 获取指导建议列表
   */
  async getGuidanceSuggestions(params?: {
    type?: GuidanceSuggestionType;
    importance?: number;
    limit?: number;
    page?: number;
  }): Promise<GuidanceSuggestion[]> {
    return this.apiService.get('/guidance/suggestions', params);
  }
  
  /**
   * 获取指导建议详情
   */
  async getGuidanceSuggestionById(id: string): Promise<GuidanceSuggestion> {
    return this.apiService.get(`/guidance/suggestions/${id}`);
  }
  
  /**
   * 创建指导建议
   */
  async createGuidanceSuggestion(suggestionData: Partial<GuidanceSuggestion>): Promise<GuidanceSuggestion> {
    return this.apiService.post('/guidance/suggestions', suggestionData);
  }
  
  /**
   * 更新指导建议
   */
  async updateGuidanceSuggestion(id: string, suggestionData: Partial<GuidanceSuggestion>): Promise<GuidanceSuggestion> {
    return this.apiService.put(`/guidance/suggestions/${id}`, suggestionData);
  }
  
  /**
   * 删除指导建议
   */
  async deleteGuidanceSuggestion(id: string): Promise<{ success: boolean }> {
    return this.apiService.delete(`/guidance/suggestions/${id}`);
  }
  
  /**
   * 生成AI指导
   */
  async generateAIGuidance(requestData: GenerateGuidanceRequest): Promise<AIGuidanceResponse> {
    return this.apiService.post('/guidance/generate', requestData);
  }
  
  /**
   * 获取指导会话历史
   */
  async getGuidanceSessionHistory(sessionId: string): Promise<GuidanceSession> {
    return this.apiService.get(`/guidance/sessions/${sessionId}`);
  }
  
  /**
   * 添加学生问题到会�?
   */
  async addStudentQuestion(sessionId: string, question: string): Promise<{
    id: string;
    question: string;
    answer: string;
    timestamp: string;
  }> {
    return this.apiService.post(`/guidance/sessions/${sessionId}/questions`, { question });
  }
  
  /**
   * 创建新的指导会话
   */
  async createGuidanceSession(experimentId: string, studentId: string): Promise<GuidanceSession> {
    return this.apiService.post('/guidance/sessions', { experimentId, studentId });
  }
  
  /**
   * 结束指导会话
   */
  async endGuidanceSession(sessionId: string, summary?: string): Promise<GuidanceSession> {
    return this.apiService.put(`/guidance/sessions/${sessionId}/end`, { summary });
  }
  
  /**
   * 获取学生的所有指导会�?
   */
  async getStudentGuidanceSessions(studentId: string): Promise<GuidanceSession[]> {
    return this.apiService.get('/guidance/sessions', { studentId });
  }
  
  /**
   * 获取学习进度
   */
  async getLearningProgress(studentId: string, subjectId?: string): Promise<any> {
    return this.apiService.get('/guidance/learning-progress', { studentId, subjectId });
  }
}
