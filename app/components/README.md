# Reusable Components

This folder contains reusable components for the Kost Management application.

## Admin Components

### AdminHeader
Header component for admin pages with navigation menu and logout functionality.

**Props:**
- `title?: string` - Header title (default: "The Curator")
- `showBackButton?: boolean` - Show back button instead of menu (default: false)
- `showMenu?: boolean` - Show desktop navigation menu (default: true)

**Usage:**
```tsx
import { AdminHeader } from '@/app/components';

<AdminHeader />
<AdminHeader title="Room Details" showBackButton={true} showMenu={false} />
```

### AdminBottomNav
Bottom navigation bar for admin pages (mobile only).

**Features:**
- Auto-detects active page
- Shows on mobile only (hidden on desktop)
- Navigation items: Dashboard, Rooms, Residents, Logout

**Usage:**
```tsx
import { AdminBottomNav } from '@/app/components';

<AdminBottomNav />
```

## User Components

### UserHeader
Header component for resident/user pages with profile picture and notifications.

**Props:**
- `user?: User | null` - User object for profile picture
- `title?: string` - Header title (default: "Welcome Home")
- `showBackButton?: boolean` - Show back button instead of profile picture (default: false)
- `showMenu?: boolean` - Show desktop navigation menu (default: true)

**Features:**
- Desktop navigation menu (Dashboard, Food Order, History, Request, Logout)
- Mobile: Menu button, notifications, logout button
- Desktop: Full navigation menu, notifications, profile picture
- Profile picture shown on both mobile and desktop
- Responsive design with different layouts

**Usage:**
```tsx
import { UserHeader } from '@/app/components';

<UserHeader user={user} title="Welcome Home" />
<UserHeader user={user} title="Payment History" showBackButton={true} showMenu={false} />
```

### UserBottomNav
Bottom navigation bar for resident/user pages (mobile only).

**Features:**
- Auto-detects active page
- Shows on mobile only (hidden on desktop)
- Navigation items: Dashboard, Food, History, Request
- Same theme as AdminBottomNav but different icons

**Usage:**
```tsx
import { UserBottomNav } from '@/app/components';

<UserBottomNav />
```

## Design System

All components follow the same design system:
- Colors: Primary (#4C4E50), Secondary (#003EC6)
- Font families: Manrope (headline/body), Inter (label)
- Responsive: Mobile-first with md: breakpoint
- Theme: Light mode with dark mode support
- Animations: Smooth transitions and hover effects

## Import Pattern

You can import components individually or together:

```tsx
// Individual imports
import AdminHeader from '@/app/components/AdminHeader';
import UserBottomNav from '@/app/components/UserBottomNav';

// Named imports from index
import { AdminHeader, AdminBottomNav, UserHeader, UserBottomNav } from '@/app/components';
```
