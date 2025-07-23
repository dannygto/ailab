import React from 'react';
import { createRoot } from 'react-dom/client';
import I18nDemoApp from './I18nDemoApp';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// 在DOM中渲染应用
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nDemoApp />
    </ThemeProvider>
  </React.StrictMode>
);
