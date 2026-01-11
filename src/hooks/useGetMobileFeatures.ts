import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface MobileFeature {
  id: number;
  code: string;
  isEnabled: boolean;
}

export interface GetMobileFeaturesResponse {
  mobileFeatures: MobileFeature[];
}

export default function useGetMobileFeatures() {
  return useQuery<unknown, Error, MobileFeature[]>({
    queryKey: ["mobileFeatures"],
    queryFn: () => getData<BaseResponse<GetMobileFeaturesResponse>>("/FamilyTreeBe/Features/GetMobileFeatures"),
    select: (res) => (res as any)?.mobileFeatures ?? (res as any)?.data?.mobileFeatures ?? []
  });
}
