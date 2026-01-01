/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Touch-friendly sizing
      minHeight: {
        'touch': '44px',  // Apple HIG minimum
      },
      minWidth: {
        'touch': '44px',
      },
      // Custom node sizes
      width: {
        'node': '120px',
      },
      height: {
        'node': '80px',
      },
      // Semantic color tokens
      colors: {
        // Background colors
        'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        'bg-hover': 'rgb(var(--color-bg-hover) / <alpha-value>)',
        'bg-selected': 'rgb(var(--color-bg-selected) / <alpha-value>)',

        // Text colors
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',

        // Border colors
        'border-primary': 'rgb(var(--color-border-primary) / <alpha-value>)',
        'border-secondary': 'rgb(var(--color-border-secondary) / <alpha-value>)',

        // Gender-specific colors (same in both themes)
        'gender-male': 'rgb(var(--color-gender-male) / <alpha-value>)',
        'gender-female': 'rgb(var(--color-gender-female) / <alpha-value>)',
        'gender-neutral': 'rgb(var(--color-gender-neutral) / <alpha-value>)',

        // Accent colors
        'accent-primary': 'rgb(var(--color-accent-primary) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
