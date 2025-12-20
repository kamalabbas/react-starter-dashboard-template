import React, { useState } from "react";
import { Link } from "react-router";
import useUsersList from "@/hooks/useUsersList";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import { User } from "@/interface/user.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

const ManageUsers: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsersList();
  const [search, setSearch] = useState("");

  // Filter users by name or email
  const filteredUsers = users.filter((u) => {
    const profile = u.userProfile;
    const fullName = profile ? `${profile.firstName} ${profile.familyName}` : "";
    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
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
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (u) => (
        <Link
          to={`/manage-users/${u.id}/edit`}
          className="inline-block px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow"
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Manage Users
        </h1>
        <input
          type="text"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
  );
};

export default ManageUsers;
