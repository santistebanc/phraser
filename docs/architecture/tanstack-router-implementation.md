# TanStack Router Implementation Guide

## Overview

This guide provides the implementation details for using TanStack Router in the Phraser frontend enhancement, including setup, route definitions, and integration patterns.

## Installation

```bash
npm install @tanstack/react-router
```

## Router Setup

### File: `src/router.ts`

```typescript
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { Dashboard } from './components/Dashboard'
import { ExpressionBrowser } from './components/ExpressionBrowser'
import { ExerciseInterface } from './components/ExerciseInterface'
import { ProgressTracker } from './components/ProgressTracker'
import { UserProfile } from './components/UserProfile'
import { AuthForm } from './components/AuthForm'

// Root route with navigation
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  ),
})

// Dashboard route (home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

// Expressions browsing
const expressionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expressions',
  component: ExpressionBrowser,
})

// Expression detail with exercises
const expressionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expressions/$expressionId',
  component: ExpressionBrowser,
})

// Exercise interface
const exerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises/$expressionId',
  component: ExerciseInterface,
})

// Progress tracking
const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progress',
  component: ProgressTracker,
})

// User profile
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: UserProfile,
})

// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthForm,
})

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  expressionsRoute,
  expressionDetailRoute,
  exerciseRoute,
  progressRoute,
  profileRoute,
  authRoute,
])

// Create router
export const router = createRouter({ routeTree })

// Type-safe route types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

## App Integration

### File: `src/App.tsx`

```typescript
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { router } from './router'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
```

## Navigation Component

### File: `src/components/Navigation.tsx`

```typescript
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export function Navigation() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth' })
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
            Phraser
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
            >
              Dashboard
            </Link>
            <Link
              to="/expressions"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
            >
              Expressions
            </Link>
            <Link
              to="/progress"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
            >
              Progress
            </Link>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <span>{user.username}</span>
                <span>▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## Route Parameters and Search Params

### Type-Safe Route Parameters

```typescript
// In ExerciseInterface component
import { useParams, useSearch } from "@tanstack/react-router";

export function ExerciseInterface() {
  const { expressionId } = useParams({ from: "/exercises/$expressionId" });
  const search = useSearch({ from: "/exercises/$expressionId" });

  // expressionId is fully typed as string
  // search params are type-safe
}
```

### Search Params for Filtering

```typescript
// In ExpressionBrowser component
import { useSearch, useNavigate } from '@tanstack/react-router'

export function ExpressionBrowser() {
  const search = useSearch({ from: '/expressions' })
  const navigate = useNavigate()

  const updateFilters = (newFilters: Partial<typeof search>) => {
    navigate({
      to: '/expressions',
      search: { ...search, ...newFilters },
      replace: true,
    })
  }

  return (
    <div>
      <input
        value={search.query || ''}
        onChange={(e) => updateFilters({ query: e.target.value })}
        placeholder="Search expressions..."
      />
      <select
        value={search.category || ''}
        onChange={(e) => updateFilters({ category: e.target.value })}
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  )
}
```

## Route Guards and Authentication

### Protected Routes

```typescript
// In router.ts
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth" });
    }
  },
});

// Apply to routes that need authentication
const expressionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/expressions",
  component: ExpressionBrowser,
});
```

### Context Integration

```typescript
// In router.ts
export const router = createRouter({
  routeTree,
  context: {
    user: null, // Will be set by AuthProvider
  },
});

// In AuthProvider
useEffect(() => {
  router.setContext({ user });
}, [user]);
```

## Performance Optimizations

### Lazy Loading

```typescript
// Lazy load heavy components
const ExpressionBrowser = lazy(() => import('./components/ExpressionBrowser'))
const ProgressTracker = lazy(() => import('./components/ProgressTracker'))

// Wrap with Suspense
const expressionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expressions',
  component: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <ExpressionBrowser />
    </Suspense>
  ),
})
```

### Prefetching

```typescript
// Prefetch routes on hover
<Link
  to="/expressions"
  preload="intent"
  className="..."
>
  Expressions
</Link>
```

## Error Handling

### Error Boundaries

```typescript
// In router.ts
const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary fallback={<ErrorComponent />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  ),
})
```

### Not Found Handling

```typescript
// 404 route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});
```

## Testing

### Router Testing

```typescript
import { createRouter } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'

test('navigates to expressions page', () => {
  const router = createRouter({ routeTree })

  render(
    <RouterProvider router={router} />
  )

  fireEvent.click(screen.getByText('Expressions'))
  expect(screen.getByText('Expression Browser')).toBeInTheDocument()
})
```

## Benefits of TanStack Router

### Type Safety

- Route parameters are fully typed
- Search params are type-safe
- Navigation is type-checked

### Performance

- Better performance than React Router
- Built-in code splitting
- Efficient re-renders

### Developer Experience

- File-based routing structure
- Excellent TypeScript support
- Modern API design

### Integration

- Works seamlessly with React Query
- Easy integration with existing contexts
- Built-in search params handling

## Migration from React Router

### Key Differences

1. **API:** Different hooks and components
2. **Type Safety:** Much better TypeScript support
3. **Performance:** Better performance characteristics
4. **Search Params:** Built-in type-safe search params

### Migration Steps

1. Install TanStack Router
2. Update route definitions
3. Replace React Router hooks with TanStack Router equivalents
4. Update navigation components
5. Test all routes and navigation

This implementation provides a modern, type-safe routing solution that's perfect for our React 19 + TypeScript frontend enhancement.
