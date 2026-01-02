import { useLocation } from 'wouter';
import { TreeIcon } from '@/components/ui/icons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/Auth/AuthButton';

interface HeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  children?: preact.ComponentChildren;
  showThemeToggle?: boolean;
  showAuthButton?: boolean;
}

/**
 * Reusable header component with navigation, title, and customizable actions
 */
export function Header({
  title,
  backTo = '/',
  backLabel = 'Home',
  children,
  showThemeToggle = true,
  showAuthButton = true,
}: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-border-primary">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation(backTo)}
          className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          aria-label={`Back to ${backLabel}`}
        >
          <TreeIcon size={24} className="text-accent-primary" />
        </button>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Custom action buttons */}
        {children}

        {/* Theme toggle */}
        {showThemeToggle && <ThemeToggle />}

        {/* Auth button */}
        {showAuthButton && <AuthButton />}
      </div>
    </header>
  );
}

export default Header;
