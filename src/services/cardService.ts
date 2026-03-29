import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  AcceptCardRequestPayload,
  CardRequest,
  GetPendingCardRequestsResponse,
  RejectCardRequestPayload,
} from "@/interface/card.interface";
import { getData, postData } from "./api";

export const getPendingCardRequests = async (): Promise<BaseResponse<GetPendingCardRequestsResponse>> => {
  return getData<BaseResponse<GetPendingCardRequestsResponse>>("/Admin/Card/GetPendingRequests");
};

export const acceptCardRequest = async (payload: AcceptCardRequestPayload): Promise<BaseResponse<{ result: { cardRequest: CardRequest } }>> => {
  return postData<AcceptCardRequestPayload, BaseResponse<{ result: { cardRequest: CardRequest } }>>(
    "/Admin/Card/AcceptRequest",
    payload
  );
};

export const rejectCardRequest = async (payload: RejectCardRequestPayload): Promise<BaseResponse<{ result: { cardRequest: CardRequest } }>> => {
  return postData<RejectCardRequestPayload, BaseResponse<{ result: { cardRequest: CardRequest } }>>(
    "/Admin/Card/RejectRequest",
    payload
  );
};