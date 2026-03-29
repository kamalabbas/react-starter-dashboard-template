import { BaseResponse } from "@/interface/baseResponse.interface";
import { CardRequest, GetPendingCardRequestsResponse } from "@/interface/card.interface";
import { getPendingCardRequests } from "@/services/cardService";
import { useQuery } from "@tanstack/react-query";

export default function useGetPendingCardRequests() {
  return useQuery<BaseResponse<GetPendingCardRequestsResponse>, Error, CardRequest[]>({
    queryKey: ["card", "pending-requests"],
    queryFn: getPendingCardRequests,
    select: (response) => response.data?.cardRequests ?? [],
    staleTime: 1000 * 60 * 2,
  });
}