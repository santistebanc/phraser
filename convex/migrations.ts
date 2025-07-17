import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateUsersAddPassword = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all users without password field
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.password) {
        // Add a default password hash for existing users
        // In production, you'd want to force password reset
        await ctx.db.patch(user._id, {
          password: "migrated_user_needs_password_reset",
        });
      }
    }

    return null;
  },
});

export const deleteAllUsers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete all users to start fresh
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    return null;
  },
});
