/**
 * This file contains the root router of the tRPC-backend
 */
import { createRouter } from "../createRouter";
import superjson from "superjson";
import { userRouter } from "./user";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Add data transformers
   * @link https://trpc.io/docs/data-transformers
   */
  .transformer(superjson)
  .merge("user", userRouter);

export type AppRouter = typeof appRouter;
