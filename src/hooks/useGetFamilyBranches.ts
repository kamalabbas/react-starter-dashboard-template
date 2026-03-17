import { useQuery } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { FamilyBranchListResponse, getFamilyBranches } from "@/services/familyBranchService";

export const useGetFamilyBranches = (countryIso2?: string,  includeNotActive?: boolean) => {
  const iso = (countryIso2 ?? "").toString().toUpperCase();

  const includeNotActiveParam = includeNotActive ? true : false;

  return useQuery<BaseResponse<FamilyBranchListResponse>, Error, BaseResponse<FamilyBranchListResponse>>({
    queryKey: ["FamilyBranches"],
    queryFn: () => getFamilyBranches(iso, includeNotActiveParam),
    staleTime: 1000 * 60 * 30,
  });
};
