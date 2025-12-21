import React, { useEffect, useState } from "react";
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
import { GenderCode, MaritalStatusCode, VITAL_STATUS } from "@/interface/enums";
import { LookupDomain } from "@/interface/enums";
import { useLookup } from "@/hooks/useLookup";

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

  const genderOptions = getLookupDomain(LookupDomain.GENDER)?.map((c) => ({ label: c.description, value: c.code }));
  const maritalOptions = getLookupDomain(LookupDomain.MARITAL_STATUS)?.map((c) => ({ label: c.description, value: c.code }));
  const vitalStatusOptions = getLookupDomain(LookupDomain.VITAL_STATUS)?.map((c) => ({ label: c.description, value: c.code }));
  const academicLevelOptions = getLookupDomain(LookupDomain.ACADEMIC_LEVEL)?.map((c) => ({ label: c.description, value: c.code }));
  const educationTypeOptions = getLookupDomain(LookupDomain.EDUCATION_TYPE)?.map((c) => ({ label: c.description, value: c.code }));
  const educationStatusOptions = getLookupDomain(LookupDomain.EDUCATION_STATUS)?.map((c) => ({ label: c.description, value: c.code }));
  const employmentStatusOptions = getLookupDomain(LookupDomain.EMPLOYMENT_STATUS)?.map((c) => ({ label: c.description, value: c.code }));
  const instituteLevelOptions = getLookupDomain(LookupDomain.INSTITUTE_LEVEL)?.map((c) => ({ label: c.description, value: c.code }));
  const spouseStatusOptions = getLookupDomain(LookupDomain.MARITAL_STATUS)
    ?.map((c) => ({ label: c.description, value: c.code }))
    .filter((s) => s.value !== "SINGLE");

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

  useEffect(() => {
    if (!id) return;
    const u: User | undefined = users.find((x: any) => String(x.id) === String(id));
    if (u && u.userProfile) {
      const p = u.userProfile;
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
              spouseId: s.spouseId?.toString(),
              statusCode: s.statusCode,
              startDate: s.startDate ? s.startDate.slice(0, 10) : "",
              endDate: s.endDate ? s.endDate.slice(0, 10) : "",
            }))
          : []
      );
      setValue("civilFamilyGovernorateId", p.civilFamily?.civilFamilyGovernorateId?.toString());
      setValue("civilFamilyDistrictId", p.civilFamily?.civilFamilyDistrictId?.toString());
      setValue("civilFamilyCityId", p.civilFamily?.civilFamilyCityId?.toString());
      setValue("civilFamilyNumber", p.civilFamily?.civilFamilyNumber);
      setValue("familyBranchId", p.familyBranch?.id?.toString());
      setValue("fatherId", p.father?.parentId?.toString());
      setValue("motherId", p.mother?.parentId?.toString());
      setProfilePicUrl(p.profilePicUrl || null);
    }
  }, [id, users, setValue]);

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
      await putData(`/FamilyTreeBe/UpdateUser`, { userId: id, ...data });
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
                <Select options={genderOptions} placeholder="Select gender" onChange={field.onChange} defaultValue={field.value} />
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
                <Select options={maritalOptions} placeholder="Select marital status" onChange={field.onChange} defaultValue={field.value} />
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
                <Select options={vitalStatusOptions} placeholder="Select vital status" onChange={field.onChange} defaultValue={field.value} />
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
                          if (isNotWorking(v)) {
                            arr[idx].workplace = "";
                            arr[idx].companyName = "";
                            arr[idx].occupation = "";
                            arr[idx].position = "";
                          } else {
                            arr[idx].reasonNotWorking = "";
                          }
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
                          options={[
                            { value: "LB", label: "Lebanon" },
                            { value: "SY", label: "Syria" },
                          ]}
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
                        <Input
                          value={sp.spouseId || ""}
                          onChange={(e) => {
                            const arr = Array.isArray(field.value) ? [...field.value] : [];
                            arr[idx].spouseId = e.target.value;
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
            <Controller
              name="civilFamilyGovernorateId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Governorate ID</label>
                  <Input {...field} value={field.value ?? ""} />
                </div>
              )}
            />
            <Controller
              name="civilFamilyDistrictId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">District ID</label>
                  <Input {...field} value={field.value ?? ""} />
                </div>
              )}
            />
            <Controller
              name="civilFamilyCityId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">City ID</label>
                  <Input {...field} value={field.value ?? ""} />
                </div>
              )}
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
            <Controller
              name="familyBranchId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Family Branch ID</label>
                  <Input {...field} value={field.value ?? ""} />
                </div>
              )}
            />
            <Controller
              name="fatherId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Father ID</label>
                  <Input {...field} value={field.value ?? ""} />
                </div>
              )}
            />
            <Controller
              name="motherId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Mother ID</label>
                  <Input {...field} value={field.value ?? ""} />
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
