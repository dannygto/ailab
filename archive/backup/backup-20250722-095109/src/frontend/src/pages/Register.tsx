import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Tabs,
  Tab,
  InputAdornment,
  FormControl,
  FormHelperText,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SliderCaptcha from '../components/common/SliderCaptcha';
import SecurityQuestionSelector from '../components/common/SecurityQuestionSelector';
import { useLanguage, LanguageSwitcher } from '../contexts/LanguageContext';

interface RegisterFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  agreeToTerms: boolean;
  securityQuestion: string;
  securityAnswer: string;
  enable2FA: boolean;
}

// 密码强度枚举
enum PasswordStrength {
  Weak = 'weak',
  Medium = 'medium',
  Strong = 'strong'
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    agreeToTerms: false,
    securityQuestion: '',
    securityAnswer: '',
    enable2FA: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.Weak);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'agreeToTerms' ? event.target.checked : event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除特定字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // 如果是密码字段，检查密码强度
    if (field === 'password') {
      checkPasswordStrength(value as string);
    }
  };

  // 检查密码强度
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(PasswordStrength.Weak);
      return;
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const passedChecks = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (password.length < 8 || passedChecks <= 1) {
      setPasswordStrength(PasswordStrength.Weak);
    } else if (password.length >= 8 && passedChecks === 2) {
      setPasswordStrength(PasswordStrength.Medium);
    } else {
      setPasswordStrength(PasswordStrength.Strong);
    }
  };

  // 获取密码强度颜色
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case PasswordStrength.Strong:
        return 'success.main';
      case PasswordStrength.Medium:
        return 'warning.main';
      case PasswordStrength.Weak:
      default:
        return 'error.main';
    }
  };

  // 获取密码强度文本
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case PasswordStrength.Strong:
        return '强';
      case PasswordStrength.Medium:
        return '中';
      case PasswordStrength.Weak:
      default:
        return '弱';
    }
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    // 验证邮箱或手机号
    const field = activeTab === 'email' ? 'email' : 'phone';
    const value = formData[field];
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!value) {
      errors[field] = activeTab === 'email' ? '请输入邮箱' : '请输入手机号';
      setFormErrors(errors);
      return;
    }

    if (field === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      errors.email = '请输入有效的邮箱地址';
      setFormErrors(errors);
      return;
    }

    if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
      errors.phone = '请输入有效的手机号';
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      // 在实际环境中，这里应该调用API发送验证码
      // await api.sendVerificationCode(field, value);

      // 模拟发送成功
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCodeSent(true);
      setCountdown(60);

      // 启动倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success(`验证码已发送到您的${activeTab === 'email' ? '邮箱' : '手机'}`);
    } catch (err) {
      toast.error(`发送验证码失败，请稍后重试`);
    } finally {
      setLoading(false);
    }
  };

  // 验证码倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 表单验证
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.username) {
      errors.username = t('auth.username') + '不能为空';
    }

    if (activeTab === 'email') {
      if (!formData.email) {
        errors.email = t('auth.email') + '不能为空';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = '请输入有效的邮箱地址';
      }
    } else {
      if (!formData.phone) {
        errors.phone = t('auth.phone') + '不能为空';
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        errors.phone = '请输入有效的手机号';
      }
    }

    if (!formData.verificationCode) {
      errors.verificationCode = t('auth.verifyCode') + '不能为空';
    } else if (formData.verificationCode.length !== 6) {
      errors.verificationCode = '验证码应为6位数字';
    }

    if (!formData.password) {
      errors.password = t('auth.password') + '不能为空';
    } else if (formData.password.length < 8) {
      errors.password = '密码长度至少为8个字符';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.confirmPassword') + '不能为空';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = t('auth.mustAgree');
    }

    if (!captchaVerified) {
      setError('请完成滑动验证');
      return;
    }

    if (!formData.securityQuestion || !formData.securityAnswer) {
      errors.securityAnswer = '请设置安全问题和答案';
    }

    // 如果有错误，显示错误并返回
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 根据是否启用两因素认证显示不同的成功信息
      if (formData.enable2FA) {
        toast.success('注册成功！已启用两因素认证，请在登录时完成额外验证步骤。');
      } else {
        toast.success('注册成功！正在跳转到登录页面...');
      }

      // 延迟导航到登录页面
      setTimeout(() => {
        navigate('/login', {
          state: {
            newlyRegistered: true,
            username: formData.username,
            twoFactorEnabled: formData.enable2FA
          }
        });
      }, 2000);
    } catch (err) {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 切换确认密码可见性
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 处理安全问题变更
  const handleSecurityQuestionChange = (question: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      securityQuestion: question,
      securityAnswer: answer
    }));

    // 清除特定字段的错误
    if (formErrors.securityQuestion || formErrors.securityAnswer) {
      setFormErrors(prev => ({
        ...prev,
        securityQuestion: undefined,
        securityAnswer: undefined
      }));
    }
  };

  // 处理验证码验证成功
  const handleCaptchaVerified = () => {
    setCaptchaVerified(true);
    // 清除可能存在的验证码错误
    if (formErrors.verificationCode) {
      setFormErrors(prev => ({
        ...prev,
        verificationCode: undefined
      }));
    }
  };

  // 处理标签切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'email' | 'phone') => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 480,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          用户注册
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="邮箱注册" value="email" />
          <Tab label="手机注册" value="phone" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={formData.username}
            onChange={handleInputChange('username')}
            margin="normal"
            required
            error={!!formErrors.username}
            helperText={formErrors.username}
          />

          {activeTab === 'email' ? (
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          ) : (
            <TextField
              fullWidth
              label="手机号"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              margin="normal"
              required
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
          )}

          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              fullWidth
              label="验证码"
              value={formData.verificationCode}
              onChange={handleInputChange('verificationCode')}
              sx={{ flexGrow: 1, mr: 1 }}
              error={!!formErrors.verificationCode}
              helperText={formErrors.verificationCode}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendVerificationCode}
              disabled={loading || countdown > 0}
              sx={{ minWidth: '120px' }}
            >
              {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
            </Button>
          </Box>

          <FormControl fullWidth margin="normal" variant="outlined">
            <TextField
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              error={!!formErrors.password}
              helperText={formErrors.password || '密码长度至少为8个字符，包含字母、数字和特殊字符'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {formData.password && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  密码强度:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: getPasswordStrengthColor(), fontWeight: 'bold' }}
                >
                  {getPasswordStrengthText()}
                </Typography>
                <Box
                  sx={{
                    ml: 1,
                    height: 4,
                    width: '100%',
                    bgcolor: 'grey.300',
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width:
                        passwordStrength === PasswordStrength.Strong
                          ? '100%'
                          : passwordStrength === PasswordStrength.Medium
                            ? '66%'
                            : '33%',
                      bgcolor: getPasswordStrengthColor(),
                      borderRadius: 2,
                      transition: 'width 0.3s',
                    }}
                  />
                </Box>
              </Box>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="确认密码"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            margin="normal"
            required
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 安全问题选择器 */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('auth.securityQuestion')}
            </Typography>
            <SecurityQuestionSelector
              onAnswerChange={handleSecurityQuestionChange}
            />
            {(formErrors.securityQuestion || formErrors.securityAnswer) && (
              <FormHelperText error>
                {formErrors.securityQuestion || formErrors.securityAnswer}
              </FormHelperText>
            )}
          </Box>

          {/* 滑动验证码 */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('auth.humanVerification')}
            </Typography>
            <SliderCaptcha onVerified={handleCaptchaVerified} />
            {!captchaVerified && (
              <FormHelperText>
                {t('auth.dragToVerify')}
              </FormHelperText>
            )}
          </Box>

          {/* 两因素认证选项 */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              增强安全选项
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.enable2FA}
                  onChange={handleInputChange('enable2FA')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    启用两因素认证 (推荐)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    登录时将需要额外验证，提升账户安全性
                  </Typography>
                </Box>
              }
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeToTerms}
                onChange={handleInputChange('agreeToTerms')}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                我已阅读并同意
                <Link component={RouterLink} to="/terms" target="_blank" underline="hover">
                  用户协议
                </Link>
                和
                <Link component={RouterLink} to="/privacy" target="_blank" underline="hover">
                  隐私政策
                </Link>
              </Typography>
            }
          />
          {formErrors.agreeToTerms && (
            <FormHelperText error>{formErrors.agreeToTerms}</FormHelperText>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            已有账号？
            <Link component={RouterLink} to="/login" underline="hover" sx={{ ml: 1 }}>
              立即登录
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link component={RouterLink} to="/help-center" underline="hover">
              <Typography variant="body2">需要帮助？</Typography>
            </Link>
            <LanguageSwitcher />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;

