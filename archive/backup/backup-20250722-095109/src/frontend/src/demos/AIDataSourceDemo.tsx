import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  Usb as UsbIcon,
  Cloud as CloudIcon,
  Storage as DatabaseIcon,
  Http as HttpIcon,
  Cable as CableIcon
} from '@mui/icons-material';
import USBDataSourceConfig from '../components/devices/datasource/USBDataSourceConfig';

/**
 * AI数据源配置演示页面
 * 展示如何使用AI智能识别设备数据格式并生成解析规则
 */
const AIDataSourceDemo: React.FC = () => {
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);

  const dataSources = [
    {
      id: 'usb',
      name: 'USB串口',
      icon: <UsbIcon />,
      description: '通过USB串口连接的传感器和设备',
      features: ['波特率自动检测', '数据格式识别', '解析规则生成'],
      aiFeatures: [
        '自动识别串口通信参数',
        '智能解析JSON/CSV/XML格式',
        '生成数据转换脚本'
      ]
    },
    {
      id: 'mqtt',
      name: 'MQTT消息队列',
      icon: <CloudIcon />,
      description: '订阅MQTT主题获取设备数据',
      features: ['主题管理', '消息过滤', 'QoS配置'],
      aiFeatures: [
        '分析消息结构和频率',
        '自动生成订阅规则',
        '识别数据字段类型'
      ]
    },
    {
      id: 'modbus',
      name: 'Modbus RTU/TCP',
      icon: <CableIcon />,
      description: '工业标准Modbus协议设备',
      features: ['寄存器映射', '数据类型转换', '批量读取'],
      aiFeatures: [
        '自动探测设备寄存器',
        '识别数据类型和字节序',
        '优化读取策略'
      ]
    },
    {
      id: 'http',
      name: 'HTTP API',
      icon: <HttpIcon />,
      description: '通过REST API获取数据',
      features: ['认证管理', '参数配置', '响应解析'],
      aiFeatures: [
        '分析API响应结构',
        '自动生成数据提取路径',
        '错误处理优化'
      ]
    },
    {
      id: 'database',
      name: '数据库直读',
      icon: <DatabaseIcon />,
      description: '直接从数据库读取数据',
      features: ['SQL查询', '连接池管理', '数据缓存'],
      aiFeatures: [
        '分析表结构和关系',
        '生成优化查询语句',
        '推荐索引策略'
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ mr: 2, fontSize: 40 }} color="primary" />
          AI智能数据源配置演示
        </Typography>
        <Typography variant="h6" color="text.secondary">
          展示如何使用AI技术快速识别和配置各种设备数据源
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          <strong>AI数据源配置的优势：</strong>
        </Typography>
        <Typography variant="body2">
          • 自动识别未知设备的数据格式，无需手动解析<br/>
          • 智能生成数据转换和清洗规则，提升配置效率<br/>
          • 支持多种数据源类型，覆盖常见工业和实验设备<br/>
          • 实时验证解析效果，确保数据准确性
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {dataSources.map((source) => (
          <Grid item xs={12} md={6} lg={4} key={source.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardHeader
                avatar={source.icon}
                title={source.name}
                subheader={source.description}
                action={
                  <Chip 
                    label="AI增强" 
                    color="primary" 
                    size="small"
                    icon={<SmartToyIcon />}
                  />
                }
              />
              
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  基础功能：
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {source.features.map((feature, index) => (
                    <Chip 
                      key={index}
                      label={feature} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  AI智能功能：
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {source.aiFeatures.map((feature, index) => (
                    <Chip 
                      key={index}
                      label={feature} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setSelectedDataSource(
                    selectedDataSource === source.id ? null : source.id
                  )}
                  startIcon={source.icon}
                >
                  {selectedDataSource === source.id ? '收起配置' : '查看配置'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 配置详情展示 */}
      {selectedDataSource && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {dataSources.find(s => s.id === selectedDataSource)?.name} 配置演示
          </Typography>
          
          {selectedDataSource === 'usb' && (
            <USBDataSourceConfig
              deviceId="demo-device-001"
              onSave={(config) => {
                // console.log removed
                alert('配置已保存！在实际应用中，这里会将配置发送到后端API。');
              }}
              onTest={async (config) => {
                // console.log removed
                // 模拟测试延迟
                await new Promise(resolve => setTimeout(resolve, 2000));
                return Math.random() > 0.3; // 70% 成功率
              }}
            />
          )}
          
          {selectedDataSource === 'mqtt' && (
            <Alert severity="info">
              MQTT配置组件演示 - 支持AI智能识别MQTT消息格式和主题结构
            </Alert>
          )}
          
          {selectedDataSource === 'modbus' && (
            <Alert severity="info">
              Modbus配置组件演示 - AI自动探测设备寄存器映射和数据类型
            </Alert>
          )}
          
          {selectedDataSource === 'http' && (
            <Alert severity="info">
              HTTP API配置组件演示 - 智能分析API响应结构并生成数据提取规则
            </Alert>
          )}
          
          {selectedDataSource === 'database' && (
            <Alert severity="info">
              数据库配置组件演示 - AI分析数据库结构并优化查询语句
            </Alert>
          )}
        </Box>
      )}

      {/* 使用指南 */}
      <Box sx={{ mt: 6 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              AI数据源配置使用指南
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  第一步：选择数据源类型
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  根据您的设备类型选择合适的数据源配置。系统支持USB串口、MQTT消息队列、Modbus协议、HTTP API和数据库直读等多种方式。
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  第二步：提供数据样本
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  在AI分析器中添加3-5个真实的数据样本。样本应该包含不同时间点和状态的数据，以提高AI识别的准确性。
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  第三步：启动AI分析
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  点击"AI智能分析"按钮，系统会自动识别数据格式、推断字段类型，并生成相应的解析规则。
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  第四步：验证解析规则
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  系统会显示AI生成的解析规则和置信度。您可以测试规则的解析效果，必要时进行手动调整。
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  第五步：应用配置
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  确认解析规则正确后，点击"应用此规则"完成配置。系统会自动将规则应用到数据源配置中。
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  第六步：测试数据采集
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  使用"测试连接"功能验证整个数据采集流程，确保设备连接正常且数据解析准确。
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default AIDataSourceDemo;

