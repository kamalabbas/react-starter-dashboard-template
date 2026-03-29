import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import useUsersList from "@/hooks/useUsersList";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import { User } from "@/interface/user.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/stores/toastStore";
import useChangeEmailByAdmin from "@/hooks/useChangeEmailByAdmin";
import { useLookup } from "@/hooks/useLookup";
import { LookupDomain } from "@/interface/enums";
import useGetAllPermissions from "@/hooks/useGetAllPermissions";
import useGetUserPermissions from "@/hooks/useGetUserPermissions";
import useUpdateUserAccess from "@/hooks/useUpdateUserAccess";

const ManageUsers: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsersList();
  const [search, setSearch] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [selectedRoleCode, setSelectedRoleCode] = useState("");
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);

  const showToast = useToastStore((s) => s.showToast);

  const changeEmailMutation = useChangeEmailByAdmin();
  const updateUserAccessMutation = useUpdateUserAccess();
  const { getDomain } = useLookup([LookupDomain.USER_ROLE]);
  const { data: allPermissions = [], isLoading: isLoadingPermissions } = useGetAllPermissions();
  const { data: currentUserPermissionCodes = [] } = useGetUserPermissions();

  const roleOptions = useMemo(
    () =>
      (getDomain(LookupDomain.USER_ROLE) ?? [])
        .map((item: any) => ({
        value: String(item.code ?? item.lookupCode ?? item.value ?? ""),
        label: String(item.description ?? item.label ?? item.name ?? item.displayName ?? item.code ?? ""),
      }))
        .filter((item) => item.value)
        .filter((item) => item.value === "NORMAL_USER" || item.value === "ADMIN_USER"),
    [getDomain]
  );

  const effectiveRoleOptions = useMemo(() => {
    if (roleOptions.length > 0) return roleOptions;
    return [
      { value: "NORMAL_USER", label: "Normal User" },
      { value: "ADMIN_USER", label: "Admin User" },
    ];
  }, [roleOptions]);

  const normalizedPermissionOptions = useMemo(
    () =>
      allPermissions
        .map((item) => ({
          value: String(item.code ?? ""),
          label: String(item.name ?? item.description ?? item.code ?? ""),
          description: String(item.description ?? ""),
        }))
        .filter((item) => item.value),
    [allPermissions]
  );

  const canManageAccess = useMemo(() => {
    if (currentUserPermissionCodes.length === 0) return true;
    return currentUserPermissionCodes.some((code) => /(ACCESS|ROLE|PERMISSION|USER)/i.test(code));
  }, [currentUserPermissionCodes]);

  const filteredUsers = users.filter((u) => {
    const raw = search.trim();
    if (!raw) return true;

    const isNumericQuery = /^\d+$/.test(raw);
    if (isNumericQuery) {
      return String(u.id).includes(raw);
    }
    const q = raw.toLowerCase();

    const profile = u.userProfile;

    const fullName = profile ? `${profile.firstName} ${profile.familyName}` : "";
    return fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      className: "flex items-center gap-3",
      render: (u) => {
        const profile = u.userProfile;
        const fullName = profile ? `${profile.firstName} ${profile.familyName}` : u.email;
        const src = profile?.profilePicUrl ?? null;

        return (
          <div className="flex items-center gap-3">
            <UserAvatar src={src} name={fullName} />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white/90">{fullName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "id",
      header: "ID",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.id}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userProfile?.phoneNumber ?? "-"}</span>,
    },
    {
      key: "dob",
      header: "DOB",
      className: "whitespace-nowrap",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userProfile?.dateOfBirth ?? "-"}</span>,
    },
    {
      key: "gender",
      header: "Gender",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userProfile?.genderDescription ?? "-"}</span>,
    },
    {
      key: "branch",
      header: "Branch",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userProfile?.familyBranch?.name ?? "-"}</span>,
    },
    {
      key: "country",
      header: "Country",
      render: (u) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {u.userProfile?.addressList?.[0]?.countryName ?? u.userProfile?.familyBranch?.countryName ?? "-"}
        </span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userProfile?.addressList?.[0]?.city ?? "-"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{u.statusCode ?? "-"}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userRoleCode ?? "-"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (u) => (
        <>
          <div className="flex gap-2">
            <Link
              to={`/manage-users/${u.id}/edit`}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow flex items-center"
            >
              Edit
            </Link>

            <button
              onClick={() => openEmailModal(u)}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition shadow flex shrink-0"
            >
              Change Email
            </button>

            <button
              onClick={() => openRoleModal(u)}
              className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition shadow flex shrink-0"
              disabled={!canManageAccess || u.userRoleCode === "SUPER_ADMIN"}
              title={u.userRoleCode === "SUPER_ADMIN" ? "Super Admin cannot be edited" : (!canManageAccess ? "You do not have access-management permission" : undefined)}
            >
              Change Role
            </button>
          </div>
        </>
      ),
    },
  ];

  const openEmailModal = (user: User) => {
    setSelectedUser(user);
    setNewEmail(user.email);
    setEmailModalOpen(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleCode(user.userRoleCode === "NORMAL_USER" || user.userRoleCode === "ADMIN_USER" ? user.userRoleCode : "");
    setSelectedPermissionCodes([]);
    setRoleModalOpen(true);
  };

  const togglePermission = (permissionCode: string) => {
    setSelectedPermissionCodes((prev) => {
      if (prev.includes(permissionCode)) {
        return prev.filter((code) => code !== permissionCode);
      }
      return [...prev, permissionCode];
    });
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Manage Users</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              placeholder="Search by ID (numbers) or name/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link
              to="/manage-users/create"
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition shadow"
            >
              Create User
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <BasicTable<User>
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
            isError={isError}
            rowKey={(u) => u.id}
            emptyMessage="No users found."
            pagination={{ initialPage: 1, pageSize: 10 }}
          />
        </div>
      </div>

      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} className="max-w-md">
        <div className="p-6 pt-12 sm:pt-14">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Change Email</h2>

          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100"
          />

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (!selectedUser) return;

                changeEmailMutation.mutate(
                  { userId: selectedUser.id, newEmail },
                  {
                    onSuccess: () => {
                      showToast("Email changed successfully", "success");
                      setEmailModalOpen(false);
                    },
                  },
                );
              }}
              disabled={changeEmailMutation.isPending}
            >
              {changeEmailMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} className="max-w-md">
        <div className="p-6 pt-12 sm:pt-14">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Change User Role</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {selectedUser ? `Update the role for ${selectedUser.email}.` : "Select a role for the user."}
          </p>

          <select
            value={selectedRoleCode}
            onChange={(e) => setSelectedRoleCode(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100"
            disabled={selectedUser?.userRoleCode === "SUPER_ADMIN"}
          >
            <option value="">Select a role</option>
            {effectiveRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</p>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  onClick={() => setSelectedPermissionCodes(normalizedPermissionOptions.map((item) => item.value))}
                  disabled={normalizedPermissionOptions.length === 0 || selectedUser?.userRoleCode === "SUPER_ADMIN"}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-300 disabled:text-gray-400"
                  onClick={() => setSelectedPermissionCodes([])}
                  disabled={selectedPermissionCodes.length === 0 || selectedUser?.userRoleCode === "SUPER_ADMIN"}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2 dark:border-gray-700">
              {isLoadingPermissions ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Loading permissions...</p>
              ) : normalizedPermissionOptions.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">No permission catalog returned from API.</p>
              ) : (
                normalizedPermissionOptions.map((permission) => (
                  <label
                    key={permission.value}
                    className="flex items-start gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissionCodes.includes(permission.value)}
                      onChange={() => togglePermission(permission.value)}
                      disabled={selectedUser?.userRoleCode === "SUPER_ADMIN"}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {permission.label}
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{permission.value}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {selectedUser?.userRoleCode === "SUPER_ADMIN"
              ? "Super Admin cannot be edited."
              : `Your edit permissions loaded: ${currentUserPermissionCodes.length}.`}
          </p>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                if (!selectedUser || !selectedRoleCode) return;
                if (selectedUser.userRoleCode === "SUPER_ADMIN") {
                  showToast("Super Admin cannot be edited", "error");
                  return;
                }
                if (!canManageAccess) {
                  showToast("You do not have permission to update user access", "error");
                  return;
                }

                try {
                  await updateUserAccessMutation.mutateAsync({
                    userId: selectedUser.id,
                    role: selectedRoleCode as "NORMAL_USER" | "ADMIN_USER",
                    permissions: selectedPermissionCodes,
                  });

                  showToast("User access updated successfully", "success");
                  setRoleModalOpen(false);
                } catch (error: any) {
                  showToast(error?.message ?? "Failed to update user access", "error");
                }
              }}
              disabled={!selectedUser || !selectedRoleCode || updateUserAccessMutation.isPending || selectedUser?.userRoleCode === "SUPER_ADMIN" || !canManageAccess}
            >
              {updateUserAccessMutation.isPending ? "Saving..." : "Save Access"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManageUsers;
