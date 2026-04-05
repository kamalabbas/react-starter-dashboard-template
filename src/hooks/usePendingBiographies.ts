import { BaseResponse } from "@/interface/baseResponse.interface";
import { BiographyPage, GetPendingBiographiesResponse } from "@/interface/biography.interface";
import { getPendingBiographies } from "@/services/biographyService";
import { useQuery } from "@tanstack/react-query";

export default function usePendingBiographies() {
  return useQuery<BaseResponse<GetPendingBiographiesResponse>, Error, BiographyPage[]>({
    queryKey: ["biography", "pending"],
    queryFn: getPendingBiographies,
    select: (response) => response.data?.biographies ?? [],
    staleTime: 1000 * 60,
  });
}
