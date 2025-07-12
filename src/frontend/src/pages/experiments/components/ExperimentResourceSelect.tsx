import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { ExperimentType } from '../../../types';

export interface ExperimentResourceOption {
  value: string;
  label: string;
  equipment?: string;
  software?: string;
  size?: string;
  classes?: number | null;
}

// 实验资源选项
export const experimentResourceOptions: Record<string, ExperimentResourceOption[]> = {
  // K12实验基础资源
  observation: [
    { value: 'microscope_basic', label: '基础显微镜', equipment: '学生显微镜、载玻片、盖玻片', software: '显微观察记录软件' },
    { value: 'magnifying_glass', label: '放大镜套装', equipment: '手持放大镜、台式放大镜', software: '观察记录应用' },
    { value: 'telescope_basic', label: '基础望远镜', equipment: '学生望远镜、星图', software: '天体观察应用' },
    { value: 'observation_tools', label: '观察工具包', equipment: '记录本、量角器、计时器', software: '数据记录软件' },
    { value: 'virtual_observation', label: '虚拟观察实验', equipment: '无需实体设备', software: '观察模拟系统' },
  ],
  measurement: [
    { value: 'measurement_basic', label: '基础测量工具', equipment: '直尺、卷尺、量角器、天平', software: '测量数据记录软件' },
    { value: 'digital_measurement', label: '数字测量设备', equipment: '数字天平、电子温度计、数字游标卡尺', software: '数据采集软件' },
    { value: 'precision_tools', label: '精密测量工具', equipment: '游标卡尺、千分尺、精密电子秤', software: '精度分析软件' },
    { value: 'sensor_kit', label: '传感器套装', equipment: '温度传感器、湿度传感器、光照强度传感器', software: '传感器数据分析软件' },
    { value: 'virtual_measurement', label: '虚拟测量实验', equipment: '无需实体设备', software: '测量模拟系统' },
  ],
  comparison: [
    { value: 'sample_preparation', label: '样品制备工具', equipment: '试管、培养皿、滴管、标签', software: '对比实验记录软件' },
    { value: 'control_group_kit', label: '对照组实验套装', equipment: '相同容器、分组标记', software: '对照实验分析软件' },
    { value: 'property_test_kit', label: '性质测试工具', equipment: '测试试纸、指示剂、比色卡', software: '性质对比分析软件' },
    { value: 'data_collection', label: '数据收集工具', equipment: '记录表格、统计工具', software: '统计分析软件' },
    { value: 'virtual_comparison', label: '虚拟对比实验', equipment: '无需实体设备', software: '对比模拟系统' },
  ],
  exploration: [
    { value: 'hypothesis_kit', label: '假设验证工具包', equipment: '实验设计模板、变量控制工具', software: '实验设计软件' },
    { value: 'investigation_tools', label: '探究实验工具', equipment: '多功能实验器材、探针、传感器', software: '探究过程记录软件' },
    { value: 'creative_materials', label: '创新实验材料', equipment: '各种实验器材、组装零件', software: '创新设计软件' },
    { value: 'analysis_equipment', label: '分析检测设备', equipment: '光谱分析仪、酸度测试仪', software: '分析结果软件' },
    { value: 'virtual_exploration', label: '虚拟探究实验', equipment: '无需实体设备', software: '探究模拟系统' },
  ],
  design: [
    { value: 'construction_kit', label: '建构材料套装', equipment: '积木、连接件、基础结构件', software: '3D设计软件' },
    { value: 'electronics_basic', label: '电子学基础包', equipment: '电路板、LED灯、电阻、电线', software: '电路设计软件' },
    { value: 'mechanical_parts', label: '机械零部件', equipment: '齿轮、滑轮、轴承、螺丝', software: '机械设计软件' },
    { value: 'programming_tools', label: '编程工具', equipment: '微控制器、传感器模块', software: '图形化编程环境' },
    { value: 'virtual_design', label: '虚拟设计实验', equipment: '无需实体设备', software: '设计模拟系统' },
  ],
  analysis: [
    { value: 'data_analysis_tools', label: '数据分析工具', equipment: '计算器、图表制作工具、统计软件', software: '数据分析处理软件' },
    { value: 'sample_analysis', label: '样品分析设备', equipment: '光谱分析仪、酸碱测试、对比标准', software: '样品检测软件' },
    { value: 'result_documentation', label: '结果记录工具', equipment: '实验报告模板、图表软件', software: '报告生成软件' },
    { value: 'error_analysis_kit', label: '误差分析工具包', equipment: '精度测试工具、校准标准', software: '误差计算软件' },
    { value: 'virtual_analysis', label: '虚拟分析实验', equipment: '无需实体设备', software: '分析模拟系统' },
  ],
  synthesis: [
    { value: 'integration_tools', label: '综合实验工具', equipment: '多学科实验器材组合', software: '综合分析软件' },
    { value: 'project_kit', label: '项目实验套装', equipment: '完整项目所需全套器材', software: '项目管理软件' },
    { value: 'collaboration_tools', label: '协作实验工具', equipment: '团队实验器材、分工标识', software: '协作平台软件' },
    { value: 'presentation_kit', label: '展示工具包', equipment: '展示板、模型材料、演示设备', software: '演示文稿软件' },
    { value: 'virtual_synthesis', label: '虚拟综合实验', equipment: '无需实体设备', software: '综合模拟系统' },
  ],

  // 兼容性：根据旧版实验类型
  physics_experiment: [
    { value: 'basic_mechanics_kit', label: '基础力学实验套件', equipment: '力学天平、弹簧秤、计时器', software: '数据采集软件' },
    { value: 'advanced_optics_set', label: '高级光学实验套件', equipment: '激光器、光学元件、光强探测器', software: '光路分析软件' },
    { value: 'electricity_lab_kit', label: '电学实验套件', equipment: '电路实验板、万用表、示波器', software: '电路模拟软件' },
    { value: 'physics_virtual_lab', label: '物理虚拟实验室', equipment: '无需实体设备', software: '物理实验模拟系统' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],
  chemistry_experiment: [
    { value: 'chemistry_basic_kit', label: '基础化学实验套件', equipment: '试管、烧杯、量筒、pH计', software: '化学反应模拟软件' },
    { value: 'titration_analysis_kit', label: '滴定分析实验套件', equipment: '滴定管、锥形瓶、天平', software: '滴定曲线分析软件' },
    { value: 'organic_chemistry_set', label: '有机化学实验套件', equipment: '蒸馏装置、分离漏斗、干燥器', software: '分子结构模拟软件' },
    { value: 'chemistry_virtual_lab', label: '化学虚拟实验室', equipment: '无需实体设备', software: '化学实验模拟系统' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],
  biology_experiment: [
    { value: 'microscope_set', label: '显微观察套件', equipment: '显微镜、载玻片工具、染色剂', software: '细胞识别软件' },
    { value: 'plant_growth_kit', label: '植物生长观察套件', equipment: '种子、培养基、生长环境控制', software: '生长数据记录软件' },
    { value: 'physiology_kit', label: '生理实验套件', equipment: '心电图仪、血压计、肺活量计', software: '生理数据分析软件' },
    { value: 'ecology_survey_kit', label: '生态调查工具包', equipment: '采样工具、GPS定位仪、环境监测器', software: '生态数据处理软件' },
    { value: 'biology_virtual_lab', label: '生物虚拟实验室', equipment: '无需实体设备', software: '生物学模拟系统' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],
  integrated_science: [
    { value: 'environment_monitor_kit', label: '环境监测工具包', equipment: '空气质量分析仪、水质检测器、噪音测量仪', software: '环境数据分析平台' },
    { value: 'renewable_energy_kit', label: '可再生能源实验套件', equipment: '太阳能电池板、风力发电机、能量转换器', software: '能源系统模拟软件' },
    { value: 'smart_home_kit', label: '智能家居实验套件', equipment: '智能传感器套装、Arduino控制器、执行器模块', software: '智能家居控制系统' },
    { value: 'circuit_design_station', label: '电路设计工作站', equipment: '示波器、信号发生器、电路分析仪', software: '电路设计分析软件' },
    { value: 'structural_analysis_kit', label: '结构分析套件', equipment: '应力计、振动测量仪、模型构建套件', software: '有限元分析软件' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],
  info_technology: [
    { value: 'programming_station', label: '编程实验工作站', equipment: '高性能计算机、多显示器、开发板套件', software: '多语言开发环境、版本控制系统' },
    { value: 'network_lab_kit', label: '网络实验套件', equipment: '路由器、交换机、网络分析仪', software: '网络模拟软件、网络监控工具' },
    { value: 'database_server', label: '数据库实验服务器', equipment: '服务器硬件', software: '数据库管理系统、数据挖掘分析软件' },
    { value: 'virtual_it_lab', label: '虚拟IT实验室', equipment: '无需实体设备', software: '云端开发环境、虚拟机集群' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],
  engineering_lab: [
    { value: 'material_testing_equipment', label: '材料测试设备', equipment: '拉力试验机、硬度计、疲劳试验机', software: '材料性能分析软件' },
    { value: 'cad_design_station', label: 'CAD设计工作站', equipment: '高性能图形工作站、3D打印机', software: '专业CAD软件、仿真分析软件' },
    { value: 'automation_control_kit', label: '自动化控制套件', equipment: 'PLC控制器、传感器、执行器', software: '控制系统编程软件' },
    { value: 'virtual_engineering_lab', label: '虚拟工程实验室', equipment: '无需实体设备', software: '工程仿真平台' },
    { value: 'custom', label: '自定义资源', equipment: '用户自定义', software: '用户自定义' },
  ],

  // AI实验数据资源
  image_classification: [
    { value: 'imagenet_mini', label: 'ImageNet (迷你版)', size: '1.3GB', classes: 100 },
    { value: 'cifar10', label: 'CIFAR-10', size: '162MB', classes: 10 },
    { value: 'mnist', label: 'MNIST手写数字', size: '11MB', classes: 10 },
    { value: 'fashion_mnist', label: 'Fashion-MNIST', size: '26MB', classes: 10 },
    { value: 'custom_images', label: '自定义图像数据集', size: '用户自定义', classes: null },
  ],
  object_detection: [
    { value: 'coco_mini', label: 'MS COCO (迷你版)', size: '2.5GB', classes: 80 },
    { value: 'pascal_voc', label: 'PASCAL VOC', size: '1.2GB', classes: 20 },
    { value: 'open_images', label: 'Open Images', size: '500GB', classes: 600 },
    { value: 'custom_detection', label: '自定义检测数据集', size: '用户自定义', classes: null },
  ],
  nlp_classification: [
    { value: 'imdb_reviews', label: 'IMDB电影评论', size: '84MB', classes: 2 },
    { value: 'ag_news', label: 'AG News新闻分类', size: '31MB', classes: 4 },
    { value: 'reuters_21578', label: 'Reuters-21578', size: '27MB', classes: 90 },
    { value: 'custom_text', label: '自定义文本数据集', size: '用户自定义', classes: null },
  ],
  speech_recognition: [
    { value: 'common_voice', label: 'Common Voice', size: '1.2GB', classes: null },
    { value: 'librispeech', label: 'LibriSpeech', size: '60GB', classes: null },
    { value: 'custom_audio', label: '自定义音频数据集', size: '用户自定义', classes: null },
  ],
  time_series: [
    { value: 'stock_prices', label: '股票价格数据', size: '50MB', classes: null },
    { value: 'weather_data', label: '天气预报数据', size: '100MB', classes: null },
    { value: 'sensor_readings', label: '传感器读数', size: '200MB', classes: null },
    { value: 'custom_timeseries', label: '自定义时间序列', size: '用户自定义', classes: null },
  ],
  custom: [
    { value: 'upload_dataset', label: '上传自定义数据集', size: '用户上传', classes: null },
    { value: 'create_synthetic', label: '生成合成数据', size: '程序生成', classes: null },
  ]
};

interface ExperimentResourceSelectProps {
  experimentType: ExperimentType;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ExperimentResourceSelect: React.FC<ExperimentResourceSelectProps> = ({
  experimentType,
  value,
  onChange,
  error
}) => {
  const options = experimentResourceOptions[experimentType] || [];
  const selectedOption = options.find(option => option.value === value);

  return (
    <Box>
      <FormControl fullWidth error={!!error}>
        <InputLabel>选择实验资源</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label="选择实验资源"
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
              {option.size && ` (${option.size})`}
              {option.classes && ` - ${option.classes}类`}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      {selectedOption && (
        <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedOption.label}
            </Typography>
            
            <Grid container spacing={2}>
              {selectedOption.equipment && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    所需设备：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOption.equipment}
                  </Typography>
                </Grid>
              )}
              
              {selectedOption.software && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    配套软件：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOption.software}
                  </Typography>
                </Grid>
              )}
              
              {selectedOption.size && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    数据大小：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOption.size}
                  </Typography>
                </Grid>
              )}
              
              {selectedOption.classes && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    分类数量：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOption.classes} 个类别
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExperimentResourceSelect;
