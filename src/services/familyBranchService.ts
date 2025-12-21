import { getData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface FamilyBranchItem {
  id: number;
  name: string;
  countryId?: number;
  countryName?: string;
}

export interface FamilyBranchListResponse {
  familyBranchList?: FamilyBranchItem[];
  [key: string]: any;
}

export const getFamilyBranches = async (countryIso2: string) => {
  const iso = (countryIso2 || "").toString().toUpperCase();
  const endpoint = (import.meta as any).env?.VITE_FAMILY_BRANCHES_ENDPOINT || "/FamilyTreeBe/GetFamilyBranches";
  return getData<BaseResponse<FamilyBranchListResponse>>(endpoint, { params: { countryIso2: iso } });
};
