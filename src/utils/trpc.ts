import { createReactQueryHooks } from "@trpc/react-query";
import type { AppRouter } from "server/routers/_app";

export const trpc = createReactQueryHooks<AppRouter>();
// => { useQuery: ..., useMutation: ...}
