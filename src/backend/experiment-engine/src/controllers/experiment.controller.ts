import { Request, Response } from 'express';
import { ExperimentExecutorService } from '../services/experiment-executor.service';
import { logger } from '../utils/logger';

/**
 * 实验执行控制器
 * 处理实验执行相关的API请求
 */
export class ExperimentController {
  private executorService: ExperimentExecutorService;

  constructor() {
    this.executorService = new ExperimentExecutorService();
  }

  /**
   * 获取实验执行状态
   */
  public getExperimentExecution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: '实验ID不能为空'
        });
        return;
      }
      
      // 获取执行状态
      const execution = await this.executorService.getExecutionStatus(id);
      
      if (!execution) {
        res.status(404).json({
          success: false,
          error: '找不到实验执行记录'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: execution
      });
    } catch (error) {
      logger.error('获取实验执行状态失败', error);
      res.status(500).json({
        success: false,
        error: '获取实验执行状态失败'
      });
    }
  };

  /**
   * 获取实验日志
   */
  public getExperimentLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: '实验ID不能为空'
        });
        return;
      }
      
      // 获取执行状态
      const execution = await this.executorService.getExecutionStatus(id);
      
      if (!execution) {
        res.status(404).json({
          success: false,
          error: '找不到实验执行记录'
        });
        return;
      }
      
      // 提取日志并限制数量
      const logs = execution.logs.slice(-limit);
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      logger.error('获取实验日志失败', error);
      res.status(500).json({
        success: false,
        error: '获取实验日志失败'
      });
    }
  };

  /**
   * 获取实验指标
   */
  public getExperimentMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: '实验ID不能为空'
        });
        return;
      }
      
      // 获取执行状态
      const execution = await this.executorService.getExecutionStatus(id);
      
      if (!execution) {
        res.status(404).json({
          success: false,
          error: '找不到实验执行记录'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: execution.metrics
      });
    } catch (error) {
      logger.error('获取实验指标失败', error);
      res.status(500).json({
        success: false,
        error: '获取实验指标失败'
      });
    }
  };
}

export default new ExperimentController();
