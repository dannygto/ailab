import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  Experiment, 
  ExperimentExecution, 
  ExecutionStatus, 
  ExecutionLog, 
  ExecutionMetrics,
  ExperimentType 
} from '@/types/experiment';
import { logger } from '@/utils/logger';
import { DatabaseManager } from '@/config/database';

export class ExperimentExecutorService {
  private dbManager: DatabaseManager;
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private executionCache: Map<string, ExperimentExecution> = new Map();

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  /**
   * 启动实验执行
   */
  async startExperiment(experiment: Experiment): Promise<ExperimentExecution> {
    const executionId = uuidv4();
    
    try {
      logger.info(`Starting experiment execution: ${executionId} for experiment: ${experiment.id}`);

      // 创建执行记录
      const execution: ExperimentExecution = {
        id: executionId,
        experimentId: experiment.id,
        status: 'preparing',
        progress: 0,
        currentEpoch: 0,
        totalEpochs: experiment.parameters.epochs,
        logs: [],
        metrics: {
          currentLoss: 0,
          currentAccuracy: 0,
          currentValLoss: 0,
          currentValAccuracy: 0,
          learningRate: experiment.parameters.learningRate,
          timeElapsed: 0,
          eta: 0,
        },
        startedAt: new Date(),
        updatedAt: new Date(),
      };

      // 保存执行记录
      await this.saveExecution(execution);
      this.executionCache.set(executionId, execution);

      // 准备实验环境
      await this.prepareExperimentEnvironment(experiment);

      // 启动Python进程执行实验
      const process = await this.startPythonProcess(experiment, executionId);

      // 更新状态为运行中
      execution.status = 'running';
      execution.updatedAt = new Date();
      await this.updateExecution(execution);

      // 保存进程引用
      this.runningProcesses.set(executionId, process);

      logger.info(`Experiment execution started: ${executionId}`);
      return execution;

    } catch (error) {
      logger.error(`Failed to start experiment: ${experiment.id}`, error);
      
      // 更新执行状态为失败
      const execution = this.executionCache.get(executionId);
      if (execution) {
        execution.status = 'failed';
        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Failed to start experiment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        await this.updateExecution(execution);
      }

      throw error;
    }
  }

  /**
   * 准备实验环境
   */
  private async prepareExperimentEnvironment(experiment: Experiment): Promise<void> {
    const experimentDir = path.join(process.env.EXPERIMENT_DIR || 'experiments', experiment.id);
    
    try {
      // 创建实验目录
      await fs.ensureDir(experimentDir);
      
      // 创建实验配置文件
      const config = this.generateExperimentConfig(experiment);
      await fs.writeJson(path.join(experimentDir, 'config.json'), config, { spaces: 2 });
      
      // 复制数据集（如果存在）
      if (experiment.data.datasetPath) {
        const datasetPath = path.join(experimentDir, 'dataset');
        await fs.copy(experiment.data.datasetPath, datasetPath);
      }
      
      // 创建Python脚本
      const pythonScript = this.generatePythonScript(experiment);
      await fs.writeFile(path.join(experimentDir, 'run_experiment.py'), pythonScript);
      
      logger.info(`Experiment environment prepared: ${experimentDir}`);
    } catch (error) {
      logger.error(`Failed to prepare experiment environment: ${experiment.id}`, error);
      throw error;
    }
  }

  /**
   * 生成实验配置
   */
  private generateExperimentConfig(experiment: Experiment): any {
    return {
      experiment_id: experiment.id,
      name: experiment.name,
      type: experiment.type,
      parameters: experiment.parameters,
      data: experiment.data,
      output_dir: path.join(process.env.EXPERIMENT_DIR || 'experiments', experiment.id, 'output'),
      log_dir: path.join(process.env.EXPERIMENT_DIR || 'experiments', experiment.id, 'logs'),
    };
  }

  /**
   * 生成Python执行脚本
   */
  private generatePythonScript(experiment: Experiment): string {
    const scriptTemplate = this.getScriptTemplate(experiment.type);
    
    return scriptTemplate
      .replace('{{EXPERIMENT_ID}}', experiment.id)
      .replace('{{MODEL_TYPE}}', experiment.parameters.modelType)
      .replace('{{BATCH_SIZE}}', experiment.parameters.batchSize.toString())
      .replace('{{LEARNING_RATE}}', experiment.parameters.learningRate.toString())
      .replace('{{EPOCHS}}', experiment.parameters.epochs.toString());
  }

  /**
   * 获取脚本模板
   */
  private getScriptTemplate(experimentType: ExperimentType): string {
    switch (experimentType) {
      case 'image_classification':
        return this.getImageClassificationTemplate();
      case 'object_detection':
        return this.getObjectDetectionTemplate();
      case 'text_classification':
        return this.getTextClassificationTemplate();
      default:
        return this.getDefaultTemplate();
    }
  }

  /**
   * 图像分类实验模板
   */
  private getImageClassificationTemplate(): string {
    return `
import json
import os
import sys
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import matplotlib.pyplot as plt

# 加载配置
with open('config.json', 'r') as f:
    config = json.load(f)

experiment_id = config['experiment_id']
parameters = config['parameters']
data_config = config['data']

# 设置输出目录
output_dir = config['output_dir']
os.makedirs(output_dir, exist_ok=True)

# 数据加载和预处理
def load_data():
    # 这里应该根据实际数据集实现数据加载
    # 示例使用MNIST数据集
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    # 数据预处理
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0
    
    return (x_train, y_train), (x_test, y_test)

# 构建模型
def build_model():
    model = keras.Sequential([
        layers.Flatten(input_shape=(28, 28)),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.2),
        layers.Dense(10, activation="softmax"),
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate={{LEARNING_RATE}}),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    
    return model

# 训练回调
class ExperimentCallback(keras.callbacks.Callback):
    def __init__(self, experiment_id):
        super().__init__()
        self.experiment_id = experiment_id
        self.start_time = time.time()
    
    def on_epoch_end(self, epoch, logs=None):
        # 发送进度更新
        progress = (epoch + 1) / {{EPOCHS}}
        metrics = {
            'currentLoss': logs['loss'],
            'currentAccuracy': logs['accuracy'],
            'currentValLoss': logs['val_loss'],
            'currentValAccuracy': logs['val_accuracy'],
            'timeElapsed': time.time() - self.start_time,
        }
        
        # 这里应该发送到消息队列或WebSocket
        print(f"PROGRESS:{progress}:{json.dumps(metrics)}")

# 主执行函数
def main():
    print(f"Starting experiment: {experiment_id}")
    
    # 加载数据
    (x_train, y_train), (x_test, y_test) = load_data()
    
    # 构建模型
    model = build_model()
    
    # 训练模型
    callback = ExperimentCallback(experiment_id)
    
    history = model.fit(
        x_train, y_train,
        batch_size={{BATCH_SIZE}},
        epochs={{EPOCHS}},
        validation_split=0.2,
        callbacks=[callback],
        verbose=1
    )
    
    # 评估模型
    test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
    
    # 保存结果
    results = {
        'accuracy': test_accuracy,
        'loss': test_loss,
        'training_history': history.history,
    }
    
    with open(os.path.join(output_dir, 'results.json'), 'w') as f:
        json.dump(results, f, indent=2)
    
    # 保存模型
    model.save(os.path.join(output_dir, 'model.h5'))
    
    print(f"Experiment completed: {experiment_id}")
    print(f"Final accuracy: {test_accuracy:.4f}")

if __name__ == "__main__":
    main()
`;
  }

  /**
   * 目标检测实验模板
   */
  private getObjectDetectionTemplate(): string {
    return `
import json
import os
import sys
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras

# 加载配置
with open('config.json', 'r') as f:
    config = json.load(f)

experiment_id = config['experiment_id']
parameters = config['parameters']

print(f"Starting object detection experiment: {experiment_id}")

# 这里实现目标检测实验逻辑
# 可以使用YOLO、SSD等模型

print(f"Object detection experiment completed: {experiment_id}")
`;
  }

  /**
   * 文本分类实验模板
   */
  private getTextClassificationTemplate(): string {
    return `
import json
import os
import sys
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras

# 加载配置
with open('config.json', 'r') as f:
    config = json.load(f)

experiment_id = config['experiment_id']
parameters = config['parameters']

print(f"Starting text classification experiment: {experiment_id}")

# 这里实现文本分类实验逻辑
# 可以使用BERT、LSTM等模型

print(f"Text classification experiment completed: {experiment_id}")
`;
  }

  /**
   * 默认实验模板
   */
  private getDefaultTemplate(): string {
    return `
import json
import os
import sys
import time

# 加载配置
with open('config.json', 'r') as f:
    config = json.load(f)

experiment_id = config['experiment_id']
parameters = config['parameters']

print(f"Starting experiment: {experiment_id}")

# 这里实现自定义实验逻辑

print(f"Experiment completed: {experiment_id}")
`;
  }

  /**
   * 启动Python进程
   */
  private async startPythonProcess(experiment: Experiment, executionId: string): Promise<ChildProcess> {
    const experimentDir = path.join(process.env.EXPERIMENT_DIR || 'experiments', experiment.id);
    const pythonPath = process.env.PYTHON_PATH || 'python';
    
    const process = spawn(pythonPath, ['run_experiment.py'], {
      cwd: experimentDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // 处理标准输出
    process.stdout?.on('data', (data) => {
      const output = data.toString();
      this.handleProcessOutput(executionId, output, 'info');
    });

    // 处理标准错误
    process.stderr?.on('data', (data) => {
      const output = data.toString();
      this.handleProcessOutput(executionId, output, 'error');
    });

    // 处理进程退出
    process.on('close', (code) => {
      this.handleProcessExit(executionId, code);
    });

    // 处理进程错误
    process.on('error', (error) => {
      this.handleProcessError(executionId, error);
    });

    return process;
  }

  /**
   * 处理进程输出
   */
  private handleProcessOutput(executionId: string, output: string, level: 'info' | 'error'): void {
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // 检查是否是进度更新
      if (line.startsWith('PROGRESS:')) {
        this.handleProgressUpdate(executionId, line);
      } else {
        // 记录日志
        this.addExecutionLog(executionId, {
          timestamp: new Date(),
          level,
          message: line,
        });
      }
    }
  }

  /**
   * 处理进度更新
   */
  private async handleProgressUpdate(executionId: string, progressLine: string): Promise<void> {
    try {
      const parts = progressLine.split(':');
      if (parts.length >= 3) {
        const progress = parseFloat(parts[1]);
        const metrics = JSON.parse(parts[2]);
        
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.progress = progress;
          execution.metrics = { ...execution.metrics, ...metrics };
          execution.updatedAt = new Date();
          
          await this.updateExecution(execution);
        }
      }
    } catch (error) {
      logger.error(`Failed to handle progress update: ${executionId}`, error);
    }
  }

  /**
   * 处理进程退出
   */
  private async handleProcessExit(executionId: string, code: number | null): Promise<void> {
    logger.info(`Process exited for execution ${executionId} with code: ${code}`);
    
    const execution = this.executionCache.get(executionId);
    if (execution) {
      execution.status = code === 0 ? 'completed' : 'failed';
      execution.updatedAt = new Date();
      execution.completedAt = new Date();
      
      await this.updateExecution(execution);
    }
    
    this.runningProcesses.delete(executionId);
    this.executionCache.delete(executionId);
  }

  /**
   * 处理进程错误
   */
  private async handleProcessError(executionId: string, error: Error): Promise<void> {
    logger.error(`Process error for execution ${executionId}:`, error);
    
    const execution = this.executionCache.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Process error: ${error.message}`,
      });
      execution.updatedAt = new Date();
      
      await this.updateExecution(execution);
    }
    
    this.runningProcesses.delete(executionId);
    this.executionCache.delete(executionId);
  }

  /**
   * 添加执行日志
   */
  private async addExecutionLog(executionId: string, log: ExecutionLog): Promise<void> {
    const execution = this.executionCache.get(executionId);
    if (execution) {
      execution.logs.push(log);
      execution.updatedAt = new Date();
      
      // 限制日志数量
      if (execution.logs.length > 1000) {
        execution.logs = execution.logs.slice(-1000);
      }
      
      await this.updateExecution(execution);
    }
  }

  /**
   * 停止实验执行
   */
  async stopExperiment(executionId: string): Promise<void> {
    const process = this.runningProcesses.get(executionId);
    if (process) {
      process.kill('SIGTERM');
      this.runningProcesses.delete(executionId);
    }
    
    const execution = this.executionCache.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.updatedAt = new Date();
      await this.updateExecution(execution);
    }
  }

  /**
   * 获取执行状态
   */
  async getExecutionStatus(executionId: string): Promise<ExperimentExecution | null> {
    return this.executionCache.get(executionId) || null;
  }

  /**
   * 保存执行记录
   */
  private async saveExecution(execution: ExperimentExecution): Promise<void> {
    // 这里应该保存到数据库
    // 目前使用内存缓存
    this.executionCache.set(execution.id, execution);
  }

  /**
   * 更新执行记录
   */
  private async updateExecution(execution: ExperimentExecution): Promise<void> {
    // 这里应该更新数据库
    // 目前使用内存缓存
    this.executionCache.set(execution.id, execution);
  }

  /**
   * 获取所有运行中的执行
   */
  getRunningExecutions(): ExperimentExecution[] {
    return Array.from(this.executionCache.values()).filter(
      execution => execution.status === 'running'
    );
  }
} 