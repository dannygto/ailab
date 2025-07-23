import App from './App';
import { I18nContextProvider } from './contexts/I18nContext';
import I18nProvider from './providers/I18nProvider';

// AppRouter组件，增加了I18n国际化支持
export default function AppRouter() {
  return (
    <I18nProvider>
      <I18nContextProvider>
        <App />
      </I18nContextProvider>
    </I18nProvider>
  );
}
