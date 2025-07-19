import { query } from "./_generated/server";
import { v } from "convex/values";

export const getExpressions = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("expressions"),
      _creationTime: v.number(),
      text: v.string(),
      translation: v.string(),
      difficulty: v.number(),
      category: v.string(),
      usageExamples: v.array(v.string()),
      tags: v.array(v.string()),
      createdAt: v.number(),
      lastUpdated: v.number(),
      isActive: v.boolean(),
      usageCount: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    let expressionsQuery = ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    // Apply additional filters
    if (args.category) {
      expressionsQuery = expressionsQuery.filter((q) =>
        q.eq(q.field("category"), args.category),
      );
    }

    if (args.difficulty) {
      expressionsQuery = expressionsQuery.filter((q) =>
        q.eq(q.field("difficulty"), args.difficulty),
      );
    }

    const expressions = await expressionsQuery
      .order("desc")
      .take(args.limit || 50);

    return expressions;
  },
});

export const getCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const expressions = await ctx.db
      .query("expressions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const categories = [...new Set(expressions.map((e) => e.category))];
    return categories.sort();
  },
});

export const getExpressionsByDifficulty = query({
  args: {
    minDifficulty: v.number(),
    maxDifficulty: v.number(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("expressions"),
      _creationTime: v.number(),
      text: v.string(),
      translation: v.string(),
      difficulty: v.number(),
      category: v.string(),
      usageExamples: v.array(v.string()),
      tags: v.array(v.string()),
      createdAt: v.number(),
      lastUpdated: v.number(),
      isActive: v.boolean(),
      usageCount: v.number(),
    }),
  ),
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
