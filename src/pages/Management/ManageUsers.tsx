import React, { useState } from "react";
import { Link } from "react-router";
import useUsersList from "@/hooks/useUsersList";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import { User } from "@/interface/user.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import { useToastStore } from "@/stores/toastStore";
import useChangeEmailByAdmin from "@/hooks/useChangeEmailByAdmin";

const ManageUsers: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsersList();
  const [search, setSearch] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const showToast = useToastStore((s) => s.showToast);

  const changeEmailMutation = useChangeEmailByAdmin();

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

      {emailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Change Email</h2>

            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEmailModalOpen(false)} className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!selectedUser) return;

                  changeEmailMutation.mutate(
                    { userId: selectedUser.id, newEmail: newEmail },
                    {
                      onSuccess: () => {
                        showToast("Email changed successfully", "success");
                        setEmailModalOpen(false);
                      },
                    },
                  );

                  setEmailModalOpen(false);
                }}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageUsers;
