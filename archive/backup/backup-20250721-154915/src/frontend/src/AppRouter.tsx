import App from './App';

// AppRouter组件现在直接返回App组件，避免Router嵌套问题
export default function AppRouter() {
  return <App />;
}
