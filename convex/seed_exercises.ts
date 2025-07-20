import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedExercises = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    // First, let's create some test expressions
    const expression1 = await ctx.db.insert("expressions", {
      text: "Guten Morgen",
      translation: "Good morning",
      difficulty: 1000,
      category: "greetings",
      usageExamples: ["Guten Morgen! Wie geht es dir?"],
      tags: ["greeting", "morning"],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true,
      usageCount: 0,
    });

    const expression2 = await ctx.db.insert("expressions", {
      text: "Wie geht es dir?",
      translation: "How are you?",
      difficulty: 1100,
      category: "conversation",
      usageExamples: ["Hallo! Wie geht es dir heute?"],
      tags: ["question", "wellbeing"],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true,
      usageCount: 0,
    });

    const expression3 = await ctx.db.insert("expressions", {
      text: "Danke schön",
      translation: "Thank you very much",
      difficulty: 1050,
      category: "politeness",
      usageExamples: ["Danke schön für deine Hilfe!"],
      tags: ["thanks", "polite"],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true,
      usageCount: 0,
    });

    // Now create exercises for these expressions
    await ctx.db.insert("exercises", {
      expressionId: expression1,
      type: "translation",
      question: "Guten Morgen",
      correctAnswer: "Good morning",
      difficulty: 1000,
      hints: ["Think about morning greetings"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    await ctx.db.insert("exercises", {
      expressionId: expression1,
      type: "fill-in-blank",
      question: "Guten ___",
      correctAnswer: "Morgen",
      difficulty: 1000,
      hints: ["This is a morning greeting"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    await ctx.db.insert("exercises", {
      expressionId: expression2,
      type: "translation",
      question: "Wie geht es dir?",
      correctAnswer: "How are you?",
      difficulty: 1100,
      hints: ["This is a common greeting question"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    await ctx.db.insert("exercises", {
      expressionId: expression2,
      type: "multiple-choice",
      question: "What does 'Wie geht es dir?' mean?",
      correctAnswer: "How are you?",
      difficulty: 1100,
      hints: ["This is a wellbeing question"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    await ctx.db.insert("exercises", {
      expressionId: expression3,
      type: "translation",
      question: "Danke schön",
      correctAnswer: "Thank you very much",
      difficulty: 1050,
      hints: ["This is a polite way to say thank you"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    await ctx.db.insert("exercises", {
      expressionId: expression3,
      type: "rearrange",
      question: "schön Danke",
      correctAnswer: "Danke schön",
      difficulty: 1050,
      hints: ["This is a polite thank you"],
      createdAt: Date.now(),
      globalUsageCount: 0,
      globalAverageScore: 0,
      isActive: true,
    });

    return "Successfully seeded 6 exercises for 3 expressions";
  },
});
