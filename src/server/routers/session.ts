import { TRPCError } from "@trpc/server";
import { createRouter } from "../createRouter";

export const sessionRouter = createRouter()
  .query("next-auth.getSession", {
    async resolve({ ctx }) {
      return ctx.session;
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any query or mutation after this middleware will raise
    // an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  });
