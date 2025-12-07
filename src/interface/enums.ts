export enum UserStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
}

export enum ProfileStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED_NOT_COMPLETED = "VERIFIED_NOT_COMPLETED",
  VERIFIED_COMPLETED = "VERIFIED_COMPLETED",
  REJECTED = "REJECTED",
}

export enum LookupDomain {
  GENDER = 'GENDER',
  MARITAL_STATUS = 'MARITAL_STATUS',
  PROFILE_STATUS = 'PROFILE_STATUS',
  SPOUSE_RELATION = 'SPOUSE_RELATION',
  ACADEMIC_LEVEL = 'ACADEMIC_LEVEL',
  EDUCATION_TYPE = 'EDUCATION_TYPE',
  EDUCATION_STATUS = 'EDUCATION_STATUS',
  ADDRESS_TYPE = 'ADDRESS_TYPE',
  EMPLOYMENT_STATUS = 'EMPLOYMENT_STATUS',
  FAMILY_NAME_VARIANT = 'FAMILY_NAME_VARIANT',
  INSTITUTE_LEVEL = 'INSTITUTE_LEVEL',
  PARENTAGE_TYPE = 'PARENTAGE_TYPE',
  USER_ROLE = 'USER_ROLE',
  USER_STATUS = 'USER_STATUS',
  VITAL_STATUS = 'VITAL_STATUS',
}

export enum GenderCode {
  MALE = "MALE",
  FEMALE = "FEMALE"
}

export enum MaritalStatusCode {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  WIDOWED = "WIDOWED",
  DIVORCED = "DIVORCED"
}

export enum SPOUSE_RELATION {
  HUSBAND = "HUSBAND",
  WIFE = "WIFE"
}

export enum VITAL_STATUS {
  ALIVE = "ALIVE",
  DECEASED = "DECEASED"
}

export enum EducationstatusCode {
  Graduated = "Graduated",
  Ongoing = "Ongoing",
  NoEDUCATION = "No education"
}

export enum AcademicLevelCode {
  ACADEMIC = "ACADEMIC",
  INSTITUTE = "INSTITUTE"
}

export enum educationTypeCode {
  PS1 = "PS1",
  PS2 = "PS2",
  PS3 = "PS3",
  PS4 = "PS4",
  PS5 = "PS5",
  PS6 = "PS6",
  PS7 = "PS7",
  PS8 = "PS8",
  PS9 = "PS9",
  SS1 = "SS1",
  SS2 = "SS2",
  SS3 = "SS3",
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
}

export enum InstituteLevelCode {
  BP = "BP",
  BT1 = "BT1",
  BT2 = "BT2",
  BT3 = "BT3",
  TS1 = "TS1",
  TS2 = "TS2",
  TS3 = "TS3",
  LT1 = "LT1",
  LT2 = "LT2",
  LT3 = "LT3",
}

export enum RegionTypeList {
  COUNTRIES = "COUNTRIES",
  GOVERNORATES = "GOVERNORATES",
  DISTRICTS = "DISTRICTS"
}

export enum CountryIso2List {
  LB = "LB",
  SY = "SY"
}

export enum relationshipRequestAction {
  ACCEPT = "ACCEPT",
  REJECT = "REJECT",
  CANCEL = "CANCEL",
  DISMISS = "DISMISS"
}

export enum relationshipRequestType {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  SPOUSE = "SPOUSE"
}

export enum FamilyTreeType {
  SMALL = "SMALL"
}

export enum RealtionShipRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELED = "CANCELED"
}