import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface FitraPaymentRecipient {
  id: number;
  fitraPaymentId: number;
  recipientUserId: number;
  recipientFullName: string;
}

export interface FitraPaymentItem {
  id: number;
  fitraId: number;
  userId: number;
  amount: number;
  fitraPaymentTypeId?: number;
  paymentTypeCode: string;
  numberOfPersons?: number;
  paymentDate?: string;
  paymentStatus?: string;
  fullName?: string;
  fitraPaymentRecipientList?: FitraPaymentRecipient[];
}

interface FitraResponse {
  fitraList: Array<{
    id: number;
    startDate?: string;
    endDate?: string;
    amount?: number;
    fitraPaymentList?: FitraPaymentItem[];
  }>;
}

const useGetAllFitra = () => {
  return useQuery<BaseResponse<FitraResponse>, Error, FitraPaymentItem[]>({
    queryKey: ["fitra", "payments"],
    queryFn: () => getData<BaseResponse<FitraResponse>>(`/FamilyTreeBe/Fitra/GetFitra`),
    select: (res) => {
      const list = res.data?.fitraList ?? [];
      const payments = list.flatMap((f) => f.fitraPaymentList ?? []);
      return payments;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetAllFitra;
