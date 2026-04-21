import {
  type authUserResponse,
  useAuthUserSuspense,
} from "@/lib/api/generated/auth/auth";

/**
 * To fetch the suspensed auth user.
 * Make sure your prefetching it first on the server.
 */
function selectAuthSession(data: authUserResponse) {
  return data.status === 200 ? data.data : null;
}

export function useSession() {
  const { data } = useAuthUserSuspense({
    query: {
      select: selectAuthSession,
      refetchOnWindowFocus: false,
    },
  });

  return data;
}
