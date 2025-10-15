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

    // If no active exercises, get any exercises (including inactive ones)
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

// Enhanced scoring algorithm with AI-powered evaluation
export const calculateEnhancedScore = query({
  args: {
    userAnswer: v.string(),
    correctAnswer: v.string(),
    exerciseDifficulty: v.number(),
    userLevel: v.number(),
    timeSpent: v.number(),
    question: v.string(),
    exerciseType: v.string(),
  },
  returns: v.object({
    score: v.number(),
    feedback: v.string(),
    levelChange: v.number(),
    performanceMetrics: v.object({
      accuracyScore: v.number(),
      difficultyBonus: v.number(),
      timeBonus: v.number(),
      patternBonus: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // 1. Base accuracy scoring (0-1 scale)
    const normalizedUserAnswer = args.userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = args.correctAnswer.toLowerCase().trim();

    let accuracyScore = 0;
    let feedback = "";

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      accuracyScore = 1.0;
      feedback = "Perfect! Excellent translation.";
    } else {
      // Partial credit for close answers
      const similarity = calculateSimilarity(
        normalizedUserAnswer,
        normalizedCorrectAnswer,
      );
      accuracyScore = Math.max(0, similarity);

      if (accuracyScore >= 0.8) {
        feedback = "Very close! Minor error in translation.";
      } else if (accuracyScore >= 0.6) {
        feedback = "Good attempt, but there are some errors.";
      } else if (accuracyScore >= 0.4) {
        feedback = "Partially correct, but needs improvement.";
      } else {
        feedback = "Incorrect. Keep practicing!";
      }
    }

    // 2. Difficulty weighting bonus
    const levelDiff = args.exerciseDifficulty - args.userLevel;
    let difficultyBonus = 0;

    if (levelDiff > 100) {
      // Harder exercise - bonus for attempting
      difficultyBonus = Math.min(0.2, levelDiff / 1000);
    } else if (levelDiff < -100) {
      // Easier exercise - penalty for mistakes
      difficultyBonus = Math.max(-0.1, levelDiff / 1000);
    }

    // 3. Time analysis bonus
    let timeBonus = 0;
    const expectedTime = getExpectedTimeForExercise(
      args.exerciseType,
      args.exerciseDifficulty,
    );

    if (args.timeSpent > 0) {
      const timeRatio = expectedTime / args.timeSpent;
      if (timeRatio > 1.5) {
        // Fast response - bonus
        timeBonus = Math.min(0.1, (timeRatio - 1.5) * 0.2);
      } else if (timeRatio < 0.5) {
        // Slow response - penalty
        timeBonus = Math.max(-0.05, (timeRatio - 0.5) * 0.1);
      }
    }

    // 4. Pattern recognition bonus (placeholder for future enhancement)
    const patternBonus = 0; // Will be enhanced with user history analysis

    // 5. Calculate final score
    const finalScore = Math.max(
      0,
      Math.min(1, accuracyScore + difficultyBonus + timeBonus + patternBonus),
    );

    // 6. Calculate level change based on performance
    let levelChange = 0;
    if (finalScore >= 0.9) {
      levelChange = Math.max(1, Math.floor(levelDiff / 200)); // Bonus for hard exercises
    } else if (finalScore >= 0.7) {
      levelChange = 1;
    } else if (finalScore >= 0.5) {
      levelChange = 0;
    } else if (finalScore >= 0.3) {
      levelChange = -1;
    } else {
      levelChange = Math.min(-1, Math.floor(levelDiff / -200)); // Penalty for easy mistakes
    }

    return {
      score: finalScore,
      feedback: feedback,
      levelChange: levelChange,
      performanceMetrics: {
        accuracyScore,
        difficultyBonus,
        timeBonus,
        patternBonus,
      },
    };
  },
});

// Helper function to calculate similarity between strings
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;

  // Simple Levenshtein distance-based similarity
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return Math.max(0, 1 - distance / maxLength);
}

// Simple Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Helper function to get expected time for exercise type and difficulty
function getExpectedTimeForExercise(type: string, difficulty: number): number {
  const baseTimes: Record<string, number> = {
    translation: 30,
    "fill-in-blank": 20,
    "multiple-choice": 15,
    rearrange: 25,
  };

  const baseTime = baseTimes[type] || 25;
  const difficultyMultiplier = 1 + (difficulty - 1000) / 2000; // Adjust time based on difficulty

  return Math.max(10, Math.min(120, baseTime * difficultyMultiplier));
}

// Inline enhanced scoring function for mutations
function calculateEnhancedScoreInline(
  userAnswer: string,
  correctAnswer: string,
  exerciseDifficulty: number,
  userLevel: number,
  timeSpent: number,
  exerciseType: string,
) {
  // 1. Base accuracy scoring (0-1 scale)
  const normalizedUserAnswer = userAnswer.toLowerCase().trim();
  const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();

  let accuracyScore = 0;
  let feedback = "";

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    accuracyScore = 1.0;
    feedback = "Perfect! Excellent translation.";
  } else {
    // Partial credit for close answers
    const similarity = calculateSimilarity(
      normalizedUserAnswer,
      normalizedCorrectAnswer,
    );
    accuracyScore = Math.max(0, similarity);

    if (accuracyScore >= 0.8) {
      feedback = "Very close! Minor error in translation.";
    } else if (accuracyScore >= 0.6) {
      feedback = "Good attempt, but there are some errors.";
    } else if (accuracyScore >= 0.4) {
      feedback = "Partially correct, but needs improvement.";
    } else {
      feedback = "Incorrect. Keep practicing!";
    }
  }

  // 2. Difficulty weighting bonus
  const levelDiff = exerciseDifficulty - userLevel;
  let difficultyBonus = 0;

  if (levelDiff > 100) {
    // Harder exercise - bonus for attempting
    difficultyBonus = Math.min(0.2, levelDiff / 1000);
  } else if (levelDiff < -100) {
    // Easier exercise - penalty for mistakes
    difficultyBonus = Math.max(-0.1, levelDiff / 1000);
  }

  // 3. Time analysis bonus
  let timeBonus = 0;
  const expectedTime = getExpectedTimeForExercise(
    exerciseType,
    exerciseDifficulty,
  );

  if (timeSpent > 0) {
    const timeRatio = expectedTime / timeSpent;
    if (timeRatio > 1.5) {
      // Fast response - bonus
      timeBonus = Math.min(0.1, (timeRatio - 1.5) * 0.2);
    } else if (timeRatio < 0.5) {
      // Slow response - penalty
      timeBonus = Math.max(-0.05, (timeRatio - 0.5) * 0.1);
    }
  }

  // 4. Pattern recognition bonus (placeholder for future enhancement)
  const patternBonus = 0; // Will be enhanced with user history analysis

  // 5. Calculate final score
  const finalScore = Math.max(
    0,
    Math.min(1, accuracyScore + difficultyBonus + timeBonus + patternBonus),
  );

  // 6. Calculate level change based on performance
  let levelChange = 0;
  if (finalScore >= 0.9) {
    levelChange = Math.max(1, Math.floor(levelDiff / 200)); // Bonus for hard exercises
  } else if (finalScore >= 0.7) {
    levelChange = 1;
  } else if (finalScore >= 0.5) {
    levelChange = 0;
  } else if (finalScore >= 0.3) {
    levelChange = -1;
  } else {
    levelChange = Math.min(-1, Math.floor(levelDiff / -200)); // Penalty for easy mistakes
  }

  return {
    score: finalScore,
    feedback: feedback,
    levelChange: levelChange,
    performanceMetrics: {
      accuracyScore,
      difficultyBonus,
      timeBonus,
      patternBonus,
    },
  };
}

// Enhanced submit exercise attempt with AI-powered scoring
export const submitExerciseAttemptEnhanced = mutation({
  args: {
    exerciseId: v.id("exercises"),
    userId: v.id("users"),
    userAnswer: v.string(),
    timeSpent: v.number(),
    question: v.string(),
    exerciseType: v.string(),
  },
  returns: v.id("exerciseAttempts"),
  handler: async (ctx, args) => {
    // Get exercise and user details
    const exercise = await ctx.db.get(args.exerciseId);
    const user = await ctx.db.get(args.userId);

    if (!exercise || !user) {
      throw new Error("Exercise or user not found");
    }

    // Calculate enhanced score inline
    const scoringResult = calculateEnhancedScoreInline(
      args.userAnswer,
      exercise.correctAnswer,
      exercise.difficulty,
      user.currentLevel,
      args.timeSpent,
      args.exerciseType,
    );

    // Create exercise attempt with enhanced scoring
    const attemptId = await ctx.db.insert("exerciseAttempts", {
      userId: args.userId,
      exerciseId: args.exerciseId,
      userAnswer: args.userAnswer,
      aiScore: scoringResult.score,
      aiFeedback: scoringResult.feedback,
      levelChange: scoringResult.levelChange,
      timeSpent: args.timeSpent,
      createdAt: Date.now(),
    });

    // Update user stats with enhanced scoring
    const newTotalExercises = user.totalExercises + 1;
    const newUserAverageScore =
      (user.averageScore * user.totalExercises + scoringResult.score * 100) /
      newTotalExercises;
    const newUserLevel = Math.max(
      1,
      user.currentLevel + scoringResult.levelChange,
    );

    await ctx.db.patch(args.userId, {
      totalExercises: newTotalExercises,
      averageScore: newUserAverageScore,
      currentLevel: newUserLevel,
      lastActive: Date.now(),
    });

    // Update exercise stats
    const newUsageCount = exercise.globalUsageCount + 1;
    const newExerciseAverageScore =
      (exercise.globalAverageScore * exercise.globalUsageCount +
        scoringResult.score * 100) /
      newUsageCount;

    await ctx.db.patch(args.exerciseId, {
      globalUsageCount: newUsageCount,
      globalAverageScore: newExerciseAverageScore,
    });

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
      const newUserAverageScore =
        (user.averageScore * user.totalExercises + args.aiScore * 100) /
        newTotalExercises;
      const newUserLevel = user.currentLevel + args.levelChange;

      await ctx.db.patch(args.userId, {
        totalExercises: newTotalExercises,
        averageScore: newUserAverageScore,
        currentLevel: newUserLevel,
        lastActive: Date.now(),
      });
    }

    // Update exercise stats
    const exercise = await ctx.db.get(args.exerciseId);
    if (exercise) {
      const newUsageCount = exercise.globalUsageCount + 1;
      const newExerciseAverageScore =
        (exercise.globalAverageScore * exercise.globalUsageCount +
          args.aiScore * 100) /
        newUsageCount;

      await ctx.db.patch(args.exerciseId, {
        globalUsageCount: newUsageCount,
        globalAverageScore: newExerciseAverageScore,
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

// Mutation to force get a new random exercise (bypasses cache)
export const getNewRandomExercise = mutation({
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

    // If no active exercises, get any exercises (including inactive ones)
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
