# Sovren Portal Components Reference

## Component Overview

### 1. PortalLayout
**Location:** `/opt/sovren-portal/src/components/portal/PortalLayout.tsx`
**Size:** 45 lines
**Purpose:** Main layout wrapper for authenticated portal pages

**Props:**
```typescript
interface PortalLayoutProps {
  children: ReactNode;
  className?: string;
}
```

**Features:**
- Manages sidebar collapsed state
- Dark theme gradient background
- Responsive container
- Custom scrollbar styling

---

### 2. Sidebar
**Location:** `/opt/sovren-portal/src/components/portal/Sidebar.tsx`
**Size:** 309 lines
**Purpose:** Fixed navigation sidebar with collapsible design

**Props:**
```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}
```

**Navigation Sections:**

#### Command Center
- Dashboard (`/portal`)
- Metrics (`/portal/metrics`)
- Voice Console (`/portal/voice`)

#### Shadow Board
- Executives (`/portal/executives`)
- Strategic Overview (`/portal/executives/strategy`)

#### CRM
- Companies (`/portal/crm/companies`)
- Contacts (`/portal/crm/contacts`)
- Deals (`/portal/crm/deals`)

#### Governance
- Compliance (`/portal/governance`)
- Security (`/portal/governance/security`)

#### Settings
- Account (`/portal/settings`)
- Billing (`/portal/settings/billing`)
- Integrations (`/portal/settings/integrations`)

**Connection Status Indicator:**
- `connected` - Green with pulse animation
- `connecting` - Yellow with pulse
- `disconnected` - Red static

---

### 3. Header
**Location:** `/opt/sovren-portal/src/components/portal/Header.tsx`
**Size:** 355 lines
**Purpose:** Top navigation bar with search, notifications, and user menu

**Features:**

#### Global Search
- Placeholder: "Search companies, deals, contacts... (Cmd+K)"
- Keyboard shortcut indicator
- Dark theme styling

#### Quick Actions
- Add button (plus icon)
- Extensible for more actions

#### Notifications Dropdown
- Unread count badge
- Notification list with:
  - Title
  - Message
  - Relative timestamp
  - Read/unread indicator
- "View all notifications" link

**Mock Notifications Schema:**
```typescript
{
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
```

#### User Menu Dropdown
**User Info Display:**
- User initials avatar (tier-colored)
- Name or email
- Tier badge (FOUNDER/BUSINESS/PROFESSIONAL/SOLO)
- Subscriber ID (truncated)

**Menu Items:**
- Account Settings → `/portal/settings`
- Billing & Plans → `/portal/settings/billing`
- Help & Support → `/portal/help`
- Sign Out (logout and redirect to `/`)

**Tier Colors:**
```typescript
FOUNDER:       Purple → Pink gradient
BUSINESS:      Blue → Cyan gradient
PROFESSIONAL:  Green → Emerald gradient
SOLO:          Gray gradient
```

---

### 4. App Wrapper
**Location:** `/opt/sovren-portal/src/pages/_app.tsx`
**Size:** 129 lines
**Purpose:** Next.js app configuration with providers

**Provider Stack:**
```
ErrorBoundary
  └─ QueryClientProvider (React Query)
      └─ AuthProvider (Auth Context)
          └─ Page Component
```

**QueryClient Configuration:**
```typescript
{
  queries: {
    staleTime: 60000,           // 1 minute
    gcTime: 300000,             // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
}
```

**Error Boundary:**
- Catches React errors globally
- Shows user-friendly error screen
- Displays error details (expandable)
- Provides reload button

**Auth Provider:**
- Prevents hydration issues
- Shows loading spinner during init
- Integrates with `useAuth()` hook

---

## Sample Dashboard Page
**Location:** `/opt/sovren-portal/src/pages/portal/index.tsx`
**Size:** ~220 lines

**Features Demonstrated:**

### Auth Guard
```typescript
useEffect(() => {
  if (!loading && !isAuthenticated) {
    router.push('/');
  }
}, [isAuthenticated, loading, router]);
```

### Welcome Section
- Personalized greeting
- Command center status message
- Blue/purple gradient background

### Stat Cards (4 columns)
```typescript
interface StatCard {
  title: string;        // "Active Deals"
  value: string;        // "12"
  change: string;       // "+3"
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: ReactNode;
}
```

**Included Stats:**
- Active Deals (green)
- Companies (building icon)
- Revenue MRR (trend up)
- AI Insights (lightbulb)

### Activity Feed
```typescript
interface ActivityItem {
  title: string;        // "New deal created"
  description: string;  // "TechCorp Enterprise - $50K ARR"
  time: string;        // "5 minutes ago"
  type: 'deal' | 'insight' | 'company' | 'voice';
}
```

**Activity Types:**
- `deal` - Green background
- `insight` - Blue background
- `company` - Purple background
- `voice` - Orange background

---

## Index Export
**Location:** `/opt/sovren-portal/src/components/portal/index.ts`

```typescript
export { PortalLayout } from './PortalLayout';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
```

**Usage:**
```typescript
import { PortalLayout, Sidebar, Header } from '@/components/portal';
```

---

## Integration with Existing Code

### useAuth Hook
**Location:** `/opt/sovren-portal/src/hooks/useAuth.ts`

**Returns:**
```typescript
{
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, authTokens: AuthTokens) => void;
  logout: () => void;
}
```

### User Type
**Location:** `/opt/sovren-portal/src/types/auth.ts`

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  subscriber_id: string;
  tenant_id: string;
  tier: 'FOUNDER' | 'SOLO' | 'PROFESSIONAL' | 'BUSINESS';
}
```

---

## Styling Utilities

### cn() Helper
**Location:** `/opt/sovren-portal/src/lib/cn.ts`

```typescript
import { cn } from '@/lib/cn';

// Usage
className={cn(
  'base-classes',
  condition && 'conditional-classes',
  'more-classes'
)}
```

### Tailwind Classes Used

**Layout:**
- `min-h-screen` - Full viewport height
- `flex` - Flexbox layout
- `fixed` - Fixed positioning
- `z-50` - Z-index layering

**Spacing:**
- `px-4`, `py-2` - Padding
- `space-x-4` - Gap between flex items
- `ml-6` - Margin left

**Colors:**
- `bg-black` - Pure black background
- `bg-gray-900` - Dark gray backgrounds
- `border-gray-800` - Border color
- `text-white` - White text
- `text-gray-400` - Muted text

**Interactive:**
- `hover:bg-gray-800` - Hover state
- `transition-colors` - Smooth transitions
- `cursor-pointer` - Pointer cursor

**Responsive:**
- `hidden sm:block` - Show on small+
- `md:grid-cols-2` - 2 columns on medium+
- `lg:grid-cols-4` - 4 columns on large+

---

## File Sizes Summary

```
Header.tsx        - 16KB (355 lines) - User menu, notifications, search
Sidebar.tsx       - 16KB (309 lines) - Navigation with 5 sections
PortalLayout.tsx  - 4KB  (45 lines)  - Layout wrapper
_app.tsx          - 8KB  (129 lines) - App providers and error boundary
index.tsx         - 12KB (~220 lines) - Sample dashboard page
index.ts          - 4KB  (3 lines)   - Component exports
```

**Total:** ~60KB of production-ready portal code

---

## Quick Start

1. **Create a new portal page:**
```typescript
// src/pages/portal/my-page.tsx
import { PortalLayout } from '@/components/portal';

export default function MyPage() {
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-white">My Page</h1>
      {/* Your content */}
    </PortalLayout>
  );
}
```

2. **Add to navigation:**
Edit `Sidebar.tsx` navigation array to add new menu item.

3. **Protect route:**
```typescript
const { isAuthenticated, loading } = useAuth();

useEffect(() => {
  if (!loading && !isAuthenticated) {
    router.push('/');
  }
}, [isAuthenticated, loading, router]);
```

---

**All components are production-ready, fully typed, and documented.**
