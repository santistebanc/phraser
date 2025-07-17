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
import type * as content_generation from "../content_generation.js";
import type * as llm_integration from "../llm_integration.js";
import type * as migrations from "../migrations.js";
import type * as schema_validation from "../schema_validation.js";
import type * as test from "../test.js";
import type * as test_content_generation from "../test_content_generation.js";

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
  content_generation: typeof content_generation;
  llm_integration: typeof llm_integration;
  migrations: typeof migrations;
  schema_validation: typeof schema_validation;
  test: typeof test;
  test_content_generation: typeof test_content_generation;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
