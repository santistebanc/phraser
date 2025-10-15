/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as debug from "../debug.js";
import type * as exercises from "../exercises.js";
import type * as expressions from "../expressions.js";
import type * as progress from "../progress.js";
import type * as seed from "../seed.js";
import type * as seed_exercises from "../seed_exercises.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  debug: typeof debug;
  exercises: typeof exercises;
  expressions: typeof expressions;
  progress: typeof progress;
  seed: typeof seed;
  seed_exercises: typeof seed_exercises;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
