import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/api";
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
  paymentTypeCode: string;
  paymentStatus: string;
  fullName: string;
  sadakaRecipientList: SadakaRecipient[];
}

interface SadakaListResponse {
  sadakaList: SadakaItem[];
}

const useGetSadaka = (userId: number) => {
  return useQuery<BaseResponse<SadakaListResponse>, Error, SadakaItem[]>({
    queryKey: ["Sadaka", userId],
    queryFn: () => getData<BaseResponse<SadakaListResponse>>(`/FamilyTreeBe/Sadaka/GetSadaka?userId=${userId}`),
    select: (res) => res.data?.sadakaList ?? [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetSadaka;
