import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Test function to validate expression schema
export const testExpressionSchema = mutation({
  args: {
    text: v.string(),
    translation: v.string(),
    difficulty: v.number(),
    category: v.string(),
    usageExamples: v.array(v.string()),
    tags: v.array(v.string()),
  },
  returns: v.id("expressions"),
  handler: async (ctx, args) => {
    const expressionId = await ctx.db.insert("expressions", {
      text: args.text,
      translation: args.translation,
      difficulty: args.difficulty,
      category: args.category,
      usageExamples: args.usageExamples,
      tags: args.tags,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true,
      usageCount: 0,
    });
    return expressionId;
  },
});

// Test function to validate exercise schema
export const testExerciseSchema = mutation({
  args: {
    expressionId: v.id("expressions"),
    type: v.string(),
    question: v.string(),
    correctAnswer: v.string(),
    difficulty: v.number(),
    hints: v.optional(v.array(v.string())),
  },
  returns: v.id("exercises"),
  handler: async (ctx, args) => {
    const exerciseId = await ctx.db.insert("exercises", {
      expressionId: args.expressionId,
      type: args.type,
      question: args.question,
      correctAnswer: args.correctAnswer,
      difficulty: args.difficulty,
      hints: args.hints,
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });
    return exerciseId;
  },
});

// Query to test schema queries
export const testSchemaQueries = query({
  args: {},
  returns: v.object({
    expressionsCount: v.number(),
    exercisesCount: v.number(),
    usersCount: v.number(),
  }),
  handler: async (ctx) => {
    const expressions = await ctx.db.query("expressions").collect();
    const exercises = await ctx.db.query("exercises").collect();
    const users = await ctx.db.query("users").collect();

    return {
      expressionsCount: expressions.length,
      exercisesCount: exercises.length,
      usersCount: users.length,
    };
  },
});
