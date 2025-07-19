import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
