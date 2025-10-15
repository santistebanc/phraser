import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Debug function to check database state
export const debugDatabaseState = query({
  args: {},
  returns: v.object({
    totalExpressions: v.number(),
    totalExercises: v.number(),
    expressionsWithExercises: v.number(),
    expressionsWithoutExercises: v.number(),
    expressionDetails: v.array(
      v.object({
        _id: v.id("expressions"),
        text: v.string(),
        translation: v.string(),
        exerciseCount: v.number(),
        hasExercises: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    // Get all expressions
    const expressions = await ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get all exercises
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Count exercises per expression
    const exerciseCounts = new Map<string, number>();
    exercises.forEach((exercise) => {
      const count = exerciseCounts.get(exercise.expressionId) || 0;
      exerciseCounts.set(exercise.expressionId, count + 1);
    });

    // Build expression details
    const expressionDetails = expressions.map((expression) => ({
      _id: expression._id,
      text: expression.text,
      translation: expression.translation,
      exerciseCount: exerciseCounts.get(expression._id) || 0,
      hasExercises: (exerciseCounts.get(expression._id) || 0) > 0,
    }));

    const expressionsWithExercises = expressionDetails.filter(
      (e) => e.hasExercises,
    ).length;
    const expressionsWithoutExercises = expressionDetails.filter(
      (e) => !e.hasExercises,
    ).length;

    return {
      totalExpressions: expressions.length,
      totalExercises: exercises.length,
      expressionsWithExercises,
      expressionsWithoutExercises,
      expressionDetails,
    };
  },
});

// Debug function to check specific expression
export const debugExpression = query({
  args: { expressionId: v.id("expressions") },
  returns: v.object({
    expression: v.union(
      v.object({
        _id: v.id("expressions"),
        text: v.string(),
        translation: v.string(),
        difficulty: v.number(),
        isActive: v.boolean(),
      }),
      v.null(),
    ),
    exercises: v.array(
      v.object({
        _id: v.id("exercises"),
        type: v.string(),
        question: v.string(),
        correctAnswer: v.string(),
        difficulty: v.number(),
        isActive: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const expression = await ctx.db.get(args.expressionId);

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_expression", (q) =>
        q.eq("expressionId", args.expressionId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      expression,
      exercises,
    };
  },
});

// Debug function to check exercise data
export const debugExercises = query({
  args: {},
  returns: v.object({
    totalExercises: v.number(),
    activeExercises: v.number(),
    inactiveExercises: v.number(),
    exerciseDetails: v.array(
      v.object({
        _id: v.id("exercises"),
        expressionId: v.id("expressions"),
        type: v.string(),
        question: v.string(),
        difficulty: v.number(),
        isActive: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    // Get all exercises
    const allExercises = await ctx.db.query("exercises").collect();

    // Get active exercises
    const activeExercises = await ctx.db
      .query("exercises")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get inactive exercises
    const inactiveExercises = await ctx.db
      .query("exercises")
      .withIndex("by_active", (q) => q.eq("isActive", false))
      .collect();

    const exerciseDetails = allExercises.map((exercise) => ({
      _id: exercise._id,
      expressionId: exercise.expressionId,
      type: exercise.type,
      question: exercise.question,
      difficulty: exercise.difficulty,
      isActive: exercise.isActive,
    }));

    return {
      totalExercises: allExercises.length,
      activeExercises: activeExercises.length,
      inactiveExercises: inactiveExercises.length,
      exerciseDetails,
    };
  },
});

// Function to activate all exercises
export const activateAllExercises = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    // Get all exercises
    const exercises = await ctx.db.query("exercises").collect();

    // Update each exercise to set isActive to true
    for (const exercise of exercises) {
      await ctx.db.patch(exercise._id, {
        isActive: true,
      });
    }

    return `Successfully activated ${exercises.length} exercises`;
  },
});

// Function to check difficulty ranges
export const checkDifficultyRanges = query({
  args: {},
  returns: v.object({
    expressions: v.object({
      count: v.number(),
      minDifficulty: v.number(),
      maxDifficulty: v.number(),
      avgDifficulty: v.number(),
    }),
    exercises: v.object({
      count: v.number(),
      minDifficulty: v.number(),
      maxDifficulty: v.number(),
      avgDifficulty: v.number(),
    }),
    users: v.object({
      count: v.number(),
      minLevel: v.number(),
      maxLevel: v.number(),
      avgLevel: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // Get all expressions
    const expressions = await ctx.db.query("expressions").collect();
    const expressionDifficulties = expressions.map((e) => e.difficulty);

    // Get all exercises
    const exercises = await ctx.db.query("exercises").collect();
    const exerciseDifficulties = exercises.map((e) => e.difficulty);

    // Get all users
    const users = await ctx.db.query("users").collect();
    const userLevels = users.map((u) => u.currentLevel);

    return {
      expressions: {
        count: expressions.length,
        minDifficulty: Math.min(...expressionDifficulties),
        maxDifficulty: Math.max(...expressionDifficulties),
        avgDifficulty:
          expressionDifficulties.reduce((a, b) => a + b, 0) /
          expressionDifficulties.length,
      },
      exercises: {
        count: exercises.length,
        minDifficulty: Math.min(...exerciseDifficulties),
        maxDifficulty: Math.max(...exerciseDifficulties),
        avgDifficulty:
          exerciseDifficulties.reduce((a, b) => a + b, 0) /
          exerciseDifficulties.length,
      },
      users: {
        count: users.length,
        minLevel: Math.min(...userLevels),
        maxLevel: Math.max(...userLevels),
        avgLevel: userLevels.reduce((a, b) => a + b, 0) / userLevels.length,
      },
    };
  },
});

// Function to scale difficulties to match user level range
export const scaleDifficulties = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    // Target range: 500-1500 (around user level of 1000)
    const TARGET_MIN = 500;
    const TARGET_MAX = 1500;
    const TARGET_RANGE = TARGET_MAX - TARGET_MIN;

    // Get current ranges
    const expressions = await ctx.db.query("expressions").collect();
    const exercises = await ctx.db.query("exercises").collect();

    if (expressions.length === 0 && exercises.length === 0) {
      return "No expressions or exercises found to scale";
    }

    // Calculate current ranges
    const expressionDifficulties = expressions.map((e) => e.difficulty);
    const exerciseDifficulties = exercises.map((e) => e.difficulty);

    const allDifficulties = [
      ...expressionDifficulties,
      ...exerciseDifficulties,
    ];
    const currentMin = Math.min(...allDifficulties);
    const currentMax = Math.max(...allDifficulties);
    const currentRange = currentMax - currentMin;

    // Scale function
    const scaleDifficulty = (difficulty: number) => {
      if (currentRange === 0) return TARGET_MIN + TARGET_RANGE / 2; // If all same difficulty
      const normalized = (difficulty - currentMin) / currentRange;
      return TARGET_MIN + normalized * TARGET_RANGE;
    };

    // Update expressions
    let updatedExpressions = 0;
    for (const expression of expressions) {
      const newDifficulty = Math.round(scaleDifficulty(expression.difficulty));
      await ctx.db.patch(expression._id, {
        difficulty: newDifficulty,
      });
      updatedExpressions++;
    }

    // Update exercises
    let updatedExercises = 0;
    for (const exercise of exercises) {
      const newDifficulty = Math.round(scaleDifficulty(exercise.difficulty));
      await ctx.db.patch(exercise._id, {
        difficulty: newDifficulty,
      });
      updatedExercises++;
    }

    return `Scaled ${updatedExpressions} expressions and ${updatedExercises} exercises from range ${currentMin}-${currentMax} to range ${TARGET_MIN}-${TARGET_MAX}`;
  },
});
