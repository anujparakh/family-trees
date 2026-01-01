import { useLocation } from 'wouter';
import { TreeIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui';
import { SignInButton, useUser } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Landing page with animated heading and navigation buttons
 */
export function LandingPage() {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useUser();
  const { theme } = useTheme();

  const clerkAppearance = {
    baseTheme: theme === 'dark' ? dark : undefined,
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-primary">
      {/* Header with theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Animated logo and heading */}
        <div className="flex flex-col items-center gap-6 mb-12 animate-fadeIn">
          <TreeIcon size={80} className="text-accent-primary animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary text-center">
            Family Trees
          </h1>
          <p className="text-lg md:text-xl text-text-secondary text-center max-w-2xl">
            Explore and create beautiful interactive family trees. Connect your heritage,
            discover your roots.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setLocation('/trees/example-tree-001')}
            className="min-w-[200px]"
          >
            View Example Tree
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setLocation('/trees')}
            className="min-w-[200px]"
          >
            Browse All Trees
          </Button>

          {!isSignedIn && (
            <SignInButton mode="modal" appearance={clerkAppearance}>
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Sign In / Sign Up
              </Button>
            </SignInButton>
          )}

          {isSignedIn && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setLocation('/trees')}
              className="min-w-[200px]"
            >
              My Trees
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-text-tertiary text-sm">
        <p>Built with React Flow and powered by Cloudflare</p>
      </div>
    </div>
  );
}

export default LandingPage;
