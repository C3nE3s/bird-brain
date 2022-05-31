import { useSession } from "next-auth/react";
import type { NextPage } from "next/types";

const UserDashboard: NextPage = () => {
  const { data } = useSession();
  console.log(data);
  return (
    <div>
      <h1>Welcome {data?.user.name}</h1>
      <a
        href={`https://twitter.com/${data?.user.userName}`}
        target="_blank"
        rel="noreferrer"
      >
        @{data?.user.userName}
      </a>
    </div>
  );
};

export default UserDashboard;
