import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { SignInIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui';

/**
 * Authentication button component
 * Shows sign in button when logged out, user menu when logged in
 */
export function AuthButton() {
  const { isSignedIn, isLoaded } = useUser();

  // Don't render anything until Clerk is loaded
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        {/* Clerk's built-in user button with avatar and menu */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <Button variant="ghost" ariaLabel="Sign In">
        <SignInIcon size={20} weight="regular" />
      </Button>
    </SignInButton>
  );
}
