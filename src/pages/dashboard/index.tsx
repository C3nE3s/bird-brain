import { trpc } from "lib/trpc";
import type { NextPage } from "next/types";

const UserDashboard: NextPage = () => {
  const { data: session } = trpc.useQuery(["next-auth.getSession"], {
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
