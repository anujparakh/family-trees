import { ComponentChildren } from 'preact';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ComponentChildren;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary text-white hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-bg-tertiary text-text-primary hover:bg-bg-hover active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed',
  icon: 'bg-bg-secondary text-text-primary hover:bg-bg-hover active:bg-bg-tertiary shadow-lg border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-full',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

/**
 * Button component with multiple variants and sizes
 * Touch-friendly with minimum 44x44px hit targets
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
  ariaLabel,
  type = 'button',
}: ButtonProps) {
  const isIcon = variant === 'icon';
  const clickit = () => {
    if (onClick) {
      console.log('Clicking ', ariaLabel);
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={clickit}
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium transition-colors duration-150',
        // Touch-friendly minimum sizes
        'min-w-touch min-h-touch',
        // Variant-specific styles
        variantStyles[variant],
        // Size-specific styles
        isIcon ? iconSizeStyles[size] : sizeStyles[size],
        // Border radius (unless icon, which has rounded-full in variant)
        !isIcon && 'rounded-lg',
        // Custom className override
        className
      )}
      style={
        isIcon
          ? {
              minWidth: size === 'sm' ? '40px' : size === 'md' ? '48px' : '56px',
              minHeight: size === 'sm' ? '40px' : size === 'md' ? '48px' : '56px',
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

export default Button;
