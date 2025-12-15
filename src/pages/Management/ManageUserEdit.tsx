import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useUsersList from "@/hooks/useUsersList";
import { useToastStore } from "@/stores/toastStore";
import { postData, putData } from "@/services/api";

const ManageUserEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsersList();
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState({ fullName: "", dob: "", gender: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const u = users.find((x: any) => String(x.userId) === String(id));
    if (u) setForm({ fullName: u.fullName ?? "", dob: u.dob ?? "", gender: String(u.gender ?? "") });
  }, [id, users]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Attempt to call update endpoint; if id exists use put, else create
      if (id) {
        await putData(`/FamilyTreeBe/UpdateUser`, { userId: id, ...form });
      } else {
        await postData(`/FamilyTreeBe/CreateUser`, form);
      }
      showToast("Saved successfully", "success");
      navigate("/manage-users");
    } catch (err) {
      console.error(err);
      showToast("Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">{id ? "Edit User" : "Create User"}</h2>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input name="fullName" value={form.fullName} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of birth</label>
          <input name="dob" type="date" value={form.dob} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select name="gender" value={form.gender} onChange={onChange} className="mt-1 block w-full border rounded p-2">
            <option value="">Select</option>
            <option value="1">Male</option>
            <option value="2">Female</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ManageUserEdit;
