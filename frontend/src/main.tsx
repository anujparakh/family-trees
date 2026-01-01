import { render } from 'preact';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import { App } from '@/App';
import { CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';
import { ThemeProvider } from '@/contexts/ThemeContext';

render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ClerkProvider>,
  document.getElementById('app')!
);
