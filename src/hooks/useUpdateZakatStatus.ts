import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateZakatPayload {
  zakatId: number;
  paymentStatus: string;
}

export default function useUpdateZakatStatus() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateZakatPayload>({
    mutationFn: (body: UpdateZakatPayload) => postData<UpdateZakatPayload, BaseResponse<any>>(`/Admin/Fitra/UpdateZakatStatus`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zakat", "list"] });
    },
  });
}
