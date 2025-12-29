# Button Component

A reusable, accessible button component with multiple variants and sizes.

## Features

- **4 Variants**: Primary, Secondary, Ghost, and Icon
- **3 Sizes**: Small (sm), Medium (md), Large (lg)
- **Touch-friendly**: Minimum 44x44px hit targets (Apple HIG compliant)
- **Accessible**: Proper ARIA labels and focus states
- **TypeScript**: Fully typed with prop interfaces

## Usage

### Import

```tsx
import { Button } from '@/components/ui';
```

### Basic Usage

```tsx
<Button onClick={() => console.log('clicked')}>
  Click me
</Button>
```

### Variants

#### Primary (Default)
Blue button with white text - use for primary actions
```tsx
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>
```

#### Secondary
Gray button - use for secondary actions
```tsx
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>
```

#### Ghost
Minimal styling - use for tertiary actions or close buttons
```tsx
<Button variant="ghost" onClick={handleClose}>
  ✕
</Button>
```

#### Icon
Circular white button with shadow - use for toolbar icons
```tsx
<Button variant="icon" ariaLabel="Zoom in" onClick={handleZoomIn}>
  <ZoomInIcon />
</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ComponentChildren` | - | Button content (text, icons, etc.) |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'icon'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | - | Additional CSS classes |
| `ariaLabel` | `string` | - | Accessible label (recommended for icon buttons) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

## Examples

### Icon Button with SVG
```tsx
<Button variant="icon" ariaLabel="Settings" onClick={openSettings}>
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
</Button>
```

### Disabled Button
```tsx
<Button disabled onClick={handleSave}>
  Save
</Button>
```

### Custom Styling
```tsx
<Button className="w-full" variant="primary">
  Full Width Button
</Button>
```

## Accessibility

- All buttons have `focus:ring` for keyboard navigation
- Icon buttons should always include `ariaLabel` prop
- Disabled buttons have `cursor-not-allowed`
- Minimum touch target size of 44x44px for mobile
