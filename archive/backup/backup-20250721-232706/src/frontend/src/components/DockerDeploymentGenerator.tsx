import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import { toast } from 'react-hot-toast';
import systemSetupService from '../services/systemSetupService';

/**
 * Docker部署文件生成器组件
 */
const DockerDeploymentGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [deploymentFiles, setDeploymentFiles] = useState<{
    dockerCompose: string;
    dockerfiles: { [key: string]: string };
    nginxConf: string;
  } | null>(null);
  
  const [deploymentOptions, setDeploymentOptions] = useState({
    // 基本设置
    projectName: 'ailab-platform',
    domain: '',
    useSSL: true,
    
    // 资源设置
    cpuLimit: '2',
    memoryLimit: '4g',
    
    // 数据库设置
    databaseType: 'mongodb',
    persistData: true,
    backupEnabled: true,
    
    // 高级设置
    useRedis: true,
    enableMonitoring: true,
    enableLogging: true,
    exposeMetrics: false,
    
    // 安全设置
    restrictAdminIP: false,
    adminIPList: '',
    enableFirewall: true,
    rateLimiting: true
  });

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeploymentOptions(prev => ({ ...prev, [name]: value }));
  };

  // 处理选择框变化
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setDeploymentOptions(prev => ({ ...prev, [name]: value }));
  };

  // 处理开关变化
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDeploymentOptions(prev => ({ ...prev, [name]: checked }));
  };

  // 生成部署文件
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await systemSetupService.generateDockerDeployment(deploymentOptions);
      setDeploymentFiles(result);
      setDownloadDialogOpen(true);
      toast.success('部署文件生成成功');
    } catch (error) {
      console.error('生成部署文件失败:', error);
      toast.error('生成部署文件失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载部署文件
  const handleDownload = () => {
    if (!deploymentFiles) return;
    
    // 创建zip文件内容
    // 注意：这是一个简化的实现，在实际项目中可能需要使用专门的库来生成zip文件
    const files = {
      'docker-compose.yml': deploymentFiles.dockerCompose,
      'Dockerfile.app': deploymentFiles.dockerfiles.app,
      'Dockerfile.ai': deploymentFiles.dockerfiles.ai,
      'nginx/nginx.conf': deploymentFiles.nginxConf,
      'README.md': generateReadmeContent()
    };
    
    // 在实际实现中，这里会使用JSZip或类似库创建zip文件
    // 这里仅作为示例，创建一个包含docker-compose.yml的下载
    const dataStr = files['docker-compose.yml'];
    const dataUri = 'data:text/yaml;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `${deploymentOptions.projectName}-docker-compose.yml`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    setDownloadDialogOpen(false);
  };

  // 生成README内容
  const generateReadmeContent = () => {
    return `# ${deploymentOptions.projectName} 部署指南

## 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- ${deploymentOptions.memoryLimit} 内存
- ${deploymentOptions.cpuLimit} CPU核心
- 80/443端口开放

## 快速部署

1. 将本目录上传到服务器
2. 执行以下命令启动服务:

\`\`\`bash
docker-compose up -d
\`\`\`

3. 访问系统: http${deploymentOptions.useSSL ? 's' : ''}://${
      deploymentOptions.domain || 'your-domain.com'
    }

## 文件结构

- docker-compose.yml - 容器编排配置
- Dockerfile.app - 应用服务器镜像构建文件
- Dockerfile.ai - AI服务镜像构建文件
- nginx/ - Nginx配置目录
  - nginx.conf - Nginx主配置文件
- data/ - 数据持久化目录
  - db/ - 数据库文件
  - uploads/ - 上传文件
  - backups/ - 备份文件

## 管理命令

- 启动服务: \`docker-compose up -d\`
- 停止服务: \`docker-compose down\`
- 查看日志: \`docker-compose logs -f\`
- 重启服务: \`docker-compose restart\`
- 备份数据: \`docker-compose exec db mongodump --out /backups/\$(date +%Y%m%d)\`

## 联系支持

如需技术支持，请联系: tech@sslab.edu.cn
`;
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BuildIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Docker部署文件生成器</Typography>
        </Box>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          根据您的系统配置和需求，生成完整的Docker部署文件，便于在生产环境中快速部署系统。
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">基本设置</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="项目名称"
                      name="projectName"
                      value={deploymentOptions.projectName}
                      onChange={handleInputChange}
                      helperText="用于生成容器和卷名称"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="域名"
                      name="domain"
                      value={deploymentOptions.domain}
                      onChange={handleInputChange}
                      helperText="如不填写，将使用示例域名"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.useSSL}
                          onChange={handleSwitchChange}
                          name="useSSL"
                        />
                      }
                      label="启用HTTPS/SSL"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">资源与数据库</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CPU限制"
                      name="cpuLimit"
                      value={deploymentOptions.cpuLimit}
                      onChange={handleInputChange}
                      type="number"
                      InputProps={{ inputProps: { min: 1, step: 0.5 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="内存限制"
                      name="memoryLimit"
                      value={deploymentOptions.memoryLimit}
                      onChange={handleInputChange}
                      helperText="例如：2g, 4096m"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>数据库类型</InputLabel>
                      <Select
                        name="databaseType"
                        value={deploymentOptions.databaseType}
                        onChange={handleSelectChange}
                        label="数据库类型"
                      >
                        <MenuItem value="mongodb">MongoDB</MenuItem>
                        <MenuItem value="mysql">MySQL</MenuItem>
                        <MenuItem value="postgres">PostgreSQL</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.persistData}
                          onChange={handleSwitchChange}
                          name="persistData"
                        />
                      }
                      label="数据持久化存储"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.backupEnabled}
                          onChange={handleSwitchChange}
                          name="backupEnabled"
                        />
                      }
                      label="启用自动备份"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">安全与高级选项</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.useRedis}
                          onChange={handleSwitchChange}
                          name="useRedis"
                        />
                      }
                      label="启用Redis缓存"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.enableMonitoring}
                          onChange={handleSwitchChange}
                          name="enableMonitoring"
                        />
                      }
                      label="启用系统监控"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.enableLogging}
                          onChange={handleSwitchChange}
                          name="enableLogging"
                        />
                      }
                      label="启用集中式日志"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.restrictAdminIP}
                          onChange={handleSwitchChange}
                          name="restrictAdminIP"
                        />
                      }
                      label="限制管理页面IP访问"
                    />
                  </Grid>
                  
                  {deploymentOptions.restrictAdminIP && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="管理IP白名单"
                        name="adminIPList"
                        value={deploymentOptions.adminIPList}
                        onChange={handleInputChange}
                        helperText="多个IP用逗号分隔"
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={deploymentOptions.enableFirewall}
                          onChange={handleSwitchChange}
                          name="enableFirewall"
                        />
                      }
                      label="启用基础防火墙规则"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            生成的部署文件包含docker-compose.yml、Dockerfile和Nginx配置，可直接用于生产环境部署。
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BuildIcon />}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '生成中...' : '生成部署文件'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>部署文件生成成功</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            您的Docker部署文件已生成完成。这些文件包含:
          </DialogContentText>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label="docker-compose.yml" color="primary" variant="outlined" />
            <Chip label="Dockerfile.app" color="primary" variant="outlined" />
            <Chip label="Dockerfile.ai" color="primary" variant="outlined" />
            <Chip label="nginx.conf" color="primary" variant="outlined" />
            <Chip label="README.md" color="primary" variant="outlined" />
          </Box>
          
          <DialogContentText>
            点击下方按钮下载部署文件包。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            color="primary"
            startIcon={<CloudDownloadIcon />}
          >
            下载部署文件
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DockerDeploymentGenerator;
