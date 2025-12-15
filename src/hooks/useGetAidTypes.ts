import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface AidType {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GetAidTypesResponse {
  askForAidTypeList: AidType[];
}

const useGetAidTypes = (userId: number) => {
  return useQuery<BaseResponse<GetAidTypesResponse>, Error, AidType[]>({
    queryKey: ["AidTypes", userId],
    queryFn: () => getData<BaseResponse<GetAidTypesResponse>>("/FamilyTreeBe/AskForAid/GetTypes?isActive=true"),
    select: (res) => res?.data?.askForAidTypeList ?? [],
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetAidTypes;
