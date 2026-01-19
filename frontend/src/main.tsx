import {OpenAPI} from './services/api/core/OpenAPI';
OpenAPI.BASE = 'http://localhost:3000/api';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, CssBaseline} from '@mui/material';
import App from './App.tsx'
import theme from './theme/themes.ts';
import { UIProvider } from './context/UIProvider';
import { AuthProvider } from './context/AuthProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
