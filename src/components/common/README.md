# Common UI Components

A comprehensive library of reusable, production-ready UI components for the Sovren AI Portal, built with TypeScript, React, and Tailwind CSS.

## Components Overview

### Button
A versatile button component with multiple variants and states.

**Features:**
- 6 variants: primary, secondary, outline, ghost, danger, success
- 3 sizes: sm, md, lg
- Loading state with spinner
- Left/right icon support
- Full width option
- Fully accessible

**Usage:**
```tsx
import { Button } from '@/components/common';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" isLoading leftIcon={<Icon />}>
  Loading...
</Button>
```

### Card
A flexible card container with sub-components for structured content.

**Features:**
- 4 variants: default, bordered, elevated, glass
- 4 padding sizes: none, sm, md, lg
- Hoverable effect option
- Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';

<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Modal
A customizable modal dialog with overlay and animations.

**Features:**
- 5 sizes: sm, md, lg, xl, full
- Keyboard navigation (Escape to close)
- Overlay click to close
- Optional close button
- Auto-focus management
- Body scroll lock
- Smooth animations

**Usage:**
```tsx
import { Modal } from '@/components/common';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  description="Modal description"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

### Loading
A versatile loading indicator with multiple animation styles.

**Features:**
- 4 variants: spinner, dots, pulse, bars
- 4 sizes: sm, md, lg, xl
- Optional loading text
- Full screen mode
- Customizable colors

**Usage:**
```tsx
import { Loading } from '@/components/common';

<Loading variant="spinner" size="md" text="Loading..." />

<Loading variant="dots" fullScreen />
```

### ErrorBoundary
A React error boundary for graceful error handling.

**Features:**
- Catches React rendering errors
- Custom fallback UI
- Error details display
- Stack trace in development
- Reset/retry functionality
- Custom error handler callback

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/common';

<ErrorBoundary onError={(error, info) => logError(error)}>
  <YourComponent />
</ErrorBoundary>
```

### Table
A feature-rich table component with sorting and filtering.

**Features:**
- Sortable columns
- Filterable columns
- Custom cell rendering
- Row click handling
- Loading state
- Empty state
- Striped/bordered variants
- Compact mode
- Fully typed with generics

**Usage:**
```tsx
import { Table, Column } from '@/components/common';

const columns: Column<DataType>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <Badge>{value}</Badge>,
  },
];

<Table
  data={data}
  columns={columns}
  keyExtractor={(row) => row.id}
  onRowClick={handleRowClick}
  hoverable
/>
```

### Input
A flexible input component with validation and icons.

**Features:**
- 3 variants: default, filled, outlined
- Label and helper text
- Error state with message
- Left/right icon support
- Full width option
- All native input props
- Companion Textarea component

**Usage:**
```tsx
import { Input, Textarea } from '@/components/common';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  leftIcon={<MailIcon />}
/>

<Textarea
  label="Description"
  rows={4}
  helperText="Maximum 500 characters"
/>
```

### Badge
A badge component for status indicators and labels.

**Features:**
- 7 variants: default, success, warning, error, info, purple, outline
- 3 sizes: sm, md, lg
- Rounded or square
- Dot indicator
- Icon support
- StatusBadge component for common statuses

**Usage:**
```tsx
import { Badge, StatusBadge } from '@/components/common';

<Badge variant="success" dot>Active</Badge>

<StatusBadge status="processing" />
```

### Avatar
A user avatar component with initials fallback.

**Features:**
- 6 sizes: xs, sm, md, lg, xl, 2xl
- 3 variants: circle, square, rounded
- Image with fallback to initials
- Status indicator (online, offline, away, busy)
- Auto-generated color from name
- AvatarGroup component for stacked avatars

**Usage:**
```tsx
import { Avatar, AvatarGroup } from '@/components/common';

<Avatar
  src="/path/to/image.jpg"
  name="John Doe"
  size="md"
  status="online"
/>

<AvatarGroup max={3} size="sm">
  <Avatar name="Alice" />
  <Avatar name="Bob" />
  <Avatar name="Charlie" />
  <Avatar name="David" />
</AvatarGroup>
```

## Common Props

All components support the following common patterns:

- **className**: Custom CSS classes (merged with default styles using cn() utility)
- **TypeScript**: Full type safety with exported prop types
- **Dark Mode**: All components support dark mode via Tailwind's dark: classes
- **Accessibility**: ARIA attributes and keyboard navigation where applicable
- **Responsive**: Mobile-first responsive design

## Installation

These components are already included in the Sovren Portal. Simply import them:

```tsx
import { Button, Card, Modal, Loading, Table } from '@/components/common';
```

## Styling

All components use Tailwind CSS and can be customized via:

1. **className prop**: Add custom classes
2. **Tailwind config**: Modify theme colors, spacing, etc.
3. **CSS variables**: For global theme changes

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type { ButtonProps, CardProps, TableProps, Column } from '@/components/common';
```

## Best Practices

1. **Use semantic variants**: Choose variants that match the action (danger for delete, success for confirm, etc.)
2. **Consistent sizing**: Use the same size prop across related components
3. **Accessibility**: Always provide meaningful labels and alt text
4. **Error handling**: Wrap components in ErrorBoundary for production
5. **Loading states**: Show Loading component during async operations
6. **Type safety**: Use TypeScript types for better IDE support and fewer bugs

## Examples

### Form with validation
```tsx
<form>
  <Input
    label="Username"
    error={errors.username}
    leftIcon={<UserIcon />}
  />
  <Input
    label="Email"
    type="email"
    error={errors.email}
    leftIcon={<MailIcon />}
  />
  <Button type="submit" isLoading={isSubmitting} fullWidth>
    Submit
  </Button>
</form>
```

### Data table with actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>Users</CardTitle>
  </CardHeader>
  <CardContent>
    <Table
      data={users}
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email', filterable: true },
        {
          key: 'status',
          header: 'Status',
          render: (status) => <StatusBadge status={status} />,
        },
      ]}
      keyExtractor={(user) => user.id}
    />
  </CardContent>
</Card>
```

### Modal dialog
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-3 mt-6">
    <Button variant="outline" onClick={() => setIsOpen(false)} fullWidth>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirm} fullWidth>
      Confirm
    </Button>
  </div>
</Modal>
```

## Support

For issues or questions about these components, please refer to the main Sovren Portal documentation or contact the development team.
