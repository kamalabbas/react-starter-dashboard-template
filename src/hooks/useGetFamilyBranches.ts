import { useQuery } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { FamilyBranchListResponse, getFamilyBranches } from "@/services/familyBranchService";

export const useGetFamilyBranches = (countryIso2?: string) => {
  const iso = (countryIso2 ?? "").toString().toUpperCase();
  const enabled = Boolean(iso);

  return useQuery<BaseResponse<FamilyBranchListResponse>, Error, BaseResponse<FamilyBranchListResponse>>({
    queryKey: ["FamilyBranches", enabled ? iso : ""],
    queryFn: () => getFamilyBranches(iso),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};
