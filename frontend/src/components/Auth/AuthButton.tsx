import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { SignInIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Authentication button component
 * Shows sign in button when logged out, user menu when logged in
 */
export function AuthButton() {
  const { isSignedIn, isLoaded } = useUser();
  const { theme } = useTheme();

  // Don't render anything until Clerk is loaded
  if (!isLoaded) {
    return null;
  }

  // Clerk appearance based on current theme
  const appearance = {
    baseTheme: theme === 'dark' ? dark : undefined,
    elements: {
      avatarBox: 'w-8 h-8',
    },
  };

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        {/* Clerk's built-in user button with avatar and menu */}
        <UserButton appearance={appearance} />
      </div>
    );
  }

  return (
    <SignInButton mode="modal" appearance={appearance}>
      <Button variant="ghost" ariaLabel="Sign In">
        <SignInIcon size={20} weight="regular" />
      </Button>
    </SignInButton>
  );
}
