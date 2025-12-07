import {
  AcademicLevelCode,
  EducationstatusCode,
  educationTypeCode,
  GenderCode,
  InstituteLevelCode,
  MaritalStatusCode,
  ProfileStatus,
  UserStatus,
  VITAL_STATUS,
} from "./enums";

export interface User {
  id: number;
  email: string;
  statusCode: UserStatus;
  userRoleCode: string;
  userProfile: UserProfile | null;
}
export interface UserProfile {
  id: number;
  userId: number;
  firstName: string;
  tempFatherName?: string;
  familyName: string;
  genderCode: GenderCode;
  genderDescription: string;
  phoneNumber: string;
  dateOfBirth: string;
  maritalStatusCode: MaritalStatusCode;
  vitalStatusCode?: VITAL_STATUS;
  maritalStatusDescription: string;
  isInDandashiFamily: boolean;
  spouseRelationCode: string | null;
  spouseRelationDescription: string | null;
  spouseName: string | null;
  spouseFamilyName: string | null;
  spouseVitalStatusCode: string | null;
  spouseVitalStatusDescription: string | null;
  profilePicUrl: string | null | undefined;
  educationList: Education[];
  employmentList: Employment[];
  addressList: Address[];
  civilFamily: CivilFamily;
  familyBranch: FamilyBranch;
  father: Parent;
  mother: Parent;
  spouseList: Spouse[];
  statusCode: ProfileStatus;
}
export interface Education {
  id: number;
  educationTypeCode?: educationTypeCode;
  academicLevelCode?: AcademicLevelCode;
  instituteLevelCode?: InstituteLevelCode;
  degreeTitle?: string;
  major?: string;
  schoolName?: string;
  countryId?: number;
  startDate?: string;
  endDate?: string;
  statusCode: EducationstatusCode;
}

// TODO: add enums for each statusCode field
export interface Employment {
  id: number;
  userId: number;
  statusCode: string;
  statusDescription: string;
  countryId: number;
  countryName: string;
  workplace: string;
  companyName: string;
  occupation: string;
  position: string;
  reasonNotWorking: string | null;
  startDate: string;
  endDate: string | null;
}
export interface Address {
  id: number;
  userId: number;
  addressTypeCode: string;
  addressTypeDescription: string;
  countryId: number;
  countryName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
}
export interface FamilyBranch {
  id: number;
  name: string;
  countryId: number;
  countryName: string;
}
export interface CivilFamily {
  civilFamilyCityId: number;
  civilFamilyDistrictId: number;
  civilFamilyGovernorateId: number;
  civilFamilyCityName: string;
  civilFamilyNumber: string;
}
export interface Parent {
  parentId: number;
  parentName: string;
  parentageType: "FATHER" | "MOTHER";
  parentLinkStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  parentageTypeDescription: string;
  profilePicUrl: string | null | undefined;
}
export interface Spouse {
  spouseId: number;
  spouseName: string;
  statusCode: string;
  statusDescription: string;
  startDate: string | null;
  endDate: string | null;
}

export interface UserProfileRequest {
  userId: number;
  firstName: string;
  tempFatherName: string;
  familyName: string;
  genderCode: GenderCode;
  dateOfBirth: string;
  maritalStatusCode: MaritalStatusCode;
  isInDandashiFamily: boolean;
  spouseRelationCode?: string;
  spouseName?: string;
  spouseFamilyName?: string;
  spouseVitalStatusCode?: string;
  phoneNumber?: string;
}
export interface updateProfileSecondStageRequest {
  userId: number;
  educationList: Education[];
  employmentList: Employment[];
  addressList: Address[];
  spouseList: Spouse[];
  civilFamilyCityId?: number;
  civilFamilyNumber?: string;
  familyBranchId?: number;
  fatherId?: number;
  motherId?: number;
}
export interface UserProfileResponse {
  user: User;
}
