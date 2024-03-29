import type { NextPage } from "next/types";
import { trpc } from "utils/trpc";

const UserDashboard: NextPage = () => {
    const { data: session } = trpc.nextAuth.getSession.useQuery(undefined, {
        suspense: true,
    });

  return (
    <div>
      <h1>Welcome {session?.user.name}</h1>
      <a
        href={`https://twitter.com/${session?.user.userName}`}
        target="_blank"
        rel="noreferrer"
      >
        @{session?.user.userName}
      </a>
    </div>
  );
};

export default UserDashboard;
