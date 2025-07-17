# Frontend Architecture

## Component Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── auth/              # Authentication components
│   ├── exercise/          # Exercise-related components
│   ├── progress/          # Progress tracking components
│   └── layout/            # Layout components
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   ├── useExercise.ts     # Exercise management hook
│   ├── useProgress.ts     # Progress tracking hook
│   └── useTheme.ts        # Theme management hook
├── lib/
│   ├── convex.ts          # Convex client configuration
│   ├── utils.ts           # Utility functions
│   └── constants.ts       # Application constants
└── pages/
    ├── AuthPage.tsx       # Login/signup page
    ├── PracticePage.tsx   # Main practice interface
    └── LoadingPage.tsx    # Loading states
```

## State Management

**Convex Real-time State:**
- User authentication state
- Current exercise data
- User progress and level
- Real-time updates for immediate feedback

**Local State (React Hooks):**
- UI state (loading, error states)
- Form data (answer input)
- Theme preferences
- Session-specific data

## Theme System

```typescript
// src/lib/theme.ts
export const theme = {
  light: {
    background: "#ffffff",
    foreground: "#000000",
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#f59e0b",
    border: "#e2e8f0",
  },
  dark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    primary: "#60a5fa",
    secondary: "#94a3b8",
    accent: "#fbbf24",
    border: "#334155",
  }
};
```

---
