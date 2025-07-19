import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllUserProgress = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("userProgress"),
      _creationTime: v.number(),
      userId: v.id("users"),
      expressionId: v.id("expressions"),
      masteryLevel: v.number(),
      attemptsCount: v.number(),
      lastAttempted: v.number(),
      bestScore: v.number(),
      averageScore: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return progress;
  },
});

export const getUserProgress = query({
  args: {
    userId: v.id("users"),
    expressionId: v.id("expressions"),
  },
  returns: v.union(
    v.object({
      _id: v.id("userProgress"),
      _creationTime: v.number(),
      userId: v.id("users"),
      expressionId: v.id("expressions"),
      masteryLevel: v.number(),
      attemptsCount: v.number(),
      lastAttempted: v.number(),
      bestScore: v.number(),
      averageScore: v.number(),
    }),
    v.null(),
  ),
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

export const updateUserProgress = mutation({
  args: {
    userId: v.id("users"),
    expressionId: v.id("expressions"),
    masteryLevel: v.number(),
    attemptsCount: v.number(),
    bestScore: v.number(),
    averageScore: v.number(),
  },
  returns: v.null(),
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

    return null;
  },
});
