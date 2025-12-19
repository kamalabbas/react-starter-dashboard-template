export interface Sponsor {
  id: number;
  beneficiaryId: number;
  isSponsoring: boolean;
  unSponsorReason?: string | null;
  fullName: string;
  profilePicUrl?: string | null;
  dateOfBirth?: string | null;
  civilFamilyNumber?: string | null;
  genderDescription?: string | null;
  statusCode?: string | null;
}

export interface Beneficiary {
  id: number;
  fullName: string;
  profilePicUrl?: string | null;
  dateOfBirth?: string | null;
  civilFamilyNumber?: string | null;
  genderDescription?: string | null;
  beneficiaryReason?: string | null;
  sponsors: Sponsor[];
}

export interface GetBeneficiariesResponse {
  beneficiaries: Beneficiary[];
}
