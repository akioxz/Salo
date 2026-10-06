/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_dev_helper from "../auth_dev_helper.js";
import type * as auth_helpers from "../auth_helpers.js";
import type * as balikbayan from "../balikbayan.js";
import type * as comments from "../comments.js";
import type * as debug from "../debug.js";
import type * as files from "../files.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as posts from "../posts.js";
import type * as reactions from "../reactions.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth_dev_helper: typeof auth_dev_helper;
  auth_helpers: typeof auth_helpers;
  balikbayan: typeof balikbayan;
  comments: typeof comments;
  debug: typeof debug;
  files: typeof files;
  households: typeof households;
  http: typeof http;
  posts: typeof posts;
  reactions: typeof reactions;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
