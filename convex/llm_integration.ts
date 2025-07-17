import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Types for generated content
interface GeneratedExpression {
  text: string;
  translation: string;
  difficulty: number;
  category: string;
  usageExamples: string[];
  tags: string[];
}

interface GeneratedExercise {
  type: string;
  question: string;
  correctAnswer: string;
  difficulty: number;
  hints?: string[];
}

// OpenAI API call using fetch
async function callOpenAI(messages: any[], model: string = "gpt-4o-mini") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

// Jaccard similarity for word sets
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// Query to get all existing expressions for duplicate checking
export const getAllExpressions = query({
  args: {},
  returns: v.array(
    v.object({
      text: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const expressions = await ctx.db.query("expressions").collect();
    return expressions.map((expr) => ({ text: expr.text }));
  },
});

// Check for existing expressions to prevent duplicates (now with Jaccard similarity)
async function checkForExistingExpressions(
  ctx: any,
  text: string,
): Promise<boolean> {
  const existingExpressions = await ctx.runQuery(
    api.llm_integration.getAllExpressions,
    {},
  );
  const normalizedText = text.toLowerCase().trim();
  const threshold = 0.8; // Consider as duplicate if similarity >= 0.8

  for (const expr of existingExpressions) {
    const existingNormalized = expr.text.toLowerCase().trim();
    const similarity = jaccardSimilarity(existingNormalized, normalizedText);
    if (similarity >= threshold) {
      return true; // Near-duplicate found
    }
  }
  return false; // No duplicate found
}

// Generate German expressions with usage examples
export const generateExpression = action({
  args: {
    count: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      text: v.string(),
      translation: v.string(),
      difficulty: v.number(),
      category: v.string(),
      usageExamples: v.array(v.string()),
      tags: v.array(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const count = args.count || 1;
    const expressions: GeneratedExpression[] = [];

    try {
      let attempts = 0;
      const maxAttempts = count * 3; // Allow up to 3x attempts to find unique expressions

      while (expressions.length < count && attempts < maxAttempts) {
        attempts++;
        const batchSize = Math.min(count + 2, 5); // Smaller batches to avoid timeout
        const prompt = `Generate ${batchSize} German verb phrases, grammatical constructions, and commonly used sentence patterns that are practical for everyday communication. Focus on constructions like:
- Verb + preposition combinations (e.g., "stolz auf jemanden sein", "einverstanden sein")
- Common verb phrases and patterns
- Useful grammatical constructions
- Everyday sentence structures that learners need to know

Requirements:
- Provide the German text, English translation, and 5 usage examples for each construction
- Include relevant tags for each construction
- Choose an appropriate category for each construction (e.g., daily_life, business, social, emotions, travel, food, technology, education, health, etc.)
- Assign a difficulty level from 1-10 for each construction (1=very common/frequent, 10=rare/uncommon)
- Ensure a variety of difficulty levels across the set (mix of common and rare constructions)
- Focus on practical, everyday constructions that learners would encounter in real situations
- IMPORTANT: Each construction must be completely unique - do not duplicate any constructions within this batch
- Avoid idioms and focus on useful verb phrases and grammatical patterns

Format the response as a JSON array:
[
  {
    "text": "German construction 1",
    "translation": "English translation 1",
    "difficulty": 3,
    "category": "appropriate_category_name",
    "usageExamples": ["example 1", "example 2", "example 3", "example 4", "example 5"],
    "tags": ["tag1", "tag2", "tag3"]
  },
  {
    "text": "German construction 2",
    "translation": "English translation 2",
    "difficulty": 7,
    "category": "appropriate_category_name",
    "usageExamples": ["example 1", "example 2", "example 3", "example 4", "example 5"],
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

        const content = await callOpenAI([
          {
            role: "system",
            content:
              "You are a German language expert specializing in practical verb phrases, grammatical constructions, and commonly used sentence patterns. Focus on everyday constructions like verb + preposition combinations, common verb phrases, and useful grammatical patterns that learners need for real communication. Generate high-quality German constructions with accurate translations and natural usage examples. The difficulty level indicates frequency of usage: 1=very common/frequent constructions, 10=rare/uncommon constructions. Generate a variety of constructions across different difficulty levels and categories to provide a comprehensive learning experience. Always ensure each construction is completely unique and avoid any duplicates. Avoid idioms and focus on practical, everyday language patterns.",
          },
          {
            role: "user",
            content: prompt,
          },
        ]);

        if (!content) {
          throw new Error("No content received from LLM");
        }

        // Strip code block markers if present
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/```$/, "")
            .trim();
        }

        // Parse JSON response (now an array) with better error handling
        let parsedArray;
        try {
          parsedArray = JSON.parse(cleaned);
        } catch (parseError) {
          console.error("JSON parsing failed. Content length:", cleaned.length);
          console.error("First 500 chars:", cleaned.substring(0, 500));
          console.error(
            "Last 500 chars:",
            cleaned.substring(cleaned.length - 500),
          );
          throw new Error(
            `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Content length: ${cleaned.length}`,
          );
        }

        // Validate that we got an array
        if (!Array.isArray(parsedArray)) {
          throw new Error(`Expected JSON array but got: ${typeof parsedArray}`);
        }

        // Process each expression in the array
        const batchExpressions: GeneratedExpression[] = [];

        for (const parsed of parsedArray) {
          // Check for duplicates against database
          const isDuplicateInDB = await checkForExistingExpressions(
            ctx,
            parsed.text,
          );
          if (isDuplicateInDB) {
            console.log(
              `Skipping duplicate expression from DB: ${parsed.text}`,
            );
            continue; // Skip this expression
          }

          // Check for duplicates within the current batch
          const isDuplicateInBatch = batchExpressions.some(
            (existing) =>
              jaccardSimilarity(
                existing.text.toLowerCase().trim(),
                parsed.text.toLowerCase().trim(),
              ) >= 0.8,
          );
          if (isDuplicateInBatch) {
            console.log(
              `Skipping duplicate expression within batch: ${parsed.text}`,
            );
            continue; // Skip this expression
          }

          const newExpression = {
            text: parsed.text,
            translation: parsed.translation,
            difficulty: parsed.difficulty,
            category: parsed.category,
            usageExamples: parsed.usageExamples,
            tags: parsed.tags,
          };

          batchExpressions.push(newExpression);
          expressions.push(newExpression);

          // Break if we have enough expressions
          if (expressions.length >= count) {
            break;
          }
        }
      }

      return expressions;
    } catch (error) {
      console.error("Error generating expression:", error);
      throw new Error(
        `Failed to generate expression: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

// Generate exercises from an expression
export const generateExercises = action({
  args: {
    expressionId: v.id("expressions"),
    expressionText: v.string(),
    translation: v.string(),
    usageExamples: v.array(v.string()),
    count: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      type: v.string(),
      question: v.string(),
      correctAnswer: v.string(),
      difficulty: v.number(),
      hints: v.optional(v.array(v.string())),
    }),
  ),
  handler: async (ctx, args) => {
    const count = args.count || 5;
    const exercises: GeneratedExercise[] = [];

    try {
      for (let i = 0; i < count; i++) {
        const exerciseTypes = ["translation", "contextual", "completion"];
        const type = exerciseTypes[i % exerciseTypes.length];

        const prompt = `Generate a ${type} exercise for this German verb phrase, grammatical construction, or commonly used sentence pattern:
German: "${args.expressionText}"
English: "${args.translation}"
Usage Examples: ${args.usageExamples.join(", ")}

Create a ${type} exercise that tests understanding of this construction in practical, real-world contexts. Consider the frequency level of the construction when creating appropriate difficulty for the exercise.
IMPORTANT: Make sure this exercise is unique and different from any other exercises for this construction.
Format as JSON:
{
  "type": "${type}",
  "question": "Exercise question",
  "correctAnswer": "Expected answer",
  "difficulty": 5,
  "hints": ["hint1", "hint2"]
}`;

        const content = await callOpenAI([
          {
            role: "system",
            content:
              "You are a German language teacher specializing in practical verb phrases, grammatical constructions, and commonly used sentence patterns. Generate engaging, educational exercises that test understanding of German constructions. Consider the frequency level of the construction when creating appropriate exercise difficulty. Always ensure each exercise is unique and different from others. Focus on practical, everyday language patterns rather than idioms.",
          },
          {
            role: "user",
            content: prompt,
          },
        ]);

        if (!content) {
          throw new Error("No content received from LLM");
        }

        // Strip code block markers if present
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/```$/, "")
            .trim();
        }

        const parsed = JSON.parse(cleaned);
        exercises.push({
          type: parsed.type,
          question: parsed.question,
          correctAnswer: parsed.correctAnswer,
          difficulty: parsed.difficulty,
          hints: parsed.hints,
        });
      }

      return exercises;
    } catch (error) {
      console.error("Error generating exercises:", error);
      throw new Error(
        `Failed to generate exercises: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

// Store generated expression in database
export const storeGeneratedExpression = mutation({
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
    return await ctx.db.insert("expressions", {
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
  },
});

// Store generated exercise in database
export const storeGeneratedExercise = mutation({
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
    return await ctx.db.insert("exercises", {
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
  },
});
