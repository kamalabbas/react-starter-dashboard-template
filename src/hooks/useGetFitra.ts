import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

// Types
export interface FitraPaymentRecipient {
    id: number;
    fitraPaymentId: number;
    recipientUserId: number;
    recipientFullName: string;
}

export interface FitraPayment {
    id: number;
    fitraId: number;
    userId: number;
    amount: number;
    fitraPaymentTypeId: number;
    paymentTypeCode: string;
    numberOfPersons: number;
    paymentDate: string;
    paymentStatus: string;
    fullName: string;
    fitraPaymentRecipientList: FitraPaymentRecipient[];
}

export interface Fitra {
    id: number;
    startDate: string;
    endDate: string;
    amount: number;
    fitraPaymentList: FitraPayment[];
}

export interface GetFitraResponse {
    fitraList: Fitra[];
}

const useGetFitra = (userId: number) => {
    return useQuery<BaseResponse<GetFitraResponse>, Error, Fitra[]>({
        queryKey: ["Fitra", userId],
        queryFn: () => getData<BaseResponse<GetFitraResponse>>(`/FamilyTreeBe/Fitra/GetFitra?userId=${userId}`),
        select: (res) => res.data?.fitraList ?? [],
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
    });
};

export default useGetFitra;
