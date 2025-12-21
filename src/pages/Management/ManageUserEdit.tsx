import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToastStore } from "@/stores/toastStore";
import { putData } from "@/services/api";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Checkbox from "@/components/form/input/Checkbox";
import FileInput from "@/components/form/input/FileInput";

import useUsersList from "@/hooks/useUsersList";
import { User } from "@/interface/user.interface";
import { GenderCode, MaritalStatusCode, RegionTypeList, VITAL_STATUS } from "@/interface/enums";
import { LookupDomain } from "@/interface/enums";
import { useLookup } from "@/hooks/useLookup";
import { useCities, useGetLocations } from "@/hooks/useGetLocations";
import { useGetFamilyBranches } from "@/hooks/useGetFamilyBranches";
import UserSearchSelect from "@/components/form/UserSearchSelect";

// Expanded schema to match Expo form
const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  tempFatherName: yup.string(),
  familyName: yup.string().required("Family name is required"),
  gender: yup.string().required("Gender is required"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  maritalStatus: yup.string().required("Marital status is required"),
  vitalStatus: yup.string().required("Vital status is required"),
  educationList: yup
    .array()
    .of(
      yup.object({
        statusCode: yup.string().required("Education Status is required"),
        educationTypeCode: yup.string().nullable(),
        academicLevelCode: yup.string().nullable(),
        instituteLevelCode: yup.string().nullable(),
        degreeTitle: yup.string().nullable(),
        major: yup.string().nullable(),
        schoolName: yup.string().nullable(),
        startDate: yup.string().nullable(),
        endDate: yup.string().nullable(),
      })
    )
    .min(1, "At least one education record is required"),
  employmentList: yup
    .array()
    .of(
      yup.object({
        statusCode: yup.string().required("Employment Status is required"),
        workplace: yup.string().nullable(),
        companyName: yup.string().nullable(),
        occupation: yup.string().nullable(),
        position: yup.string().nullable(),
        reasonNotWorking: yup.string().nullable(),
        startDate: yup.string().nullable(),
        endDate: yup.string().nullable(),
      })
    )
    .min(1, "At least one employment record is required"),
  addressList: yup
    .array()
    .of(
      yup.object({
        line1: yup.string().required("Address line 1 is required"),
        line2: yup.string().nullable(),
        city: yup.string().required("City is required"),
        state: yup.string().required("State is required"),
        postalCode: yup.string().nullable(),
        countryId: yup.string().required("Country is required"),
        addressTypeCode: yup.string().oneOf(["ORIGIN", "CURRENT"], "Invalid address type").required("Address type is required"),
      })
    )
    .test("origin-current-only", "Origin and Current addresses are required", (value) => {
      const list = Array.isArray(value) ? value : [];
      if (list.length !== 2) return false;
      const types = list.map((a) => a?.addressTypeCode).filter(Boolean);
      return types.includes("ORIGIN") && types.includes("CURRENT");
    }),
  spouseList: yup
    .array()
    .of(
      yup.object({
        spouseId: yup.string().nullable(),
        statusCode: yup.string().nullable(),
        startDate: yup.string().nullable(),
        endDate: yup
          .string()
          .nullable()
          .when("statusCode", {
            is: (v: unknown) => v === "DIVORCED" || v === "WIDOWED",
            then: (s) => s.required("End date is required"),
            otherwise: (s) => s.nullable(),
          }),
      })
    )
    .max(4, "Maximum 4 spouses"),
  civilFamilyGovernorateId: yup.string().nullable(),
  civilFamilyDistrictId: yup.string().nullable(),
  civilFamilyCityId: yup.string().nullable(),
  civilFamilyNumber: yup.string().nullable(),
  familyBranchId: yup.string().nullable(),
  fatherId: yup.string().nullable(),
  motherId: yup.string().nullable(),
  hasNoCivilId: yup.boolean().optional(),
});

const ManageUserEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsersList();
  const showToast = useToastStore((s) => s.showToast);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [initialFatherLabel, setInitialFatherLabel] = useState<string>("");
  const [initialMotherLabel, setInitialMotherLabel] = useState<string>("");
  const [initialSpouseLabels, setInitialSpouseLabels] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      tempFatherName: "",
      familyName: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      vitalStatus: "",
      educationList: [
        {
          statusCode: "",
          educationTypeCode: "",
          academicLevelCode: "",
          instituteLevelCode: "",
          degreeTitle: "",
          major: "",
          schoolName: "",
          startDate: "",
          endDate: "",
        },
      ],
      employmentList: [
        {
          statusCode: "",
          workplace: "",
          companyName: "",
          occupation: "",
          position: "",
          reasonNotWorking: "",
          startDate: "",
          endDate: "",
        },
      ],
      addressList: [
        {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          countryId: "",
          addressTypeCode: "ORIGIN",
        },
        {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          countryId: "",
          addressTypeCode: "CURRENT",
        },
      ],
      spouseList: [],
      civilFamilyGovernorateId: "",
      civilFamilyDistrictId: "",
      civilFamilyCityId: "",
      civilFamilyNumber: "",
      familyBranchId: "",
      fatherId: "",
      motherId: "",
      hasNoCivilId: false,
    },
  });

  const maritalStatus = watch("maritalStatus");
  const hasNoCivilId = watch("hasNoCivilId");
  const selectedGender = watch("gender");
  const spouseSearchGender = selectedGender === GenderCode.MALE ? GenderCode.FEMALE : GenderCode.MALE;
  const civilFamilyNumberValueRaw = watch("civilFamilyNumber");
  const civilFamilyNumberValue = civilFamilyNumberValueRaw == null ? undefined : String(civilFamilyNumberValueRaw);

  // get Locations (countries/governorates/districts)
  const { data: locationsResp } = useGetLocations([RegionTypeList.COUNTRIES, RegionTypeList.GOVERNORATES, RegionTypeList.DISTRICTS]);
  const countriesList: any[] = Array.isArray(locationsResp?.data?.countries) ? (locationsResp?.data?.countries as any[]) : [];

  // Origin country drives civil locations & family branches (same as Expo)
  const selectedOriginCountryId = watch("addressList.0.countryId");
  const selectedIso = useMemo(() => {
    const raw = String(selectedOriginCountryId ?? "").trim();
    if (!raw) return "";
    if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
    const countries = (locationsResp?.data?.countries ?? []) as any[];
    const selected = countries.find((c) => String(c?.id) === raw);
    return String(selected?.iso2 ?? "").toUpperCase();
  }, [selectedOriginCountryId, locationsResp?.data?.countries]);

  const selectedCivilGovId = watch("civilFamilyGovernorateId");
  const selectedCivilDistrictId = watch("civilFamilyDistrictId");

  const { data: citiesList = [], isFetching: isFetchingCities } = useCities(
    selectedIso,
    Number(selectedCivilGovId) || 0,
    Number(selectedCivilDistrictId) || 0
  );

  const { data: familyBranchesResp } = useGetFamilyBranches(selectedIso);
  const familyBranchesList: any[] = (() => {
    const d = familyBranchesResp?.data as any;
    if (!d) return [];
    if (Array.isArray(d.familyBranchList)) return d.familyBranchList;
    if (Array.isArray(d)) return d;
    return [];
  })();

  const allCountryOptions = (Array.isArray(countriesList) ? countriesList : [])
    .map((c: any) => {
      const iso2 = String(
        c?.iso2 ??
          c?.isoCode2 ??
          c?.isoCode ??
          c?.alpha2 ??
          c?.countryIso2 ??
          c?.countryCode ??
          c?.code ??
          ""
      ).toUpperCase();
      const name =
        c?.name ??
        c?.label ??
        c?.countryName ??
        c?.description ??
        c?.englishName ??
        c?.nameEn ??
        iso2;
      const id = c?.id ?? c?.value ?? c?.countryId ?? c?.countryID ?? c?.country_id;
      const value = id != null && String(id) !== "" ? String(id) : iso2 || String(name || "");
      return { value, label: String(name || value), iso2 };
    })
    .filter((o: any) => String(o.value || "").trim().length > 0);

  const originCountryOptions = (allCountryOptions.length
    ? allCountryOptions
    : [
        { value: "LB", label: "Lebanon", iso2: "LB" },
        { value: "SY", label: "Syria", iso2: "SY" },
      ]
  ).filter((c: any) => ["LB", "SY"].includes(String(c.iso2).toUpperCase()));

  // IMPORTANT: current address MUST show ALL countries from API (no filter)
  const currentCountryOptions = allCountryOptions.length
    ? allCountryOptions
    : [
        { value: "LB", label: "Lebanon", iso2: "LB" },
        { value: "SY", label: "Syria", iso2: "SY" },
      ];

  const { getDomain: getLookupDomain } = useLookup([
    LookupDomain.GENDER,
    LookupDomain.MARITAL_STATUS,
    LookupDomain.VITAL_STATUS,
    LookupDomain.EDUCATION_STATUS,
    LookupDomain.EDUCATION_TYPE,
    LookupDomain.ACADEMIC_LEVEL,
    LookupDomain.INSTITUTE_LEVEL,
    LookupDomain.EMPLOYMENT_STATUS,
  ]);

  const genderOptions = (getLookupDomain(LookupDomain.GENDER) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const maritalOptions = (getLookupDomain(LookupDomain.MARITAL_STATUS) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const vitalStatusOptions = (getLookupDomain(LookupDomain.VITAL_STATUS) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const academicLevelOptions = (getLookupDomain(LookupDomain.ACADEMIC_LEVEL) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const educationTypeOptions = (getLookupDomain(LookupDomain.EDUCATION_TYPE) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const educationStatusOptions = (getLookupDomain(LookupDomain.EDUCATION_STATUS) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const employmentStatusOptions = (getLookupDomain(LookupDomain.EMPLOYMENT_STATUS) ?? []).map((c: any) => ({ label: c.description, value: c.code }));
  const instituteLevelOptions = (getLookupDomain(LookupDomain.INSTITUTE_LEVEL) ?? []).map((c: any) => ({ label: c.description, value: c.code }));

  const effectiveGenderOptions = genderOptions.length
    ? genderOptions
    : [
        { value: GenderCode.MALE, label: "Male" },
        { value: GenderCode.FEMALE, label: "Female" },
      ];

  const effectiveMaritalOptions = maritalOptions.length
    ? maritalOptions
    : [
        { value: MaritalStatusCode.SINGLE, label: "Single" },
        { value: MaritalStatusCode.MARRIED, label: "Married" },
        { value: MaritalStatusCode.WIDOWED, label: "Widowed" },
        { value: MaritalStatusCode.DIVORCED, label: "Divorced" },
      ];

  const effectiveVitalStatusOptions = vitalStatusOptions.length
    ? vitalStatusOptions
    : [
        { value: VITAL_STATUS.ALIVE, label: "Alive" },
        { value: VITAL_STATUS.DECEASED, label: "Deceased" },
      ];
  const isNoEducation = (code?: string) => {
    const c = String(code || "").toUpperCase();
    return c.includes("NO") && c.includes("EDU");
  };

  const isAcademic = (code?: string) =>
    String(code || "")
      .toUpperCase()
      .includes("ACADEMIC");
  const isInstitute = (code?: string) =>
    String(code || "")
      .toUpperCase()
      .includes("INSTITUTE");
  const isNotWorking = (code?: string) => {
    const c = String(code || "").toUpperCase();
    return c.includes("NOT") || c.includes("UNEMP");
  };

  const normalizeAddresses = (addressList: any) => {
    const list = Array.isArray(addressList) ? addressList : [];
    const origin = list.find((a) => a?.addressTypeCode === "ORIGIN") ?? {};
    const current = list.find((a) => a?.addressTypeCode === "CURRENT") ?? {};
    const toAddr = (a: any, addressTypeCode: "ORIGIN" | "CURRENT") => ({
      line1: a?.line1 || "",
      line2: a?.line2 || "",
      city: a?.city || "",
      state: a?.state || "",
      postalCode: a?.postalCode || "",
      countryId: a?.countryId?.toString?.() || a?.countryId || "",
      addressTypeCode,
    });
    return [toAddr(origin, "ORIGIN"), toAddr(current, "CURRENT")];
  };

  const extractDisplayName = (obj: any) => {
    if (!obj) return "";

    const direct = String(
      obj?.parentName ??
        obj?.spouseName ??
        obj?.fullName ??
        obj?.name ??
        obj?.displayName ??
        obj?.userName ??
        obj?.parentFullName ??
        obj?.spouseFullName ??
        ""
    ).trim();
    if (direct) return direct;

    const first = String(obj?.firstName ?? obj?.parentFirstName ?? obj?.spouseFirstName ?? "").trim();
    const family = String(obj?.familyName ?? obj?.parentFamilyName ?? obj?.spouseFamilyName ?? "").trim();
    const combined = `${first} ${family}`.trim();
    if (combined) return combined;

    const nestedProfile = obj?.userProfile ?? obj?.profile ?? obj?.parentProfile ?? obj?.spouseProfile;
    if (nestedProfile) {
      const nf = String(nestedProfile?.firstName ?? "").trim();
      const nl = String(nestedProfile?.familyName ?? nestedProfile?.lastName ?? "").trim();
      const nested = `${nf} ${nl}`.trim();
      if (nested) return nested;
    }

    return "";
  };

  useEffect(() => {
    if (!id) return;
    const u: User | undefined = users.find((x: any) => String(x.id) === String(id));
    if (u && u.userProfile) {
      const p = u.userProfile;

      const getNameByUserId = (userId: any) => {
        const uid = Number(userId) || 0;
        if (uid <= 0) return "";
        const found = users.find((x: any) => Number(x?.id) === uid);
        const prof: any = found?.userProfile;
        const first = String(prof?.firstName ?? "").trim();
        const fam = String(prof?.familyName ?? "").trim();
        const full = `${first} ${fam}`.trim();
        return full || String(found?.email ?? "").trim();
      };

      setValue("firstName", p.firstName);
      setValue("tempFatherName", p.tempFatherName);
      setValue("familyName", p.familyName);
      setValue("gender", p.genderCode);
      setValue("dateOfBirth", p.dateOfBirth?.slice(0, 10));
      setValue("maritalStatus", p.maritalStatusCode);
      setValue("vitalStatus", p.vitalStatusCode || "");
      setValue(
        "educationList",
        Array.isArray(p.educationList) && p.educationList.length > 0
          ? p.educationList.map((e) => ({
              statusCode: e.statusCode,
              educationTypeCode: e.educationTypeCode,
              academicLevelCode: e.academicLevelCode,
              instituteLevelCode: e.instituteLevelCode,
              degreeTitle: e.degreeTitle,
              major: e.major,
              schoolName: e.schoolName,
              startDate: e.startDate ? e.startDate.slice(0, 10) : "",
              endDate: e.endDate ? e.endDate.slice(0, 10) : "",
            }))
          : [
              {
                statusCode: "",
                educationTypeCode: "",
                academicLevelCode: "",
                instituteLevelCode: "",
                degreeTitle: "",
                major: "",
                schoolName: "",
                startDate: "",
                endDate: "",
              },
            ]
      );
      setValue(
        "employmentList",
        Array.isArray(p.employmentList) && p.employmentList.length > 0
          ? p.employmentList.map((e) => ({
              statusCode: e.statusCode,
              workplace: e.workplace,
              companyName: e.companyName,
              occupation: e.occupation,
              position: e.position,
              reasonNotWorking: e.reasonNotWorking,
              startDate: e.startDate ? e.startDate.slice(0, 10) : "",
              endDate: e.endDate ? e.endDate.slice(0, 10) : "",
            }))
          : [{ statusCode: "", workplace: "", companyName: "", occupation: "", position: "", reasonNotWorking: "", startDate: "", endDate: "" }]
      );
      setValue("addressList", normalizeAddresses(p.addressList));
      setValue(
        "spouseList",
        Array.isArray(p.spouseList)
          ? p.spouseList.slice(0, 4).map((s) => ({
              spouseId: s?.spouseId && Number(s.spouseId) > 0 ? String(s.spouseId) : "",
              statusCode: s.statusCode,
              startDate: s.startDate ? s.startDate.slice(0, 10) : "",
              endDate: s.endDate ? s.endDate.slice(0, 10) : "",
            }))
          : []
      );

      setInitialSpouseLabels(
        Array.isArray(p.spouseList)
          ? p.spouseList.slice(0, 4).map((s) => {
              const direct = extractDisplayName(s);
              if (direct) return direct;
              return getNameByUserId(s?.spouseId);
            })
          : []
      );
      setValue("civilFamilyGovernorateId", p.civilFamily?.civilFamilyGovernorateId?.toString());
      setValue("civilFamilyDistrictId", p.civilFamily?.civilFamilyDistrictId?.toString());
      setValue("civilFamilyCityId", p.civilFamily?.civilFamilyCityId?.toString());
      setValue("civilFamilyNumber", p.civilFamily?.civilFamilyNumber);

      setInitialFatherLabel(extractDisplayName(p.father.parentName) || getNameByUserId(p.father?.parentId));
      setInitialMotherLabel(extractDisplayName(p.mother.parentName) || getNameByUserId(p.mother?.parentId));

      const isNoCivil = String(p.civilFamily?.civilFamilyNumber || "") === "-999";
      setValue("hasNoCivilId", isNoCivil);
      if (isNoCivil) {
        setValue("civilFamilyGovernorateId", "");
        setValue("civilFamilyDistrictId", "");
        setValue("civilFamilyCityId", "");
        setValue("civilFamilyNumber", "-999");
      }

      setValue("familyBranchId", p?.familyBranch?.id && Number(p.familyBranch.id) > 0 ? String(p.familyBranch.id) : "");
      setValue("fatherId", p?.father?.parentId && Number(p.father.parentId) > 0 ? String(p.father.parentId) : "");
      setValue("motherId", p?.mother?.parentId && Number(p.mother.parentId) > 0 ? String(p.mother.parentId) : "");
      setProfilePicUrl(p.profilePicUrl || null);
    }
  }, [id, users, setValue]);

  useEffect(() => {
    // Mirror Expo behavior:
    // - when checked: hide civil-location fields and force values
    // - when unchecked: clear default -999 (if it was auto-filled)
    if (hasNoCivilId) {
      setValue("civilFamilyGovernorateId", "", { shouldDirty: true });
      setValue("civilFamilyDistrictId", "", { shouldDirty: true });
      setValue("civilFamilyCityId", "", { shouldDirty: true });
      setValue("civilFamilyNumber", "-999", { shouldDirty: true });
    } else {
      // When user UNCHECKS, clear the sentinel value
      const current = String(watch("civilFamilyNumber") ?? "");
      if (current === "-999") {
        setValue("civilFamilyNumber", "", { shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNoCivilId, setValue]);

  useEffect(() => {
    if (maritalStatus === MaritalStatusCode.SINGLE) {
      setValue("spouseList", []);
    }
  }, [maritalStatus, setValue]);

  const onSubmit = async (data: any) => {
    try {
      // Prepare form data for API
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      if (profilePic) formData.append("profilePic", profilePic);

      const payload: any = { userId: id, ...data };
      if (payload.hasNoCivilId) {
        payload.civilFamilyGovernorateId = null;
        payload.civilFamilyDistrictId = null;
        payload.civilFamilyCityId = null;
        payload.civilFamilyNumber = "-999";
      }

      await putData(`/FamilyTreeBe/UpdateUser`, payload);
      showToast("Saved successfully", "success");
      navigate("/manage-users");
    } catch (err) {
      showToast("Failed to save user", "error");
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{id ? "Edit User" : "Create User"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden flex items-center justify-center">
            {/* Show preview if available */}
            {profilePic ? (
              <img src={URL.createObjectURL(profilePic)} alt="Profile" className="object-cover w-full h-full" />
            ) : profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-400 dark:text-gray-500">No Image</span>
            )}
          </div>
          <FileInput onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
        </div>
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="First name" error={!!errors.firstName} />}
            />
            {errors.firstName && <p className="text-error-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Middle Name</label>
            <Controller
              name="tempFatherName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Middle name" error={!!errors.tempFatherName} />}
            />
            {errors.tempFatherName && <p className="text-error-500 text-xs mt-1">{errors.tempFatherName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Family Name</label>
            <Controller
              name="familyName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Family name" error={!!errors.familyName} />}
            />
            {errors.familyName && <p className="text-error-500 text-xs mt-1">{errors.familyName.message}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select options={effectiveGenderOptions} placeholder="Select gender" onChange={field.onChange} defaultValue={field.value} />
              )}
            />
            {errors.gender && <p className="text-error-500 text-xs mt-1">{errors.gender.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of Birth</label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => <Input {...field} type="date" placeholder="YYYY-MM-DD" error={!!errors.dateOfBirth} />}
            />
            {errors.dateOfBirth && <p className="text-error-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Marital Status</label>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <Select options={effectiveMaritalOptions} placeholder="Select marital status" onChange={field.onChange} defaultValue={field.value} />
              )}
            />
            {errors.maritalStatus && <p className="text-error-500 text-xs mt-1">{errors.maritalStatus.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Vital Status</label>
            <Controller
              name="vitalStatus"
              control={control}
              render={({ field }) => (
                <Select
                  options={effectiveVitalStatusOptions}
                  placeholder="Select vital status"
                  onChange={field.onChange}
                  defaultValue={field.value}
                />
              )}
            />
            {errors.vitalStatus && <p className="text-error-500 text-xs mt-1">{errors.vitalStatus.message}</p>}
          </div>
        </div>
        {/* Education Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Education</h3>
          <Controller
            name="educationList"
            control={control}
            render={({ field }) => (
              <div>
                {(field.value || []).map((edu: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                      <Select
                        options={educationStatusOptions}
                        defaultValue={edu.statusCode || ""}
                        onChange={(v) => {
                          const arr = Array.isArray(field.value) ? [...field.value] : [];
                          arr[idx].statusCode = v;
                          if (isNoEducation(v)) {
                            arr[idx].educationTypeCode = "";
                            arr[idx].academicLevelCode = "";
                            arr[idx].instituteLevelCode = "";
                            arr[idx].degreeTitle = "";
                            arr[idx].major = "";
                            arr[idx].schoolName = "";
                            arr[idx].startDate = "";
                            arr[idx].endDate = "";
                          }
                          field.onChange(arr);
                        }}
                      />
                    </div>
                    {!isNoEducation(edu.statusCode) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Education Type</label>
                          <Select
                            options={educationTypeOptions}
                            defaultValue={edu.educationTypeCode || ""}
                            onChange={(v) => {
                              const arr = Array.isArray(field.value) ? [...field.value] : [];
                              arr[idx].educationTypeCode = v;
                              if (isAcademic(v)) arr[idx].instituteLevelCode = "";
                              if (isInstitute(v)) arr[idx].academicLevelCode = "";
                              field.onChange(arr);
                            }}
                          />
                        </div>

                        {isAcademic(edu.educationTypeCode) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Academic Level</label>
                            <Select
                              options={academicLevelOptions}
                              defaultValue={edu.academicLevelCode || ""}
                              onChange={(v) => {
                                const arr = Array.isArray(field.value) ? [...field.value] : [];
                                arr[idx].academicLevelCode = v;
                                field.onChange(arr);
                              }}
                            />
                          </div>
                        )}

                        {isInstitute(edu.educationTypeCode) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Institute Level</label>
                            <Select
                              options={instituteLevelOptions}
                              defaultValue={edu.instituteLevelCode || ""}
                              onChange={(v) => {
                                const arr = Array.isArray(field.value) ? [...field.value] : [];
                                arr[idx].instituteLevelCode = v;
                                field.onChange(arr);
                              }}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Degree Title</label>
                          <Input
                            value={edu.degreeTitle || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].degreeTitle = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Major</label>
                          <Input
                            value={edu.major || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].major = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">School Name</label>
                          <Input
                            value={edu.schoolName || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].schoolName = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Start Date</label>
                          <DatePicker
                            id={`edu-start-${idx}`}
                            defaultDate={edu.startDate || ""}
                            onChange={(date) => {
                              const arr = [...(field.value || [])];
                              arr[idx].startDate = date && date[0] ? date[0].toISOString() : "";
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">End Date</label>
                          <DatePicker
                            id={`edu-end-${idx}`}
                            defaultDate={edu.endDate || ""}
                            onChange={(date) => {
                              const arr = [...(field.value || [])];
                              arr[idx].endDate = date && date[0] ? date[0].toISOString() : "";
                              field.onChange(arr);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {/* <button type="button" className="px-3 py-1 rounded bg-primary-600 dark:bg-primary-400 text-white text-sm font-semibold mt-2" onClick={() => field.onChange([...(Array.isArray(field.value) ? field.value : []), {
                  statusCode: "",
                  educationTypeCode: "",
                  academicLevelCode: "",
                  instituteLevelCode: "",
                  degreeTitle: "",
                  major: "",
                  schoolName: "",
                  startDate: "",
                  endDate: "",
                }])}>Add Education</button> */}
              </div>
            )}
          />
        </div>
        {/* Employment Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Employment</h3>
          <Controller
            name="employmentList"
            control={control}
            render={({ field }) => (
              <div>
                {(field.value || []).map((emp: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                      <Select
                        options={employmentStatusOptions}
                        defaultValue={emp.statusCode || ""}
                        onChange={(v) => {
                          const arr = Array.isArray(field.value) ? [...field.value] : [];
                          arr[idx].statusCode = v;
                          // if (isNotWorking(v)) {
                          //   arr[idx].workplace = "";
                          //   arr[idx].companyName = "";
                          //   arr[idx].occupation = "";
                          //   arr[idx].position = "";
                          //   arr[idx].startDate = "";
                          //   arr[idx].endDate = "";
                          // } else {
                          //   arr[idx].reasonNotWorking = "";
                          // }
                          field.onChange(arr);
                        }}
                      />
                    </div>
                    {!isNotWorking(emp.statusCode) ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Workplace</label>
                          <Input
                            value={emp.workplace || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].workplace = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Name</label>
                          <Input
                            value={emp.companyName || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].companyName = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Occupation</label>
                          <Input
                            value={emp.occupation || ""}
                            onChange={(e) => {
                              const arr = [...(field.value || [])];
                              arr[idx].occupation = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Position</label>
                          <Input
                            value={emp.position || ""}
                            onChange={(e) => {
                              const arr = Array.isArray(field.value) ? [...field.value] : [];
                              arr[idx].position = e.target.value;
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Start Date</label>
                          <DatePicker
                            id={`emp-start-${idx}`}
                            defaultDate={emp.startDate || ""}
                            onChange={(date) => {
                              const arr = [...(field.value || [])];
                              arr[idx].startDate = date && date[0] ? date[0].toISOString() : "";
                              field.onChange(arr);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">End Date</label>
                          <DatePicker
                            id={`emp-end-${idx}`}
                            defaultDate={emp.endDate || ""}
                            onChange={(date) => {
                              const arr = [...(field.value || [])];
                              arr[idx].endDate = date && date[0] ? date[0].toISOString() : "";
                              field.onChange(arr);
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Reason Not Working</label>
                        <Input
                          value={emp.reasonNotWorking || ""}
                          onChange={(e) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].reasonNotWorking = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {/* <button type="button" className="px-3 py-1 rounded bg-primary-600 dark:bg-primary-400 text-white text-sm font-semibold mt-2" onClick={() => field.onChange([...(Array.isArray(field.value) ? field.value : []), {
                  statusCode: "",
                  workplace: "",
                  companyName: "",
                  occupation: "",
                  position: "",
                  reasonNotWorking: "",
                  startDate: "",
                  endDate: "",
                }])}>Add Employment</button> */}
              </div>
            )}
          />
        </div>
        {/* Address Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Address</h3>
          <Controller
            name="addressList"
            control={control}
            render={({ field }) => (
              <div>
                {(Array.isArray(field.value) ? field.value : normalizeAddresses([])).map((addr: any, idx: number) => (
                  <div key={idx} className="mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-800">
                    <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {addr.addressTypeCode === "CURRENT" ? "Current Address" : "Origin Address"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Line 1</label>
                        <Input
                          value={addr.line1 || ""}
                          onChange={(e) => {
                            const arr = [...(field.value || [])];
                            arr[idx].line1 = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Line 2</label>
                        <Input
                          value={addr.line2 || ""}
                          onChange={(e) => {
                            const arr = [...(field.value || [])];
                            arr[idx].line2 = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">City</label>
                        <Input
                          value={addr.city || ""}
                          onChange={(e) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].city = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">State</label>
                        <Input
                          value={addr.state || ""}
                          onChange={(e) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].state = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Postal Code</label>
                        <Input
                          value={addr.postalCode || ""}
                          onChange={(e) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].postalCode = e.target.value;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Country</label>
                        <Select
                          options={(addr.addressTypeCode === "ORIGIN" ? originCountryOptions : currentCountryOptions).map((c: any) => ({
                            value: c.value,
                            label: c.label,
                          }))}
                          defaultValue={addr.countryId || ""}
                          onChange={(v) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].countryId = v;
                            arr[idx].addressTypeCode = addr.addressTypeCode;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
        {/* Spouse Section */}
        {maritalStatus !== MaritalStatusCode.SINGLE && (
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Spouse</h3>
            <Controller
              name="spouseList"
              control={control}
              render={({ field }) => (
                <div>
                  {(field.value || []).map((sp: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-800">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Spouse ID</label>
                        <UserSearchSelect
                          value={sp.spouseId || ""}
                          gender={spouseSearchGender}
                          initialLabel={initialSpouseLabels[idx]}
                          onChange={(v) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].spouseId = v;
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                        <Select
                          options={[
                            { value: "MARRIED", label: "Married" },
                            { value: "DIVORCED", label: "Divorced" },
                            { value: "WIDOWED", label: "Widowed" },
                          ]}
                          defaultValue={sp.statusCode || ""}
                          onChange={(v) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].statusCode = v;
                            if (v === "MARRIED") arr[idx].endDate = "";
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Start Date</label>
                        <DatePicker
                          id={`spouse-start-${idx}`}
                          defaultDate={sp.startDate || ""}
                          onChange={(date) => {
                            const arr = [...(field.value || [])];
                            arr[idx].startDate = date && date[0] ? date[0].toISOString() : "";
                            field.onChange(arr);
                          }}
                        />
                      </div>
                      {sp.statusCode && sp.statusCode !== "MARRIED" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">End Date</label>
                          <DatePicker
                            id={`spouse-end-${idx}`}
                            defaultDate={sp.endDate || ""}
                            onChange={(date) => {
                              const arr = [...(field.value || [])];
                              arr[idx].endDate = date && date[0] ? date[0].toISOString() : "";
                              field.onChange(arr);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-primary-600 dark:bg-primary-400 text-white text-sm font-semibold mt-2 disabled:opacity-60"
                    disabled={(Array.isArray(field.value) ? field.value.length : 0) >= 4}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (current.length >= 4) return;
                      field.onChange([
                        ...current,
                        {
                          spouseId: "",
                          statusCode: "",
                          startDate: "",
                          endDate: "",
                        },
                      ]);
                    }}
                  >
                    Add Spouse
                  </button>
                </div>
              )}
            />
          </div>
        )}
        {/* Civil Record Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Civil Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-800">
            <Controller
              name="hasNoCivilId"
              control={control}
              render={({ field }) => (
                <div className="flex items-center mb-2">
                  <Checkbox checked={!!field.value} onChange={field.onChange} />
                  <span className="ml-2 text-gray-700 dark:text-gray-200">User has no civil number</span>
                </div>
              )}
            />
            {!hasNoCivilId && (
              <>
                <Controller
                  name="civilFamilyGovernorateId"
                  control={control}
                  render={({ field }) => {
                    const originIdNum = Number(selectedOriginCountryId) || 0;
                    const governorates = ((locationsResp?.data as any)?.governorates ?? []) as any[];
                    const options = governorates
                      .filter((g) => (originIdNum > 0 ? Number(g?.countryId) === originIdNum : true))
                      .map((g) => ({ label: g?.name ?? g?.description ?? String(g?.id), value: String(g?.id) }));
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Governorate</label>
                        <Select
                          options={options}
                          placeholder="Select governorate"
                          defaultValue={field.value ?? ""}
                          onChange={(v) => {
                            field.onChange(v);
                            setValue("civilFamilyDistrictId", "", { shouldDirty: true });
                            setValue("civilFamilyCityId", "", { shouldDirty: true });
                          }}
                        />
                      </div>
                    );
                  }}
                />
                <Controller
                  name="civilFamilyDistrictId"
                  control={control}
                  render={({ field }) => {
                    const govIdNum = Number(selectedCivilGovId) || 0;
                    const districts = ((locationsResp?.data as any)?.districts ?? []) as any[];
                    const options = districts
                      .filter((d) => (govIdNum > 0 ? Number(d?.governorateId) === govIdNum : true))
                      .map((d) => ({ label: d?.name ?? d?.description ?? String(d?.id), value: String(d?.id) }));
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">District</label>
                        <Select
                          options={options}
                          placeholder="Select district"
                          defaultValue={field.value ?? ""}
                          onChange={(v) => {
                            field.onChange(v);
                            setValue("civilFamilyCityId", "", { shouldDirty: true });
                          }}
                        />
                      </div>
                    );
                  }}
                />
                <Controller
                  name="civilFamilyCityId"
                  control={control}
                  render={({ field }) => {
                    const options = (Array.isArray(citiesList) ? citiesList : []).map((c: any) => ({
                      label: c?.name ?? c?.description ?? String(c?.id),
                      value: String(c?.id),
                    }));
                    const disabled = !selectedIso || !(Number(selectedCivilGovId) > 0) || !(Number(selectedCivilDistrictId) > 0);
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">City</label>
                        <Select
                          options={options}
                          placeholder={isFetchingCities ? "Loading cities..." : "Select city"}
                          defaultValue={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={disabled}
                        />
                      </div>
                    );
                  }}
                />
                <Controller
                  name="civilFamilyNumber"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Civil Family Number</label>
                      <Input {...field} value={field.value ?? ""} />
                    </div>
                  )}
                />
              </>
            )}
            <Controller
              name="familyBranchId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Family Branch</label>
                  <Select
                    options={(Array.isArray(familyBranchesList) ? familyBranchesList : []).map((b: any) => ({
                      label: b?.name ?? b?.description ?? String(b?.id),
                      value: String(b?.id),
                    }))}
                    placeholder="Select family branch"
                    defaultValue={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={!selectedIso}
                  />
                </div>
              )}
            />
            <Controller
              name="fatherId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Father ID</label>
                  <UserSearchSelect
                    value={field.value ?? ""}
                    gender={GenderCode.MALE}
                    civilFamilyNumber={civilFamilyNumberValue}
                    initialLabel={initialFatherLabel}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="motherId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Mother ID</label>
                  <UserSearchSelect
                    value={field.value ?? ""}
                    gender={GenderCode.FEMALE}
                    civilFamilyNumber={civilFamilyNumberValue}
                    initialLabel={initialMotherLabel}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold disabled:bg-blue-300 disabled:text-white/70 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageUserEdit;
