# API-like Function Architecture

## Core Functions

### User Management Functions

```typescript
// convex/functions/users.ts
export const createUser = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Create new user with initial ELO rating
  }
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user data with current level
  }
});

export const updateUserLevel = mutation({
  args: { userId: v.id("users"), newLevel: v.number() },
  handler: async (ctx, args) => {
    // Update user's ELO rating
  }
});
```

### Expression Dataset Functions

```typescript
// convex/functions/expressions.ts
export const getExpressions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Get expressions with pagination
  }
});

export const generateExpressions = mutation({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    // Generate new expressions using LLM
  }
});
```

### Exercise Management Functions

```typescript
// convex/functions/exercises.ts
export const getNextExercise = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Select next exercise based on user level and history
    // Returns global exercise data + user-specific attempt history
  }
});

export const generateExercises = mutation({
  args: { expressionId: v.id("expressions"), count: v.number() },
  handler: async (ctx, args) => {
    // Generate exercises for an expression using LLM
    // Creates global exercise content independent of users
  }
});

export const updateExerciseStats = mutation({
  args: { exerciseId: v.id("exercises"), userScore: v.number() },
  handler: async (ctx, args) => {
    // Update global exercise statistics (usage count, average score)
    // Called after each user attempt
  }
});
```

### Answer Evaluation Functions

```typescript
// convex/functions/evaluation.ts
export const evaluateAnswer = mutation({
  args: { 
    exerciseId: v.id("exercises"), 
    userAnswer: v.string(),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Evaluate answer using LLM
    // Create user-specific ExerciseAttempt record
    // Update global exercise statistics
    // Update user ELO rating
  }
});
```

### ELO Rating System Functions

```typescript
// convex/functions/elo.ts
export const calculateEloChange = query({
  args: { 
    userRating: v.number(), 
    exerciseRating: v.number(), 
    userScore: v.number() 
  },
  handler: async (ctx, args) => {
    // Calculate ELO rating changes
  }
});

export const updateRatings = mutation({
  args: { 
    userId: v.id("users"), 
    exerciseId: v.id("exercises"), 
    userScore: v.number() 
  },
  handler: async (ctx, args) => {
    // Update both user and exercise ratings
  }
});
```

---
