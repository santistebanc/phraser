# **Phraser Language Learning App - Brownfield Architecture Document**

## **Introduction**

This document captures the CURRENT STATE of the Phraser language learning application codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on frontend enhancements.

### **Document Scope**

**Focused on areas relevant to: Frontend UI Enhancement**

- Building comprehensive frontend components for expression browsing
- Creating interactive exercise interface with AI scoring
- Implementing progress tracking and user dashboard improvements
- Adding navigation and user experience enhancements

### **Change Log**

| Date       | Version | Description                 | Author            |
| ---------- | ------- | --------------------------- | ----------------- |
| 2024-12-19 | 1.0     | Initial brownfield analysis | BMad Orchestrator |

## **Quick Reference - Key Files and Entry Points**

### **Critical Files for Understanding the System**

- **Main Entry**: `src/main.tsx` - React application entry point
- **App Component**: `src/App.tsx` - Main application routing and layout
- **Authentication**: `src/contexts/AuthContext.tsx` - User authentication state management
- **Backend Schema**: `convex/schema.ts` - Database schema with 5 tables
- **Backend Auth**: `convex/auth.ts` - User registration and login functions
- **UI Components**: `src/components/` - React components (AuthForm, UserDashboard, ThemeToggle)

### **Enhancement Impact Areas**

Based on the frontend enhancement requirements, these files will be affected:

- `src/App.tsx` - Add navigation and routing
- `src/components/UserDashboard.tsx` - Enhance with new features
- `src/contexts/AuthContext.tsx` - May need user data enhancements
- New files needed: Expression browser, exercise interface, progress tracking components

## **High Level Architecture**

### **Technical Summary**

**Architecture Type**: Full-stack React + Convex application
**Frontend**: React 19 + TypeScript + Tailwind CSS + Vite
**Backend**: Convex (serverless database + functions)
**Authentication**: Custom implementation with localStorage persistence
**State Management**: React Context API for auth and theme

### **Actual Tech Stack**

| Category         | Technology        | Version        | Notes                            |
| ---------------- | ----------------- | -------------- | -------------------------------- |
| Frontend Runtime | React             | 19.0.0         | Latest React with hooks          |
| Build Tool       | Vite              | 6.2.0          | Fast development server          |
| Styling          | Tailwind CSS      | 4.0.14         | Utility-first CSS framework      |
| Language         | TypeScript        | 5.7.2          | Type safety and IntelliSense     |
| Backend          | Convex            | 1.23.0         | Serverless database + functions  |
| Package Manager  | npm               | -              | Standard Node.js package manager |
| Development      | ESLint + Prettier | 9.21.0 + 3.5.3 | Code quality and formatting      |

### **Repository Structure Reality Check**

- **Type**: Monorepo with frontend and backend in same repository
- **Package Manager**: npm with npm-run-all for parallel development
- **Notable**: Convex auto-generates `_generated/` folder with TypeScript types

## **Source Tree and Module Organization**

### **Project Structure (Actual)**

```text
phraser/
├── src/
│   ├── components/          # React components (3 files)
│   │   ├── AuthForm.tsx    # Login/register form
│   │   ├── UserDashboard.tsx # Basic user stats dashboard
│   │   └── ThemeToggle.tsx # Dark/light mode toggle
│   ├── contexts/            # React contexts (4 files)
│   │   ├── AuthContext.tsx # User authentication state
│   │   ├── ThemeContext.tsx # Dark/light theme state
│   │   ├── useAuth.tsx     # Auth context hook
│   │   └── useTheme.tsx    # Theme context hook
│   ├── lib/                # Utilities (empty)
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── convex/
│   ├── _generated/         # Auto-generated Convex types
│   ├── schema.ts           # Database schema (5 tables)
│   ├── auth.ts             # Authentication functions
│   └── tsconfig.json       # TypeScript config
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

### **Key Modules and Their Purpose**

- **Authentication System**: `src/contexts/AuthContext.tsx` - Handles user login/register with localStorage persistence
- **User Interface**: `src/components/UserDashboard.tsx` - Basic dashboard showing user stats (level, exercises, score)
- **Theme Management**: `src/contexts/ThemeContext.tsx` - Dark/light mode toggle functionality
- **Backend Database**: `convex/schema.ts` - 5-table schema (users, expressions, exercises, attempts, progress)
- **Backend Auth**: `convex/auth.ts` - User registration and login with password validation

## **Data Models and APIs**

### **Data Models**

**Database Schema**: See `convex/schema.ts` for complete schema definition

**Key Tables**:

- **Users**: Authentication, ELO rating system, exercise statistics
- **Expressions**: German language expressions with difficulty ratings
- **Exercises**: Practice exercises linked to expressions
- **Exercise Attempts**: User submissions with AI scoring
- **User Progress**: Individual mastery tracking per expression

### **API Specifications**

**Convex Functions** (see `convex/auth.ts`):

- `registerUser(email, name, password)` - User registration
- `loginUser(email, password)` - User authentication
- `getUserByEmail(email)` - User lookup
- `getUserById(userId)` - User data retrieval
- `updateLastActive(userId)` - Activity tracking

**Missing APIs** (needed for enhancement):

- Expression browsing and search functions
- Exercise generation and retrieval
- Progress tracking and statistics
- User profile management

## **Technical Debt and Known Issues**

### **Critical Technical Debt**

1. **Missing Frontend Components**: No expression browser, exercise interface, or progress tracking
2. **No Navigation System**: Single-page app without routing or navigation
3. **Limited User Experience**: Basic dashboard only, no interactive learning features
4. **No Exercise Logic**: Backend schema exists but no exercise generation or scoring
5. **Authentication Security**: Passwords stored in plain text (noted in code comments)

### **Workarounds and Gotchas**

- **User Persistence**: Uses localStorage for user session (not secure for production)
- **Error Handling**: Basic try-catch with error message extraction from Convex
- **Theme Implementation**: Basic dark/light toggle without persistent storage
- **Development Setup**: Requires both `npm run dev:frontend` and `npm run dev:backend` (handled by npm-run-all)

## **Integration Points and External Dependencies**

### **External Services**

| Service      | Purpose                      | Integration Type | Key Files                      |
| ------------ | ---------------------------- | ---------------- | ------------------------------ |
| Convex       | Backend database + functions | SDK              | `convex/` directory            |
| LocalStorage | User session persistence     | Browser API      | `src/contexts/AuthContext.tsx` |

### **Internal Integration Points**

- **Frontend-Backend**: Convex React hooks (`useMutation`, `useQuery`)
- **Component Communication**: React Context API for auth and theme
- **Styling**: Tailwind CSS utility classes throughout components

## **Development and Deployment**

### **Local Development Setup**

1. **Install Dependencies**: `npm install`
2. **Start Development**: `npm run dev` (runs frontend and backend in parallel)
3. **Convex Dashboard**: Automatically opens at `http://localhost:8000`
4. **Frontend**: Available at `http://localhost:5173`

### **Build and Deployment Process**

- **Build Command**: `npm run build` (TypeScript compilation + Vite build)
- **Development**: `npm run dev` (parallel frontend + backend)
- **Linting**: `npm run lint` (TypeScript + ESLint)

## **Testing Reality**

### **Current Test Coverage**

- **Unit Tests**: None implemented
- **Integration Tests**: None implemented
- **E2E Tests**: None implemented
- **Manual Testing**: Primary QA method

### **Running Tests**

```bash
npm run lint        # TypeScript and ESLint checks
```

## **Enhancement Impact Analysis**

### **Files That Will Need Modification**

Based on the frontend enhancement requirements:

- `src/App.tsx` - Add navigation and routing system
- `src/components/UserDashboard.tsx` - Enhance with new features
- `src/contexts/AuthContext.tsx` - May need user data enhancements

### **New Files/Modules Needed**

- `src/components/ExpressionBrowser.tsx` - Browse and search expressions
- `src/components/ExerciseInterface.tsx` - Interactive exercise practice
- `src/components/ProgressTracker.tsx` - User progress visualization
- `src/components/Navigation.tsx` - App navigation system
- `src/components/UserProfile.tsx` - User profile management
- `convex/expressions.ts` - Expression browsing and search functions
- `convex/exercises.ts` - Exercise generation and scoring functions
- `convex/progress.ts` - Progress tracking and statistics

### **Integration Considerations**

- Must integrate with existing Convex authentication system
- Should follow existing Tailwind CSS styling patterns
- Need to maintain dark/light theme compatibility
- Must use existing user data structure from `convex/schema.ts`
- Should follow React Context patterns for state management

## **Appendix - Useful Commands and Scripts**

### **Frequently Used Commands**

```bash
npm run dev              # Start development (frontend + backend)
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start Convex backend only
npm run build            # Production build
npm run lint             # TypeScript and ESLint checks
npm run preview          # Preview production build
```

### **Debugging and Troubleshooting**

- **Convex Dashboard**: Available at `http://localhost:8000` during development
- **Frontend Dev Server**: Available at `http://localhost:5173`
- **Common Issues**:
  - Convex functions need to be deployed: `npx convex deploy`
  - TypeScript errors: Check `tsconfig.json` configuration
  - Styling issues: Verify Tailwind CSS classes
