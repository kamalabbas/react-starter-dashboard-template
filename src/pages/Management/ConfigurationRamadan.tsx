import React, { useEffect, useMemo, useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { getData, postData } from "@/services/apiClient";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { useToastStore } from "@/stores/toastStore";

type FitraPeriod = {
  id: number;
  startDate?: string;
  endDate?: string;
  amount?: number;
  fitraPaymentList?: unknown[];
};

type GetFitraResponse = {
  fitraList: FitraPeriod[];
};

type UpdateFitraPayload = {
  id: number;
  startDate: string;
  endDate: string;
  Amount: number;
};

const isPeriodEnded = (endDate?: string) => {
  if (!endDate) return false;
  const end = new Date(`${endDate}T23:59:59`);
  return end.getTime() < Date.now();
};

const ConfigurationRamadan: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const [periods, setPeriods] = useState<FitraPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FitraPeriod | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{ amount: number; startDate: string; endDate: string }>({
    amount: 0,
    startDate: "",
    endDate: "",
  });

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await getData<BaseResponse<GetFitraResponse>>(
        "/FamilyTreeBe/Fitra/GetFitra"
      );
      setPeriods(res.data?.fitraList ?? []);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to fetch Ramadan periods", "error");
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (p: FitraPeriod) => {
    setEditing(p);
    setForm({
      amount: Number(p.amount ?? 0),
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const onSave = async () => {
    if (!editing) return;

    const payload: UpdateFitraPayload = {
      id: editing.id,
      startDate: form.startDate,
      endDate: form.endDate,
      Amount: Number(form.amount),
    };

    await postData<UpdateFitraPayload, BaseResponse<any>>(
      "/Admin/Fitra/UpdateFitra",
      payload
    );

    showToast("Saved", "success");
    closeModal();
    await fetchPeriods();
  };

  const columns: Column<FitraPeriod>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "whitespace-nowrap",
        render: (p) => String(p.id),
      },
      {
        key: "amount",
        header: "Amount",
        render: (p) => String(p.amount ?? "-"),
      },
      {
        key: "startDate",
        header: "Start Date",
        className: "whitespace-nowrap",
        render: (p) => p.startDate ?? "-",
      },
      {
        key: "endDate",
        header: "End Date",
        className: "whitespace-nowrap",
        render: (p) => p.endDate ?? "-",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        align: "right",
        render: (p) => {
          const ended = isPeriodEnded(p.endDate);
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEdit(p)}
                disabled={ended}
              >
                Edit
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Ramadan Configuration
        </h1>
        <Button variant="outline" onClick={fetchPeriods} disabled={loading}>
          Refresh
        </Button>
      </div>

      <BasicTable<FitraPeriod>
        columns={columns}
        data={periods}
        isLoading={loading}
        rowKey={(p) => p.id}
        emptyMessage="No Ramadan periods found."
        pagination={{ initialPage: 1, pageSize: 10 }}
      />

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Edit Ramadan Period
          </h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                await onSave();
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                ID: {editing?.id ?? "-"}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold disabled:bg-blue-300 disabled:text-white/70 flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
                ) : null}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ConfigurationRamadan;
