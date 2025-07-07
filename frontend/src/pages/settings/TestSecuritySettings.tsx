import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const TestsecuritySettings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        安全设置测试
      </Typography>
      <Card>
        <CardContent>
          <Typography>
            这是安全设置页面的测试内容。如果您能看到这个消息，说明组件渲染正常。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestSecuritySettings;
