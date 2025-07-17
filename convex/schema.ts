import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    password: v.string(), // Added for authentication
    currentLevel: v.number(), // ELO rating, starts at 1000
    totalExercises: v.number(),
    averageScore: v.number(),
    lastActive: v.number(), // timestamp
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
      }),
    ),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  expressions: defineTable({
    text: v.string(),
    translation: v.string(),
    difficulty: v.number(), // ELO rating
    category: v.string(),
    usageExamples: v.array(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    lastUpdated: v.number(),
    isActive: v.boolean(), // For content moderation
    usageCount: v.number(), // Total times used in exercises
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  exercises: defineTable({
    expressionId: v.id("expressions"),
    type: v.string(), // "translation", "contextual", "completion"
    question: v.string(),
    correctAnswer: v.string(),
    difficulty: v.number(), // ELO rating
    hints: v.optional(v.array(v.string())),
    createdAt: v.number(),
    globalUsageCount: v.number(), // Total usage across all users
    globalAverageScore: v.number(), // Average score across all users
    isActive: v.boolean(), // For content moderation
  })
    .index("by_expression", ["expressionId"])
    .index("by_type", ["type"])
    .index("by_difficulty", ["difficulty"])
    .index("by_active", ["isActive"]),

  exerciseAttempts: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    userAnswer: v.string(),
    aiScore: v.number(), // 0-1 scale
    aiFeedback: v.string(),
    levelChange: v.number(), // ELO change
    timeSpent: v.number(), // seconds
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_exercise", ["exerciseId"])
    .index("by_user_time", ["userId", "createdAt"]),

  userProgress: defineTable({
    userId: v.id("users"),
    expressionId: v.id("expressions"),
    masteryLevel: v.number(), // 0-100
    attemptsCount: v.number(),
    lastAttempted: v.number(),
    bestScore: v.number(),
    averageScore: v.number(),
  })
    .index("by_user_expression", ["userId", "expressionId"])
    .index("by_user", ["userId"])
    .index("by_expression", ["expressionId"]),
});
