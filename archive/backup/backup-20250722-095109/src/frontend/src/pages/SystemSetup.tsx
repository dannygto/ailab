import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast } from 'react-hot-toast';
import systemSetupService from '../services/systemSetupService';
import { useNavigate } from 'react-router-dom';

// 样式组件
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const LogoPreview = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: '300px',
  height: 'auto',
  objectFit: 'contain',
  margin: '16px 0',
  border: `1px dashed ${theme.palette.divider}`,
  padding: '8px',
  borderRadius: '4px'
}));

// 步骤定义
const steps = [
  '基本信息设置',
  '公司信息设置',
  '数据库配置',
  'AI接口配置',
  '模拟数据设置',
  '完成设置'
];

// 主组件
const SystemSetup: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    // 基本信息
    siteName: 'AI实验平台',
    siteDescription: '专业的人工智能实验研究平台',
    defaultLanguage: 'zh_CN',
    timezone: 'Asia/Shanghai',
    logoFile: null as File | null,
    logoPreviewUrl: '',
    
    // 公司信息
    companyName: '',
    companyDescription: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    legalRepresentative: '',
    registrationNumber: '',
    
    // 数据库配置
    dbType: 'mongodb',
    dbHost: 'localhost',
    dbPort: '27017',
    dbName: 'ailab',
    dbUser: '',
    dbPassword: '',
    dbAuth: false,
    
    // AI接口配置
    aiProvider: 'openai',
    apiKey: '',
    apiEndpoint: 'https://api.openai.com/v1',
    modelName: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    
    // 模拟数据
    useDemoData: true,
    demoDataLevel: 'standard', // minimal, standard, comprehensive
    demoUsers: true,
    demoExperiments: true,
    demoDevices: true,
    demoResults: true
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理选择框变化
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理开关变化
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // 处理Logo上传
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoFile: file,
          logoPreviewUrl: reader.result as string
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  // 处理下一步
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // 处理返回
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // 提交设置
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 创建FormData对象用于文件上传
      const setupData = new FormData();
      
      // 添加所有表单数据
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logoFile' && value) {
          // 确保logoFile是File类型（File继承自Blob）
          setupData.append('logoFile', value as File);
        } else if (typeof value !== 'object') {
          setupData.append(key, String(value));
        }
      });
      
      // 调用API保存设置
      await systemSetupService.saveInitialSetup(setupData);
      
      toast.success('系统初始化设置成功！');
      setSetupComplete(true);
      
      // 等待2秒后重定向到登录页
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('初始化设置失败:', error);
      toast.error('初始化设置失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染基本信息设置步骤
  const renderBasicInfoStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>基本信息设置</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          设置平台的基本信息，这些信息将显示在平台界面和浏览器标签上。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="siteName"
              label="平台名称"
              value={formData.siteName}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>默认语言</InputLabel>
              <Select
                name="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={handleSelectChange}
                label="默认语言"
              >
                <MenuItem value="zh_CN">简体中文</MenuItem>
                <MenuItem value="en_US">English (US)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>时区</InputLabel>
              <Select
                name="timezone"
                value={formData.timezone}
                onChange={handleSelectChange}
                label="时区"
              >
                <MenuItem value="Asia/Shanghai">中国标准时间 (UTC+8)</MenuItem>
                <MenuItem value="America/New_York">美国东部时间</MenuItem>
                <MenuItem value="Europe/London">格林威治标准时间</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="siteDescription"
              label="平台描述"
              value={formData.siteDescription}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>平台Logo</Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              上传Logo
              <VisuallyHiddenInput 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </Button>
            {formData.logoPreviewUrl && (
              <Box sx={{ mt: 2 }}>
                <LogoPreview src={formData.logoPreviewUrl} alt="Logo预览" />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 渲染公司信息设置步骤
  const renderCompanyInfoStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>公司信息设置</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          设置您的公司或组织信息，这些信息将显示在平台的关于页面和报表中。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="companyName"
              label="公司名称"
              value={formData.companyName}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="companyEmail"
              label="公司邮箱"
              value={formData.companyEmail}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="companyPhone"
              label="联系电话"
              value={formData.companyPhone}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="registrationNumber"
              label="营业执照号"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="companyAddress"
              label="公司地址"
              value={formData.companyAddress}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="companyDescription"
              label="公司简介"
              value={formData.companyDescription}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              margin="normal"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 渲染数据库配置步骤
  const renderDatabaseStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          数据库配置
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          配置系统使用的数据库连接信息。这些设置对系统正常运行至关重要。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>数据库类型</InputLabel>
              <Select
                name="dbType"
                value={formData.dbType}
                onChange={handleSelectChange}
                label="数据库类型"
              >
                <MenuItem value="mongodb">MongoDB</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgres">PostgreSQL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="dbHost"
              label="数据库主机"
              value={formData.dbHost}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="dbPort"
              label="数据库端口"
              value={formData.dbPort}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="dbName"
              label="数据库名称"
              value={formData.dbName}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.dbAuth}
                  onChange={handleSwitchChange}
                  name="dbAuth"
                  color="primary"
                />
              }
              label="启用数据库认证"
            />
          </Grid>
          
          {formData.dbAuth && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="dbUser"
                  label="数据库用户名"
                  value={formData.dbUser}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="dbPassword"
                  label="数据库密码"
                  value={formData.dbPassword}
                  onChange={handleInputChange}
                  fullWidth
                  type="password"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <Alert severity="info">
              请确保数据库服务器已启动，并且可以从应用服务器连接。如果使用Docker部署，系统将自动配置数据库连接。
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 渲染AI接口配置步骤
  const renderAIConfigStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI接口配置
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          配置连接到AI服务提供商的接口信息。这些设置将用于系统的智能功能。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>AI服务提供商</InputLabel>
              <Select
                name="aiProvider"
                value={formData.aiProvider}
                onChange={handleSelectChange}
                label="AI服务提供商"
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="azure">Azure OpenAI</MenuItem>
                <MenuItem value="baidu">百度文心一言</MenuItem>
                <MenuItem value="aliyun">阿里通义千问</MenuItem>
                <MenuItem value="custom">自定义</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="apiKey"
              label="API密钥"
              value={formData.apiKey}
              onChange={handleInputChange}
              fullWidth
              type="password"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="apiEndpoint"
              label="API端点"
              value={formData.apiEndpoint}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>模型名称</InputLabel>
              <Select
                name="modelName"
                value={formData.modelName}
                onChange={handleSelectChange}
                label="模型名称"
              >
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="ernie-bot-4">文心一言ERNIE-Bot 4.0</MenuItem>
                <MenuItem value="qwen-max">通义千问MAX</MenuItem>
                <MenuItem value="custom">自定义</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="maxTokens"
              label="最大Token数"
              value={formData.maxTokens}
              onChange={handleInputChange}
              fullWidth
              type="number"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="temperature"
              label="温度系数"
              value={formData.temperature}
              onChange={handleInputChange}
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info">
              您可以在系统设置中随时调整这些AI配置参数。如果暂时没有API密钥，可以先跳过，稍后再配置。
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 渲染模拟数据设置步骤
  const renderDemoDataStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <InsertEmoticonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          模拟数据设置
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          配置是否需要为系统生成模拟数据，以便于展示和测试系统功能。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.useDemoData}
                  onChange={handleSwitchChange}
                  name="useDemoData"
                  color="primary"
                />
              }
              label="生成模拟数据"
            />
          </Grid>
          
          {formData.useDemoData && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>模拟数据级别</InputLabel>
                  <Select
                    name="demoDataLevel"
                    value={formData.demoDataLevel}
                    onChange={handleSelectChange}
                    label="模拟数据级别"
                  >
                    <MenuItem value="minimal">最小数据集 (仅基础示例)</MenuItem>
                    <MenuItem value="standard">标准数据集 (推荐)</MenuItem>
                    <MenuItem value="comprehensive">全面数据集 (包含大量样本数据)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>选择模拟数据类型</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.demoUsers}
                          onChange={handleSwitchChange}
                          name="demoUsers"
                          color="primary"
                        />
                      }
                      label="用户数据"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.demoExperiments}
                          onChange={handleSwitchChange}
                          name="demoExperiments"
                          color="primary"
                        />
                      }
                      label="实验数据"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.demoDevices}
                          onChange={handleSwitchChange}
                          name="demoDevices"
                          color="primary"
                        />
                      }
                      label="设备数据"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.demoResults}
                          onChange={handleSwitchChange}
                          name="demoResults"
                          color="primary"
                        />
                      }
                      label="结果数据"
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="warning">
                  模拟数据仅用于展示和测试，在系统设置中可以随时一键删除模拟数据。删除操作需要管理员权限，且需多次确认。
                </Alert>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  // 渲染完成步骤
  const renderCompletionStep = () => (
    <Card>
      <CardContent>
        <Box textAlign="center" py={3}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 2 }}>
            配置完成
          </Typography>
          <Typography variant="body1" paragraph>
            您已完成系统的初始化配置，点击"完成"按钮应用这些设置并进入系统。
          </Typography>
          
          <Box sx={{ mt: 4, mb: 2 }}>
            <Chip 
              label="基本信息" 
              color="success" 
              variant="outlined" 
              sx={{ m: 0.5 }} 
            />
            <Chip 
              label="公司信息" 
              color="success" 
              variant="outlined" 
              sx={{ m: 0.5 }} 
            />
            <Chip 
              label="数据库配置" 
              color="success" 
              variant="outlined" 
              sx={{ m: 0.5 }} 
            />
            <Chip 
              label="AI接口" 
              color="success" 
              variant="outlined" 
              sx={{ m: 0.5 }} 
            />
            <Chip 
              label="模拟数据" 
              color="success" 
              variant="outlined" 
              sx={{ m: 0.5 }} 
            />
          </Box>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            完成设置后，您将被引导至登录页面。初始管理员账户为 admin，初始密码为 admin123。首次登录后请立即修改密码。
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );

  // 根据当前步骤渲染内容
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderCompanyInfoStep();
      case 2:
        return renderDatabaseStep();
      case 3:
        return renderAIConfigStep();
      case 4:
        return renderDemoDataStep();
      case 5:
        return renderCompletionStep();
      default:
        return '未知步骤';
    }
  };

  // 渲染设置完成后的成功界面
  if (setupComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
          <Typography variant="h4" color="primary" gutterBottom sx={{ mt: 2 }}>
            系统设置完成！
          </Typography>
          <Typography variant="body1" paragraph>
            正在准备您的AILAB平台环境，即将跳转到登录页面...
          </Typography>
          <CircularProgress sx={{ mt: 3 }} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h1">
            AILAB平台初始化设置
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            上一步
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {activeStep === steps.length - 1 ? (
              isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '完成'
              )
            ) : (
              '下一步'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SystemSetup;
