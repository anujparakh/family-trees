import { render } from 'preact';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import { App } from '@/App';
import { CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';

render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>,
  document.getElementById('app')!
);
