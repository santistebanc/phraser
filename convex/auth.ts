import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new user
export const registerUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // In a real app, you'd hash the password here
    // For this MVP, we'll store it directly (not recommended for production)
    const hashedPassword = args.password; // TODO: Add proper password hashing

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      password: hashedPassword,
      currentLevel: 1000, // Starting ELO rating
      totalExercises: 0,
      averageScore: 0,
      lastActive: Date.now(),
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Login user
export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("No account found with that email. Please register first.");
    }

    // In a real app, you'd verify the hashed password here
    // For this MVP, we'll do direct comparison (not recommended for production)
    if (user.password !== args.password) {
      throw new Error("Incorrect password. Please try again.");
    }

    // Update last active time
    await ctx.db.patch(user._id, {
      lastActive: Date.now(),
    });

    // Return user data (excluding password)
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      currentLevel: user.currentLevel,
      totalExercises: user.totalExercises,
      averageScore: user.averageScore,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
    };
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (!user) return null;

    // Return user data (excluding password)
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      currentLevel: user.currentLevel,
      totalExercises: user.totalExercises,
      averageScore: user.averageScore,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
    };
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Return user data (excluding password)
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      currentLevel: user.currentLevel,
      totalExercises: user.totalExercises,
      averageScore: user.averageScore,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
    };
  },
});

// Update user last active time
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
    });
  },
}); 