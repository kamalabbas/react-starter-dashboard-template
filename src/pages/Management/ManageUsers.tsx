import React from "react";
import { Link } from "react-router";
import useUsersList from "@/hooks/useUsersList";

const ManageUsers: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsersList();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Users</h1>
        <Link to="/manage-users/create" className="btn btn-primary">
          Create User
        </Link>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : isError ? (
          <div className="p-6 text-red-500">Failed to load users.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.userId}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <img src={u.imageUrl || "/images/user/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.dob ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.gender ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/manage-users/${u.userId}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
