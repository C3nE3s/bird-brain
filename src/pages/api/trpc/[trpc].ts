import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "server/context";
import { appRouter } from "server/routers/_app";
import { z } from "zod";

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    }
  },
  batching: {
    enabled: true,
  },
});
