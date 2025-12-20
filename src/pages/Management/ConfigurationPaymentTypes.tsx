import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import useGetFitraPaymentTypes from "@/hooks/useGetFitraPaymentTypes";
import useGetPaymentTypes, { PaymentType } from "@/hooks/useGetPaymentTypes";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useUpdateFitraPaymentType from "@/hooks/useUpdateFitraPaymentType";
import useUpdatePaymentType from "@/hooks/useUpdatePaymentType";
import { useToastStore } from "@/stores/toastStore";

const ConfigurationPaymentTypes: React.FC = () => {
  const { data: fitra = [], isLoading: fitraLoading } = useGetFitraPaymentTypes();
  const { data: general = [], isLoading: generalLoading } = useGetPaymentTypes();
  const updateFitra = useUpdateFitraPaymentType();
  const updateGeneral = useUpdatePaymentType();
  const showToast = useToastStore((s) => s.showToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentType | null>(null);
  const [isFitra, setIsFitra] = useState(true);

  const [form, setForm] = useState({
    code: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const openAdd = (fitraMode: boolean) => {
    setIsFitra(fitraMode);
    setEditing(null);
    setForm({
      code: "",
      description: "",
      sortOrder: (fitraMode ? fitra.length : general.length) + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item: PaymentType, fitraMode: boolean) => {
    setIsFitra(fitraMode);
    setEditing(item);
    setForm({
      code: item.code,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      if (isFitra) {
        await updateFitra.mutateAsync({
          id: editing?.id,
          code: form.code,
          description: form.description,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        });
      } else {
        await updateGeneral.mutateAsync({
          id: editing?.id,
          code: form.code,
          description: form.description,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        });
      }
      showToast("Saved", "success");
      setModalOpen(false);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to save", "error");
    }
  };

  const remove = async (item: PaymentType, fitraMode: boolean) => {
    try {
      if (fitraMode) {
        await updateFitra.mutateAsync({
          id: item.id,
          code: item.code,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: false,
        });
      } else {
        await updateGeneral.mutateAsync({
          id: item.id,
          code: item.code,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: false,
        });
      }
      showToast("Removed", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Failed to remove", "error");
    }
  };

  const columns = (fitraMode: boolean): Column<PaymentType>[] => [
    {
      key: "code",
      header: "Code",
      className:
        "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (p) => (
        <span className="text-gray-800 dark:text-gray-100">{p.code}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className:
        "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (p) => (
        <span className="text-gray-600 dark:text-gray-300">{p.description}</span>
      ),
    },
    {
      key: "sortOrder",
      header: "Order",
      className:
        "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (p) => (
        <span className="text-gray-600 dark:text-gray-300">{p.sortOrder}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      className:
        "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            p.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {p.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "px-4 py-2 text-right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition"
            onClick={() => openEdit(p, fitraMode)}
            disabled={!p.isEditable}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-black text-xs font-semibold transition"
            onClick={() => remove(p, fitraMode)}
            disabled={!p.isEditable}
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  const filteredFitra = fitra.filter((item) => item.code !== "RECIPIENTS");
  const filteredGeneral = general.filter((item) => item.code !== "RECIPIENTS");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Payment Types
      </h1>

      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Fitra Payment Types
            </h3>
            <Button size="sm" onClick={() => openAdd(true)}>
              Add
            </Button>
          </div>
          <BasicTable<PaymentType>
            columns={columns(true)}
            data={filteredFitra}
            isLoading={fitraLoading}
            rowKey={(r) => r.id}
            emptyMessage="No types"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              General Payment Types (Zakat / Sadaqah)
            </h3>
            <Button size="sm" onClick={() => openAdd(false)}>
              Add
            </Button>
          </div>
          <BasicTable<PaymentType>
            columns={columns(false)}
            data={filteredGeneral}
            isLoading={generalLoading}
            rowKey={(r) => r.id}
            emptyMessage="No types"
          />
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editing ? "Edit Payment Type" : "Add Payment Type"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                id="active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <label
                htmlFor="active"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold disabled:bg-blue-300 disabled:text-white/70 flex items-center justify-center gap-2"
                disabled={
                  updateFitra.status === "pending" ||
                  updateGeneral.status === "pending"
                }
              >
                {updateFitra.status === "pending" ||
                updateGeneral.status === "pending" ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
                ) : null}
                {updateFitra.status === "pending" ||
                updateGeneral.status === "pending"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ConfigurationPaymentTypes;
