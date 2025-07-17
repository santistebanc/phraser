import { query } from "./_generated/server";
import { v } from "convex/values";

export const testQuery = query({
  args: {},
  returns: v.string(),
  handler: async (_ctx, _args) => {
    return "Hello from Convex!";
  },
});
