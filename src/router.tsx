import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { Dashboard } from "./components/Dashboard";
import { ExpressionBrowser } from "./components/ExpressionBrowser";
import { ExerciseInterface } from "./components/ExerciseInterface";
import { ProgressTracker } from "./components/ProgressTracker";
import { UserProfile } from "./components/UserProfile";
import AuthForm from "./components/AuthForm";
import { Navigation } from "./components/Navigation";

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
});

// Dashboard route (home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

// Expressions browsing
const expressionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expressions",
  component: ExpressionBrowser,
});

// Expression detail with exercises
const expressionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expressions/$expressionId",
  component: ExpressionBrowser,
});

// Exercise interface
const exerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises/$expressionId",
  component: ExerciseInterface,
});

// Progress tracking
const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: ProgressTracker,
});

// User profile
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: UserProfile,
});

// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthForm,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  expressionsRoute,
  expressionDetailRoute,
  exerciseRoute,
  progressRoute,
  profileRoute,
  authRoute,
]);

// Create router
export const router = createRouter({ routeTree });

// Type-safe route types
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
