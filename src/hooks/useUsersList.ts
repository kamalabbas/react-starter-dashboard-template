import { BaseResponse } from "@/interface/baseResponse.interface";
import { User } from "@/interface/user.interface";
import { getData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface GetAllUsersResponse {
  userList: User[];
}

const useUsersList = () => {
  return useQuery<BaseResponse<GetAllUsersResponse>, Error, User[]>({
    queryKey: ["users", "list"],
    queryFn: () => getData<BaseResponse<GetAllUsersResponse>>(`/Admin/GetAllUsers`),
    select: (res) => res.data?.userList ?? [],
    staleTime: 1000 * 60 * 2,
  });
};

export default useUsersList;
