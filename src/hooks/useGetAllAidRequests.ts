import { BaseResponse } from "@/interface/baseResponse.interface";
import { RealtionShipRequestStatus } from "@/interface/enums";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface AidUserInfo {
  id: number;
  fullName: string;
  profilePicUrl: string;
  dateOfBirth: string;
  civilFamilyNumber: string;
  genderDescription: string;
  requestedAt?: string;
  helpedAt?: string;
  statusCode?: RealtionShipRequestStatus
}

export interface AskForAidItem {
  askForAidId: number;
  typeId: number;
  typeCode: string;
  description: string | null;
  requester: AidUserInfo;
  helper: AidUserInfo | null;
}

export interface AskForAidResponse {
  askForAids: AskForAidItem[];
}


const useGetAllAidRequests = () => {
  return useQuery<BaseResponse<AskForAidResponse>,Error,AskForAidItem[]>({
    queryKey: ["AllAidRequests"],
    queryFn: () =>getData<BaseResponse<AskForAidResponse>>(`/FamilyTreeBe/AskForAid/GetAllRequests`),
    select: (res) => res?.data?.askForAids ?? [],
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetAllAidRequests;
