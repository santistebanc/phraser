import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Comprehensive content generation workflow
export const generateAndStoreContent = action({
  args: {
    expressionCount: v.optional(v.number()),
    exercisesPerExpression: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    expressionsCreated: v.number(),
    exercisesCreated: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args) => {
    const expressionCount = args.expressionCount || 5; // Optimized for Convex action timeout (max ~5 expressions per batch)
    const exercisesPerExpression = args.exercisesPerExpression || 5;
    const errors: string[] = [];
    let expressionsCreated = 0;
    let exercisesCreated = 0;

    try {
      // Generate expressions with timeout handling
      const startTime = Date.now();
      const expressions = await ctx.runAction(
        api.llm_integration.generateExpression,
        {
          count: expressionCount,
        },
      );
      console.log(
        `Generated ${expressions.length} expressions in ${Date.now() - startTime}ms`,
      );

      // Store each expression and generate exercises for it
      for (const expression of expressions) {
        try {
          // Store the expression
          const expressionId = await ctx.runMutation(
            api.llm_integration.storeGeneratedExpression,
            {
              text: expression.text,
              translation: expression.translation,
              difficulty: expression.difficulty,
              category: expression.category,
              usageExamples: expression.usageExamples,
              tags: expression.tags,
            },
          );

          expressionsCreated++;

          // Generate exercises for this expression
          const exercises = await ctx.runAction(
            api.llm_integration.generateExercises,
            {
              expressionId,
              expressionText: expression.text,
              translation: expression.translation,
              usageExamples: expression.usageExamples,
              count: exercisesPerExpression,
            },
          );

          // Store each exercise
          for (const exercise of exercises) {
            try {
              await ctx.runMutation(
                api.llm_integration.storeGeneratedExercise,
                {
                  expressionId,
                  type: exercise.type,
                  question: exercise.question,
                  correctAnswer: exercise.correctAnswer,
                  difficulty: exercise.difficulty,
                  hints: exercise.hints,
                },
              );
              exercisesCreated++;
            } catch (error) {
              const errorMsg = `Failed to store exercise: ${error instanceof Error ? error.message : "Unknown error"}`;
              errors.push(errorMsg);
              console.error(errorMsg);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to store expression: ${error instanceof Error ? error.message : "Unknown error"}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        expressionsCreated,
        exercisesCreated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMsg = `Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      return {
        success: false,
        expressionsCreated: 0,
        exercisesCreated: 0,
        errors: [errorMsg],
      };
    }
  },
});

// Content validation and quality check
export const validateContentQuality = action({
  args: {
    text: v.string(),
    translation: v.string(),
    usageExamples: v.array(v.string()),
  },
  returns: v.object({
    isValid: v.boolean(),
    score: v.number(),
    feedback: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Basic validation without LLM call for now
      const isValid =
        args.text.length > 0 &&
        args.translation.length > 0 &&
        args.usageExamples.length >= 3;

      const score = isValid ? 8 : 3; // Basic scoring
      const feedback = isValid
        ? "Content meets basic requirements"
        : "Content missing required elements";

      return {
        isValid,
        score,
        feedback,
      };
    } catch (error) {
      console.error("Content validation failed:", error);
      return {
        isValid: false,
        score: 0,
        feedback: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

// Get content generation statistics
export const getContentStats = mutation({
  args: {},
  returns: v.object({
    totalExpressions: v.number(),
    totalExercises: v.number(),
    activeExpressions: v.number(),
    activeExercises: v.number(),
    averageDifficulty: v.number(),
  }),
  handler: async (ctx) => {
    const expressions = await ctx.db.query("expressions").collect();
    const exercises = await ctx.db.query("exercises").collect();

    const activeExpressions = expressions.filter((e) => e.isActive).length;
    const activeExercises = exercises.filter((e) => e.isActive).length;

    const avgDifficulty =
      expressions.length > 0
        ? expressions.reduce((sum, e) => sum + e.difficulty, 0) /
          expressions.length
        : 0;

    return {
      totalExpressions: expressions.length,
      totalExercises: exercises.length,
      activeExpressions,
      activeExercises,
      averageDifficulty: Math.round(avgDifficulty * 10) / 10,
    };
  },
});
