import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Test function to verify schema and database operations work
export const testContentGeneration = mutation({
  args: {
    category: v.string(),
    difficulty: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    expressionId: v.optional(v.id("expressions")),
    exerciseIds: v.optional(v.array(v.id("exercises"))),
  }),
  handler: async (ctx, args) => {
    try {
      // Test creating a sample expression (without LLM)
      const expressionId = await ctx.db.insert("expressions", {
        text: "Das ist ein Test",
        translation: "This is a test",
        difficulty: args.difficulty,
        category: args.category,
        usageExamples: [
          "Das ist ein Test für die Anwendung.",
          "Wir machen einen Test.",
          "Der Test war erfolgreich.",
        ],
        tags: ["test", "basic", "example"],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        isActive: true,
        usageCount: 0,
      });

      // Test creating sample exercises
      const exerciseIds = [];
      for (let i = 0; i < 3; i++) {
        const exerciseId = await ctx.db.insert("exercises", {
          expressionId,
          type: i === 0 ? "translation" : i === 1 ? "contextual" : "completion",
          question: `Test question ${i + 1} for "Das ist ein Test"`,
          correctAnswer: `Test answer ${i + 1}`,
          difficulty: args.difficulty,
          hints: [`Hint ${i + 1}`],
          createdAt: Date.now(),
          globalUsageCount: 0,
          globalAverageScore: 0,
          isActive: true,
        });
        exerciseIds.push(exerciseId);
      }

      return {
        success: true,
        message: "Test content generation successful",
        expressionId,
        exerciseIds,
      };
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

// Query to check content stats
export const getTestContentStats = query({
  args: {},
  returns: v.object({
    expressionsCount: v.number(),
    exercisesCount: v.number(),
    activeExpressions: v.number(),
    activeExercises: v.number(),
  }),
  handler: async (ctx) => {
    const expressions = await ctx.db.query("expressions").collect();
    const exercises = await ctx.db.query("exercises").collect();

    return {
      expressionsCount: expressions.length,
      exercisesCount: exercises.length,
      activeExpressions: expressions.filter((e) => e.isActive).length,
      activeExercises: exercises.filter((e) => e.isActive).length,
    };
  },
});
