import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/stores/toastStore";
import { useGetFamilyBranches } from "@/hooks/useGetFamilyBranches";
import useUpdateFamilyBranch from "@/hooks/useUpdateFamilyBranch";
import { FamilyBranchItem } from "@/services/familyBranchService";
import { BranchCountry } from "@/interface/enums";

const ConfigurationFamilyBranches: React.FC = () => {
  const { data, isLoading } = useGetFamilyBranches("", true);
  const updateBranch = useUpdateFamilyBranch();
  const showToast = useToastStore((s) => s.showToast);

  const branches: FamilyBranchItem[] = data?.data?.familyBranchList ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyBranchItem | null>(null);

  const [form, setForm] = useState({
    id: -1,
    name: "",
    orderId: 1,
    isActive: true,
    countryId: BranchCountry.LB,
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      id: -1,
      name: "",
      orderId: branches.length + 1,
      isActive: true,
      countryId: BranchCountry.LB,
    });
    setModalOpen(true);
  };

  const openEdit = (branch: FamilyBranchItem) => {
    setEditing(branch);
    setForm({
      id: branch.id,
      name: branch.name,
      orderId: branch.orderId,
      isActive: branch.isActive,
      countryId: branch.countryId ? (String(branch.countryId) as BranchCountry) : BranchCountry.LB,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      await updateBranch.mutateAsync({
        id: form.id,
        name: form.name,
        countryId: form.countryId ?? BranchCountry.LB,
        orderId: form.orderId,
        isActive: form.isActive,
      });

      showToast("Saved successfully", "success");
      setModalOpen(false);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to save", "error");
    }
  };

  const columns: Column<FamilyBranchItem>[] = [
    {
      key: "name",
      header: "Branch Name",
      render: (b) => <span className="text-gray-800 dark:text-gray-100 font-medium">{b.name}</span>,
    },
    {
      key: "order",
      header: "Order",
      render: (b) => <span className="text-gray-600 dark:text-gray-300">{b.orderId}</span>,
    },
    {
      key: "country",
      header: "Country",
      render: (b) => <span className="text-gray-600 dark:text-gray-300">{b.countryName}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            b.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {b.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition" onClick={() => openEdit(b)}>
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Family Branches</h1>

      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openAdd}>
          Add Branch
        </Button>
      </div>

      <BasicTable<FamilyBranchItem> columns={columns} data={branches} isLoading={isLoading} rowKey={(r) => r.id} emptyMessage="No branches found" />

      <Modal showCloseButton={false} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-full mx-auto rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? "Edit Branch" : "Add Branch"}</h2>

            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ✕
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="px-6 py-5 space-y-5"
          >
            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Branch Name</label>

              <input
                type="text"
                placeholder="Enter branch name"
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-slate-600 
          bg-white dark:bg-slate-800 
          text-gray-900 dark:text-gray-100 
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sort Order</label>

              <input
                type="number"
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-slate-600 
                bg-white dark:bg-slate-800 
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Country</label>

              <select
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-slate-600 
    bg-white dark:bg-slate-800 
    text-gray-900 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.countryId}
                onChange={(e) => setForm({ ...form, countryId: e.target.value as BranchCountry })}
              >
                <option value={BranchCountry.LB}>Lebanon</option>
                <option value={BranchCountry.SY}>Syria</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />

              <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                disabled={updateBranch.status === "pending"}
              >
                {updateBranch.status === "pending" && (
                  <span className="w-4 h-4 border-2 border-white border-t-blue-300 rounded-full animate-spin"></span>
                )}
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ConfigurationFamilyBranches;
