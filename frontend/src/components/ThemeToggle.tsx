import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      ariaLabel={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={20} weight="regular" />
      ) : (
        <Sun size={20} weight="regular" />
      )}
    </Button>
  );
}
