import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface ZakatRecipient {
  id: number;
  zakatId: number;
  recipientUserId: number;
  recipientFullName: string;
}

export interface ZakatItem {
  id: number;
  userId: number;
  year: string;
  amount: number;
  paymentDate: string;
  paymentTypeId: number;
  paymentTypeCode: string;
  paymentStatus: string;
  fullName: string;
  zakatRecipientList: ZakatRecipient[];
}

interface ZakatListResponse {
  zakatList: ZakatItem[];
}

const useZakat = (userId: number) => {
  return useQuery<BaseResponse<ZakatListResponse>,Error,ZakatItem[]>({
    queryKey: ["Zakat", userId],
    queryFn: () => getData<BaseResponse<ZakatListResponse>>(`/FamilyTreeBe/Zakat/GetZakat?userId=${userId}`),
    select: (res) => res.data?.zakatList ?? [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5
  });
};

export default useZakat;
