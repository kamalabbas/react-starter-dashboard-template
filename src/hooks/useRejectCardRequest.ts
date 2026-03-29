import { BaseResponse } from "@/interface/baseResponse.interface";
import { CardRequest, RejectCardRequestPayload } from "@/interface/card.interface";
import { rejectCardRequest } from "@/services/cardService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useRejectCardRequest() {
  const queryClient = useQueryClient();

  return useMutation<BaseResponse<{ result: { cardRequest: CardRequest } }>, Error, RejectCardRequestPayload>({
    mutationFn: rejectCardRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", "pending-requests"] });
    },
  });
}