import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { PomodoroProvider } from './contexts/PomodoroContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <DataProvider>
          <PomodoroProvider>
            <ThemeProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </ThemeProvider>
          </PomodoroProvider>
        </DataProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
