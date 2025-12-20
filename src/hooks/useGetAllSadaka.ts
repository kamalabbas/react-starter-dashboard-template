import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface SadakaRecipient {
  id: number;
  sadakaId: number;
  recipientUserId: number;
  recipientFullName: string;
}

export interface SadakaItem {
  id: number;
  userId: number;
  amount: number;
  paymentDate: string;
  paymentTypeId?: number;
  paymentTypeCode: string;
  paymentStatus: string;
  fullName: string;
  sadakaRecipientList: SadakaRecipient[];
}

interface SadakaListResponse {
  sadakaList: SadakaItem[];
}

const useGetAllSadaka = () => {
  return useQuery<BaseResponse<SadakaListResponse>, Error, SadakaItem[]>({
    queryKey: ["sadaka", "list"],
    queryFn: () => getData<BaseResponse<SadakaListResponse>>(`/FamilyTreeBe/Sadaka/GetSadaka`),
    select: (res) => res.data?.sadakaList ?? [],
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetAllSadaka;
