import { useQuery } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { GenderCode } from "@/interface/enums";
import { getData } from "@/services/api";

export interface UserSearch {
  userId: number;
  fullName: string;
  imageUrl?: string;
  dob?: string;
}

interface ResponseData {
  userList: UserSearch[];
}

export const useSearchUsers = (userName: string, gender: GenderCode, civilFamilyNumber?: string) => {
  return useQuery<BaseResponse<ResponseData>, Error>({
    queryKey: ["users-search", userName, gender, civilFamilyNumber ?? ""],
    queryFn: () => {
      const params = new URLSearchParams({
        name: userName,
        genderCode: gender,
      });

      if (civilFamilyNumber !== undefined && Number(civilFamilyNumber) > 0) {
        params.append("civilFamilyNumber", civilFamilyNumber);
      }

      return getData<BaseResponse<ResponseData>>(`/FamilyTreeBe/GetUsers?${params.toString()}`);
    },
    enabled: false,
  });
};
