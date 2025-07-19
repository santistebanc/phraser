# Frontend API Specifications

## Convex Functions for Frontend Enhancement

This document defines the new Convex functions required to support the frontend enhancement, following existing patterns and integration requirements.

## Expressions API

### File: `convex/expressions.ts`

#### `getExpressions` - Get expressions with filtering and pagination

```typescript
export const getExpressions = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let expressionsQuery = ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.category) {
      expressionsQuery = expressionsQuery.withIndex("by_category", (q) =>
        q.eq("category", args.category),
      );
    }

    if (args.difficulty) {
      expressionsQuery = expressionsQuery.withIndex("by_difficulty", (q) =>
        q.eq("difficulty", args.difficulty),
      );
    }

    const expressions = await expressionsQuery
      .order("desc")
      .take(args.limit || 50);

    return expressions;
  },
});
```

**Usage:**

```typescript
const expressions = useQuery(api.expressions.getExpressions, {
  category: "business",
  difficulty: 1200,
  limit: 20,
});
```

#### `getCategories` - Get available expression categories

```typescript
export const getCategories = query({
  args: {},
  handler: async (ctx, args) => {
    const expressions = await ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const categories = [...new Set(expressions.map((e) => e.category))];
    return categories.sort();
  },
});
```

**Usage:**

```typescript
const categories = useQuery(api.expressions.getCategories);
```

#### `getExpressionsByDifficulty` - Get expressions by difficulty range

```typescript
export const getExpressionsByDifficulty = query({
  args: {
    minDifficulty: v.number(),
    maxDifficulty: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const expressions = await ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) =>
        q.and(
          q.gte(q.field("difficulty"), args.minDifficulty),
          q.lte(q.field("difficulty"), args.maxDifficulty),
        ),
      )
      .order("desc")
      .take(args.limit || 20);

    return expressions;
  },
});
```

**Usage:**

```typescript
const expressions = useQuery(api.expressions.getExpressionsByDifficulty, {
  minDifficulty: 1000,
  maxDifficulty: 1200,
  limit: 20,
});
```

## Exercises API

### File: `convex/exercises.ts`

#### `getExercisesForExpression` - Get exercises for an expression

```typescript
export const getExercisesForExpression = query({
  args: { expressionId: v.id("expressions") },
  handler: async (ctx, args) => {
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_expression", (q) =>
        q.eq("expressionId", args.expressionId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return exercises;
  },
});
```

**Usage:**

```typescript
const exercises = useQuery(api.exercises.getExercisesForExpression, {
  expressionId: "expression_id_here",
});
```

#### `submitExerciseAttempt` - Submit exercise attempt with AI scoring

```typescript
export const submitExerciseAttempt = mutation({
  args: {
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    userAnswer: v.string(),
    aiScore: v.number(),
    aiFeedback: v.string(),
    levelChange: v.number(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    // Create exercise attempt
    const attemptId = await ctx.db.insert("exerciseAttempts", {
      userId: args.userId,
      exerciseId: args.exerciseId,
      userAnswer: args.userAnswer,
      aiScore: args.aiScore,
      aiFeedback: args.aiFeedback,
      levelChange: args.levelChange,
      timeSpent: args.timeSpent,
      createdAt: Date.now(),
    });

    // Update user stats
    const user = await ctx.db.get(args.userId);
    if (user) {
      const newTotalExercises = user.totalExercises + 1;
      const newAverageScore =
        (user.averageScore * user.totalExercises + args.aiScore * 100) /
        newTotalExercises;
      const newLevel = user.currentLevel + args.levelChange;

      await ctx.db.patch(args.userId, {
        totalExercises: newTotalExercises,
        averageScore: newAverageScore,
        currentLevel: newLevel,
        lastActive: Date.now(),
      });
    }

    // Update exercise stats
    const exercise = await ctx.db.get(args.exerciseId);
    if (exercise) {
      const newUsageCount = exercise.globalUsageCount + 1;
      const newAverageScore =
        (exercise.globalAverageScore * exercise.globalUsageCount +
          args.aiScore * 100) /
        newUsageCount;

      await ctx.db.patch(args.exerciseId, {
        globalUsageCount: newUsageCount,
        globalAverageScore: newAverageScore,
      });
    }

    return attemptId;
  },
});
```

**Usage:**

```typescript
const submitAttempt = useMutation(api.exercises.submitExerciseAttempt);

// In component
await submitAttempt({
  userId: user._id,
  exerciseId: exercise._id,
  userAnswer: "user's answer",
  aiScore: 0.85,
  aiFeedback: "Good answer!",
  levelChange: 5,
  timeSpent: 30,
});
```

#### `getUserAttempts` - Get user's exercise attempts

```typescript
export const getUserAttempts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("exerciseAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return attempts;
  },
});
```

**Usage:**

```typescript
const attempts = useQuery(api.exercises.getUserAttempts, {
  userId: user._id,
});
```

## Progress API

### File: `convex/progress.ts`

#### `getAllUserProgress` - Get all user progress

```typescript
export const getAllUserProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return progress;
  },
});
```

**Usage:**

```typescript
const progress = useQuery(api.progress.getAllUserProgress, {
  userId: user._id,
});
```

#### `getUserProgress` - Get user progress for specific expression

```typescript
export const getUserProgress = query({
  args: {
    userId: v.id("users"),
    expressionId: v.id("expressions"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_expression", (q) =>
        q.eq("userId", args.userId).eq("expressionId", args.expressionId),
      )
      .unique();

    return progress;
  },
});
```

**Usage:**

```typescript
const progress = useQuery(api.progress.getUserProgress, {
  userId: user._id,
  expressionId: expression._id,
});
```

#### `updateUserProgress` - Update user progress

```typescript
export const updateUserProgress = mutation({
  args: {
    userId: v.id("users"),
    expressionId: v.id("expressions"),
    masteryLevel: v.number(),
    attemptsCount: v.number(),
    bestScore: v.number(),
    averageScore: v.number(),
  },
  handler: async (ctx, args) => {
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_expression", (q) =>
        q.eq("userId", args.userId).eq("expressionId", args.expressionId),
      )
      .unique();

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        masteryLevel: args.masteryLevel,
        attemptsCount: args.attemptsCount,
        lastAttempted: Date.now(),
        bestScore: Math.max(existingProgress.bestScore, args.bestScore),
        averageScore: args.averageScore,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId: args.userId,
        expressionId: args.expressionId,
        masteryLevel: args.masteryLevel,
        attemptsCount: args.attemptsCount,
        lastAttempted: Date.now(),
        bestScore: args.bestScore,
        averageScore: args.averageScore,
      });
    }
  },
});
```

**Usage:**

```typescript
const updateProgress = useMutation(api.progress.updateUserProgress);

// In component
await updateProgress({
  userId: user._id,
  expressionId: expression._id,
  masteryLevel: 75,
  attemptsCount: 5,
  bestScore: 90,
  averageScore: 82,
});
```

## Error Handling Patterns

### Standard Error Response Format

```typescript
// Error handling in Convex functions
try {
  // Function logic
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`);
}
```

### Frontend Error Handling

```typescript
// In React components
const { data, error, isLoading } = useQuery(api.expressions.getExpressions, args);

if (error) {
  return <ErrorMessage message={error.message} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

## Performance Considerations

### Query Optimization

1. **Use Indexes:** All queries use appropriate database indexes
2. **Pagination:** Large datasets are paginated (20 items per page)
3. **Filtering:** Queries support efficient filtering
4. **Caching:** Convex automatically caches query results

### Mutation Optimization

1. **Batch Updates:** Related updates are batched in single transactions
2. **Atomic Operations:** Critical updates are atomic
3. **Error Recovery:** Failed mutations have proper error handling
4. **Optimistic Updates:** UI updates immediately, syncs in background

## Integration with Existing Auth

### Authentication Integration

All new functions integrate with existing authentication:

```typescript
// Example: Get current user from context
const { user } = useAuth();

// Use user ID in queries
const progress = useQuery(api.progress.getAllUserProgress, {
  userId: user?._id,
});
```

### Authorization Patterns

```typescript
// Ensure user can only access their own data
if (args.userId !== ctx.userId) {
  throw new Error("Unauthorized access");
}
```

## Testing Strategy

### Unit Testing

```typescript
// Test Convex functions
describe("getExpressions", () => {
  it("should return expressions with filters", async () => {
    // Test implementation
  });
});
```

### Integration Testing

```typescript
// Test frontend-backend integration
describe("ExpressionBrowser", () => {
  it("should load expressions from API", async () => {
    // Test implementation
  });
});
```

## Deployment Considerations

### Function Deployment

```bash
# Deploy new Convex functions
npx convex deploy
```

### Environment Variables

```typescript
// Access environment variables in Convex
const apiKey = process.env.OPENAI_API_KEY;
```

### Monitoring

- Monitor function execution times
- Track error rates
- Monitor query performance
- Alert on failures

## Security Considerations

### Input Validation

```typescript
// Validate all inputs
args: {
  userId: v.id("users"),
  expressionId: v.id("expressions"),
  userAnswer: v.string(),
  aiScore: v.number(),
}
```

### Data Access Control

```typescript
// Ensure users can only access their own data
const user = await ctx.db.get(args.userId);
if (!user || user._id !== ctx.userId) {
  throw new Error("Unauthorized");
}
```

### Error Information

```typescript
// Don't expose sensitive information in errors
throw new Error("Operation failed"); // Generic error
// Not: throw new Error(`Database error: ${sensitiveInfo}`);
```
