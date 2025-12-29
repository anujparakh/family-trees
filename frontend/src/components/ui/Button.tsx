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
    'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed',
  secondary:
    'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
  ghost:
    'text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed',
  icon: 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full',
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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
