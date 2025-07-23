import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Button, Container, Grid } from '@mui/material';
import ExperimentAIIntegration from '../components/experiments/ExperimentAIIntegration';
import ExperimentCollaboration from '../components/experiments/ExperimentCollaboration';
import MobileAdaptation from '../components/mobile/MobileAdaptation';
import DomesticTechnologySupport from '../components/settings/DomesticTechnologySupport';

/**
 * 集成测试页面
 * 用于展示和测试所有新增组件
 */
const IntegrationTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // 模拟实验数据
  const experimentData = {
    id: 'exp123',
    name: '深度学习图像分类实验',
    parameters: [
      {
        id: 'learning_rate',
        name: '学习率',
        value: 0.001,
        type: 'number',
        description: '模型训练时的学习率，控制每次迭代更新的步长',
        category: 'model'
      },
      {
        id: 'batch_size',
        name: '批量大小',
        value: 64,
        type: 'number',
        description: '每次迭代使用的样本数量',
        category: 'training'
      },
      {
        id: 'epochs',
        name: '训练轮数',
        value: 50,
        type: 'number',
        description: '完整训练数据集的次数',
        category: 'training'
      }
    ],
    datasets: [
      {
        id: 'dataset1',
        name: '图像训练集',
        description: '用于训练模型的图像数据集',
        size: '2.3 GB',
        format: 'TFRecord',
        lastModified: new Date(),
        previewAvailable: true
      }
    ],
    models: [
      {
        id: 'model1',
        name: 'ResNet50',
        type: 'CNN',
        description: '深度残差网络',
        parameters: 25000000,
        lastModified: new Date()
      }
    ]
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleParameterUpdate = (parameterId: string, value: any) => {
    console.log(`参数更新: ${parameterId} = ${value}`);
  };

  const handleSaveExperiment = () => {
    console.log('保存实验');
  };

  const handleRunExperiment = () => {
    console.log('运行实验');
  };

  return (
    <MobileAdaptation>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          组件集成测试
        </Typography>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="AI助手与实验集成" />
            <Tab label="实验协作功能" />
            <Tab label="移动端适配" />
            <Tab label="国产化支持" />
          </Tabs>
        </Paper>

        {/* AI助手与实验集成 */}
        {activeTab === 0 && (
          <Paper sx={{ height: 600, overflow: 'hidden' }}>
            <ExperimentAIIntegration
              experimentId={experimentData.id}
              experimentName={experimentData.name}
              experimentType="图像分类"
              parameters={experimentData.parameters}
              datasets={experimentData.datasets}
              models={experimentData.models}
              onParameterUpdate={handleParameterUpdate}
              onSaveExperiment={handleSaveExperiment}
              onRunExperiment={handleRunExperiment}
            />
          </Paper>
        )}

        {/* 实验协作功能 */}
        {activeTab === 1 && (
          <Paper sx={{ height: 600, overflow: 'hidden' }}>
            <ExperimentCollaboration
              experimentId={experimentData.id}
              experimentName={experimentData.name}
              currentUserId="user1"
              currentUserName="当前用户"
              onApplyChanges={(changes) => console.log('应用变更', changes)}
            />
          </Paper>
        )}

        {/* 移动端适配 */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  移动端适配测试
                </Typography>
                <Typography paragraph>
                  本页面通过MobileAdaptation组件包裹，已支持移动端适配。可以通过右下角的移动设备图标打开设置面板进行配置。
                </Typography>
                <Typography paragraph>
                  移动端适配组件提供了以下功能：
                </Typography>
                <ul>
                  <li>自动检测设备类型（手机、平板、桌面）</li>
                  <li>根据设备类型自动调整界面布局</li>
                  <li>支持字体缩放控制</li>
                  <li>提供触摸手势优化</li>
                  <li>支持紧凑模式</li>
                </ul>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                  <Button variant="contained">测试按钮</Button>
                  <Button variant="outlined">测试按钮</Button>
                  <Button variant="text">测试按钮</Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  响应式测试
                </Typography>
                <Typography paragraph>
                  尝试调整浏览器窗口大小，或在开发者工具中模拟移动设备，观察界面的响应式变化。
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  设备检测：
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">当前设备类型会自动检测</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">界面布局会根据设备类型自动调整</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">字体大小和组件尺寸可以通过设置面板调整</Typography>
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* 国产化支持 */}
        {activeTab === 3 && (
          <Paper sx={{ height: 600, overflow: 'auto' }}>
            <DomesticTechnologySupport
              onSaveSettings={(settings) => console.log('保存设置', settings)}
            />
          </Paper>
        )}
      </Container>
    </MobileAdaptation>
  );
};

export default IntegrationTestPage;
