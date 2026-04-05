export type BalanceFeature = "zakat" | "sadaka" | "fitra";

export interface BalanceOverview {
  sadaka: number;
  zakat: number;
  fitra: number;
  total: number;
}

export interface DonationAllocation {
  donationTypeId: number;
  amount: number;
}

export interface DonationType {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isEditable: boolean;
}

export interface UpdateDonationTypePayload {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface RecipientBase {
  id: number;
  recipientUserId: number;
  recipientFullName: string;
}

export interface ZakatRecipient extends RecipientBase {
  zakatId: number;
}

export interface SadakaRecipient extends RecipientBase {
  sadakaId: number;
}

export interface FitraPaymentRecipient extends RecipientBase {
  fitraPaymentId: number;
}

export interface PaymentBase {
  id: number;
  userId: number;
  amount: number;
  paymentDate: string;
  paymentTypeId: number;
  paymentTypeCode: string;
  paymentStatus: string;
  fullName: string;
  isPartiallyDistributed: boolean;
  distributedAmount: number;
}

export interface ZakatBalanceItem extends PaymentBase {
  year: string | null;
  zakatRecipientList: ZakatRecipient[];
}

export interface SadakaBalanceItem extends PaymentBase {
  sadakaRecipientList: SadakaRecipient[];
}

export interface FitraPaymentBalanceItem {
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
  isPartiallyDistributed: boolean;
  distributedAmount: number;
  fitraPaymentRecipientList: FitraPaymentRecipient[];
}

export interface FitraBalanceCampaign {
  id: number;
  startDate: string;
  endDate: string;
  amount: number;
  fitraPaymentList: FitraPaymentBalanceItem[];
}

export interface DistributionHistoryBase {
  id: number;
  userId: number;
  fullName: string;
  paymentTypeId: number;
  paymentTypeCode: string;
  donationTypeId: number | null;
  donationTypeCode: string | null;
  donationTypeDescription: string | null;
  distributedAmount: number;
  distributedAt: string;
  distributedBy: number;
  distributorFullName: string;
}

export interface ZakatDistributionHistoryItem extends DistributionHistoryBase {
  zakatId: number;
  year: string | null;
  amount: number;
  paymentDate: string;
}

export interface SadakaDistributionHistoryItem extends DistributionHistoryBase {
  sadakaId: number;
  amount: number;
  paymentDate: string;
}

export interface FitraDistributionHistoryItem extends DistributionHistoryBase {
  fitraPaymentId: number;
  fitraId: number;
  paymentAmount: number;
  paymentDate: string;
  fitraPaymentTypeId: number;
  numberOfPersons: number;
}

export interface GetAllBalancesResponse {
  sadaka: number;
  zakat: number;
  fitra: number;
  total: number;
}

export interface GetZakatBalanceDetailsResponse {
  zakatList: ZakatBalanceItem[];
}

export interface GetSadakaBalanceDetailsResponse {
  sadakaList: SadakaBalanceItem[];
}

export interface GetFitraBalanceDetailsResponse {
  fitraList: FitraBalanceCampaign[];
}

export interface GetDonationTypesResponse {
  donationTypeList: DonationType[];
}

export interface GetDistributionHistoryResponse<T> {
  distributionList: T[];
}

export interface DistributeZakatPayload {
  zakatId: number;
  donation: DonationAllocation[] | null;
}

export interface DistributeSadakaPayload {
  sadakaId: number;
  donation: DonationAllocation[] | null;
}

export interface DistributeFitraPayload {
  fitraPaymentId: number;
  donation: DonationAllocation[] | null;
}
