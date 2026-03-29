import { BaseResponse } from "@/interface/baseResponse.interface";
import { AcceptCardRequestPayload, CardRequest } from "@/interface/card.interface";
import { acceptCardRequest } from "@/services/cardService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useAcceptCardRequest() {
  const queryClient = useQueryClient();

  return useMutation<BaseResponse<{ result: { cardRequest: CardRequest } }>, Error, AcceptCardRequestPayload>({
    mutationFn: acceptCardRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", "pending-requests"] });
    },
  });
}