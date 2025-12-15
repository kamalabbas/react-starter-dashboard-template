import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface UserListItem {
  userId: number;
  fullName: string;
  imageUrl?: string;
  dob?: string;
  gender?: number | string;
}

const useUsersList = () => {
  return useQuery<BaseResponse<{ userList: UserListItem[] }>, Error, UserListItem[]>({
    queryKey: ["users", "list"],
    queryFn: () => getData<BaseResponse<{ userList: UserListItem[] }>>(`/FamilyTreeBe/GetUsers`),
    select: (res) => res.data?.userList ?? [],
    staleTime: 1000 * 60 * 2,
  });
};

export default useUsersList;
