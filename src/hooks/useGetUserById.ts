import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { User, UserProfileResponse } from "@/interface/user.interface";
import { getUserById } from "@/services/userService";

type Options = Omit<UseQueryOptions<BaseResponse<UserProfileResponse>, Error, User | undefined, any>, "queryKey" | "queryFn" | "select">;

const useGetUserById = (userId?: string | number | null, options?: Options) => {
  const idNum = userId == null ? 0 : Number(userId);
  const enabled = (options?.enabled ?? true) && Number.isFinite(idNum) && idNum > 0;

  return useQuery<BaseResponse<UserProfileResponse>, Error, User | undefined>({
    queryKey: ["user", "detail", idNum],
    queryFn: () => getUserById(idNum),
    select: (res) => res.data?.user,
    enabled,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export default useGetUserById;
