import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a random exercise by expression ID, weighted by user level
export const getRandomExerciseByExpression = query({
  args: {
    expressionId: v.id("expressions"),
    userId: v.optional(v.id("users")),
  },
  returns: v.union(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      expressionId: v.id("expressions"),
      type: v.string(),
      question: v.string(),
      correctAnswer: v.string(),
      difficulty: v.number(),
      hints: v.optional(v.array(v.string())),
      createdAt: v.number(),
      globalUsageCount: v.number(),
      globalAverageScore: v.number(),
      isActive: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get user's current level if available
    let userLevel = 1000; // Default level
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        userLevel = user.currentLevel;
      }
    }

    // Get all exercises for this expression
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_expression", (q) =>
        q.eq("expressionId", args.expressionId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (exercises.length === 0) {
      return null;
    }

    // Weight exercises by proximity to user level
    const weightedExercises = exercises.map((exercise) => {
      const levelDiff = Math.abs(exercise.difficulty - userLevel);
      const weight = Math.max(1, 100 - levelDiff); // Higher weight for closer difficulty
      return { exercise, weight };
    });

    // Sort by weight (descending) and take the first one
    weightedExercises.sort((a, b) => b.weight - a.weight);

    return weightedExercises[0].exercise;
  },
});

// Get a completely random exercise weighted by user level
export const getRandomExercise = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  returns: v.union(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      expressionId: v.id("expressions"),
      type: v.string(),
      question: v.string(),
      correctAnswer: v.string(),
      difficulty: v.number(),
      hints: v.optional(v.array(v.string())),
      createdAt: v.number(),
      globalUsageCount: v.number(),
      globalAverageScore: v.number(),
      isActive: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get user's current level if available
    let userLevel = 1000; // Default level
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        userLevel = user.currentLevel;
      }
    }

    // First try to get active exercises
    let exercises = await ctx.db
      .query("exercises")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // If no active exercises, get any exercises
    if (exercises.length === 0) {
      exercises = await ctx.db.query("exercises").collect();
    }

    // If still no exercises, return null
    if (exercises.length === 0) {
      return null;
    }

    // Weight exercises by proximity to user level
    const weightedExercises = exercises.map((exercise) => {
      const levelDiff = Math.abs(exercise.difficulty - userLevel);
      const weight = Math.max(1, 100 - levelDiff); // Higher weight for closer difficulty
      return { exercise, weight };
    });

    // Sort by weight (descending) and take the first one
    weightedExercises.sort((a, b) => b.weight - a.weight);

    return weightedExercises[0].exercise;
  },
});

// Get exercises by expression ID (matches component expectation)
export const getExercisesByExpression = query({
  args: { expressionId: v.id("expressions") },
  returns: v.array(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      expressionId: v.id("expressions"),
      type: v.string(),
      question: v.string(),
      correctAnswer: v.string(),
      difficulty: v.number(),
      hints: v.optional(v.array(v.string())),
      createdAt: v.number(),
      globalUsageCount: v.number(),
      globalAverageScore: v.number(),
      isActive: v.boolean(),
    }),
  ),
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

// Legacy function for backward compatibility
export const getExercisesForExpression = query({
  args: { expressionId: v.id("expressions") },
  returns: v.array(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      expressionId: v.id("expressions"),
      type: v.string(),
      question: v.string(),
      correctAnswer: v.string(),
      difficulty: v.number(),
      hints: v.optional(v.array(v.string())),
      createdAt: v.number(),
      globalUsageCount: v.number(),
      globalAverageScore: v.number(),
      isActive: v.boolean(),
    }),
  ),
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

// Updated submit exercise attempt (matches component expectation)
export const submitExerciseAttempt = mutation({
  args: {
    exerciseId: v.id("exercises"),
    userId: v.id("users"),
    userAnswer: v.string(),
    isCorrect: v.boolean(),
    timeSpent: v.number(),
    score: v.number(),
  },
  returns: v.id("exerciseAttempts"),
  handler: async (ctx, args) => {
    // Create exercise attempt
    const attemptId = await ctx.db.insert("exerciseAttempts", {
      userId: args.userId,
      exerciseId: args.exerciseId,
      userAnswer: args.userAnswer,
      aiScore: args.isCorrect ? 1.0 : 0.0, // Convert boolean to score
      aiFeedback: args.isCorrect ? "Correct!" : "Incorrect. Keep practicing!",
      levelChange: args.isCorrect ? 1 : -1,
      timeSpent: args.timeSpent,
      createdAt: Date.now(),
    });

    // Update user stats
    const user = await ctx.db.get(args.userId);
    if (user) {
      const newTotalExercises = user.totalExercises + 1;
      const newAverageScore =
        (user.averageScore * user.totalExercises + (args.isCorrect ? 100 : 0)) /
        newTotalExercises;
      const newLevel = user.currentLevel + (args.isCorrect ? 1 : -1);

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
          (args.isCorrect ? 100 : 0)) /
        newUsageCount;

      await ctx.db.patch(args.exerciseId, {
        globalUsageCount: newUsageCount,
        globalAverageScore: newAverageScore,
      });
    }

    return attemptId;
  },
});

// Legacy function for backward compatibility
export const submitExerciseAttemptLegacy = mutation({
  args: {
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    userAnswer: v.string(),
    aiScore: v.number(),
    aiFeedback: v.string(),
    levelChange: v.number(),
    timeSpent: v.number(),
  },
  returns: v.id("exerciseAttempts"),
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

export const getUserAttempts = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("exerciseAttempts"),
      _creationTime: v.number(),
      userId: v.id("users"),
      exerciseId: v.id("exercises"),
      userAnswer: v.string(),
      aiScore: v.number(),
      aiFeedback: v.string(),
      levelChange: v.number(),
      timeSpent: v.number(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("exerciseAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return attempts;
  },
});
