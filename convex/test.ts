import { query } from "./_generated/server";

export const test = query({
  args: {},
  handler: async (ctx) => {
    return "Hello from Convex! Backend is working.";
  },
}); 