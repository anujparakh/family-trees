# Icons Reference

This project uses [Phosphor Icons](https://phosphoricons.com/) for a consistent, modern icon system.

## Installed Package

```bash
npm install @phosphor-icons/react
```

## Current Icons Used

### Navigation & Controls
- **Gear** (`<Gear />`) - Settings button in header
- **Plus** (`<Plus />`) - Zoom in control
- **Minus** (`<Minus />`) - Zoom out control
- **FrameCorners** (`<FrameCorners />`) - Fit to view control
- **X** (`<X />`) - Close buttons (dialog, bottom sheet)

### Custom Icons
- **TreeIcon** (custom SVG) - App logo/favicon showing family tree structure

## Usage

### Basic Usage
```tsx
import { Gear, Plus, Minus } from '@phosphor-icons/react';

// Default (24px, regular weight)
<Gear />

// Custom size and weight
<Gear size={20} weight="bold" />
<Plus size={32} weight="thin" />
```

### Available Weights
- `thin`
- `light`
- `regular` (default)
- `bold`
- `fill`
- `duotone`

### Props
- `size` - Number (default: 24)
- `weight` - String (default: 'regular')
- `color` - String (inherits currentColor by default)
- `className` - String

## Finding More Icons

Browse all available icons at: https://phosphoricons.com/

The library includes 6,000+ icons across categories like:
- Interface
- Communication
- Media
- Files
- Editor
- And many more...

## Adding New Icons

1. Find the icon on https://phosphoricons.com/
2. Import it from `@phosphor-icons/react`:
```tsx
import { IconName } from '@phosphor-icons/react';
```
3. Use it in your component:
```tsx
<IconName size={20} weight="bold" />
```

## Best Practices

- Use consistent sizes: 20px for small, 24px for medium, 32px for large
- Use `weight="bold"` for icon-only buttons for better visibility
- Use `weight="regular"` for inline icons with text
- Always provide `ariaLabel` when using icons without text
