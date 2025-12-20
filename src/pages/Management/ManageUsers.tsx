import React from "react";
import { Link } from "react-router";
import useUsersList from "@/hooks/useUsersList";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import { User } from "@/interface/user.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";

const ManageUsers: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsersList();

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      className: "flex items-center gap-3",
      render: (u) => {
        const profile = u.userProfile;
        const fullName = profile ? `${profile.firstName} ${profile.familyName}` : u.email;
        const src = profile?.profilePicUrl ?? null;

        // Local small Image/Placeholder component to avoid layout jumps and not use a default image file
        
        // ... later in render
        // use UserAvatar component instead of inline implementation


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
      key: "role",
      header: "Role",
      render: (u) => <span className="text-sm text-gray-500 dark:text-gray-400">{u.userRoleCode ?? "-"}</span>,
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
        <Link to={`/manage-users/${u.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Manage Users
        </h1>
        {/* <Link to="/manage-users/create" className="btn btn-primary text-gray-800 dark:text-white/90">
          Create User
        </Link> */}
      </div>

      <div className="mt-6">
        <BasicTable<User>
          columns={columns}
          data={users}
          isLoading={isLoading}
          isError={isError}
          rowKey={(u) => u.id}
          emptyMessage="No users found."
          pagination={{ initialPage: 1, pageSize: 15 }}
        />
      </div>
    </div>
  );
};

export default ManageUsers;
