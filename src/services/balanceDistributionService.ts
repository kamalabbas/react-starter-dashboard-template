import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  DistributeFitraPayload,
  DistributeSadakaPayload,
  DistributeZakatPayload,
  FitraDistributionHistoryItem,
  GetAllBalancesResponse,
  GetDistributionHistoryResponse,
  GetDonationTypesResponse,
  GetFitraBalanceDetailsResponse,
  GetSadakaBalanceDetailsResponse,
  GetZakatBalanceDetailsResponse,
  SadakaDistributionHistoryItem,
  UpdateDonationTypePayload,
  ZakatDistributionHistoryItem,
} from "@/interface/balanceDistribution.interface";
import { getData, postData } from "./api";

export const getAllBalances = async (): Promise<BaseResponse<GetAllBalancesResponse>> => {
  return getData<BaseResponse<GetAllBalancesResponse>>("/Admin/Balance/GetAllBalances");
};

export const getZakatBalanceDetails = async (): Promise<BaseResponse<GetZakatBalanceDetailsResponse>> => {
  return getData<BaseResponse<GetZakatBalanceDetailsResponse>>("/Admin/Balance/GetZakatBalanceDetails");
};

export const getSadakaBalanceDetails = async (): Promise<BaseResponse<GetSadakaBalanceDetailsResponse>> => {
  return getData<BaseResponse<GetSadakaBalanceDetailsResponse>>("/Admin/Balance/GetSadakaBalanceDetails");
};

export const getFitraBalanceDetails = async (): Promise<BaseResponse<GetFitraBalanceDetailsResponse>> => {
  return getData<BaseResponse<GetFitraBalanceDetailsResponse>>("/Admin/Balance/GetFitraBalanceDetails");
};

export const getDonationTypes = async (): Promise<BaseResponse<GetDonationTypesResponse>> => {
  return getData<BaseResponse<GetDonationTypesResponse>>("/Admin/Balance/GetDonationTypes");
};

export const updateDonationType = async (payload: UpdateDonationTypePayload): Promise<BaseResponse<any>> => {
  return postData<UpdateDonationTypePayload, BaseResponse<any>>("/Admin/Balance/UpdateDonationType", payload);
};

export const distributeZakat = async (payload: DistributeZakatPayload): Promise<BaseResponse<any>> => {
  return postData<DistributeZakatPayload, BaseResponse<any>>("/Admin/Balance/DistributeZakat", payload);
};

export const distributeSadaka = async (payload: DistributeSadakaPayload): Promise<BaseResponse<any>> => {
  return postData<DistributeSadakaPayload, BaseResponse<any>>("/Admin/Balance/DistributeSadaka", payload);
};

export const distributeFitra = async (payload: DistributeFitraPayload): Promise<BaseResponse<any>> => {
  return postData<DistributeFitraPayload, BaseResponse<any>>("/Admin/Balance/DistributeFitra", payload);
};

export const getZakatDistributionHistory = async (): Promise<BaseResponse<GetDistributionHistoryResponse<ZakatDistributionHistoryItem>>> => {
  return getData<BaseResponse<GetDistributionHistoryResponse<ZakatDistributionHistoryItem>>>("/Admin/Balance/GetZakatDistributionHistory");
};

export const getSadakaDistributionHistory = async (): Promise<BaseResponse<GetDistributionHistoryResponse<SadakaDistributionHistoryItem>>> => {
  return getData<BaseResponse<GetDistributionHistoryResponse<SadakaDistributionHistoryItem>>>("/Admin/Balance/GetSadakaDistributionHistory");
};

export const getFitraDistributionHistory = async (): Promise<BaseResponse<GetDistributionHistoryResponse<FitraDistributionHistoryItem>>> => {
  return getData<BaseResponse<GetDistributionHistoryResponse<FitraDistributionHistoryItem>>>("/Admin/Balance/GetFitraDistributionHistory");
};
