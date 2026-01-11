import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import useGetAllZakat, { ZakatItem } from "@/hooks/useGetAllZakat";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useUpdateZakatStatus from "@/hooks/useUpdateZakatStatus";
import { useToastStore } from "@/stores/toastStore";
import Switch from "@/components/form/switch/Switch";
import useGetMobileFeatures from "@/hooks/useGetMobileFeatures";
import useUpdateMobileFeatureAccess from "@/hooks/useUpdateMobileFeatureAccess";

const ManageZakat: React.FC = () => {
  const { data: zakat = [], isLoading, isError } = useGetAllZakat();
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const update = useUpdateZakatStatus();
  const showToast = useToastStore((s) => s.showToast);
  const [recipients, setRecipients] = useState<ZakatItem["zakatRecipientList"] | null>(null);

  const { data: mobileFeatures = [], isLoading: isFeaturesLoading } = useGetMobileFeatures();
  const updateFeatureAccess = useUpdateMobileFeatureAccess();

  const zakatFeature = mobileFeatures.find((f) => f.code === "ZAKAT");
  const isZakatEnabled = zakatFeature ? zakatFeature.isEnabled : false;

  const filteredZakat = zakat.filter(s => {
    return (
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.userId).toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns: Column<ZakatItem>[] = [
    {
      key: "name",
      header: "Name",
      className: "flex items-center gap-3",
      render: (s) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={null} name={s.fullName} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white/90">{s.fullName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {s.userId}</div>
          </div>
        </div>
      ),
    },
    { key: "year", header: "Year", render: (s) => s.year ?? "-" },
    { key: "amount", header: "Amount", render: (s) => `$${Number(s.amount).toFixed(2)}` },
    {
      key: "type",
      header: "Type",
      render: (s) =>
        s.paymentTypeCode === "RECIPIENTS" ? (
          <button className="text-sm text-blue-600 hover:underline" onClick={() => setRecipients(s.zakatRecipientList ?? [])}>
            RECIPIENTS
          </button>
        ) : (
          s.paymentTypeCode ?? "-"
        ),
    },
    { key: "date", header: "Date", render: (s) => s.paymentDate ?? "-" },
    { key: "status", header: "Status", render: (s) => s.paymentStatus ?? "-" },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (s) => (
        <div className="flex items-center gap-2 justify-end">
          {s.paymentStatus !== "PAID" && (
            <Button size="sm" onClick={() => setConfirmingId(s.id)} disabled={approvingId === s.id}>
              {approvingId === s.id ? "Processing..." : "Approve"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Manage Zakat
        </h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            placeholder="Search by name or user ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <Switch
            key={`${zakatFeature?.id ?? "missing"}-${isZakatEnabled}`}
            label="Enable feature"
            defaultChecked={isZakatEnabled}
            disabled={!zakatFeature || isFeaturesLoading || updateFeatureAccess.isPending}
            onChange={async (checked) => {
              if (!zakatFeature) return;
              try {
                await updateFeatureAccess.mutateAsync({ featureId: zakatFeature.id, isEnabled: checked });
              } catch (err: any) {
                showToast(err?.message ?? "Failed to update feature", "error");
              }
            }}
          />
        </div>
      </div>
      <div className="mt-6">
        <BasicTable<ZakatItem>
          columns={columns}
          data={filteredZakat}
          isLoading={isLoading}
          isError={isError}
          rowKey={(s) => s.id}
          emptyMessage="No zakat payments found."
          pagination={{ initialPage: 1, pageSize: 10 }}
        />
      </div>

      <Modal isOpen={Boolean(confirmingId)} onClose={() => setConfirmingId(null)}>
        <div className=" mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm approval</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to mark this payment as PAID? This action can be reverted only from the backend.</p>

            <div className="mt-6 flex gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!confirmingId) return;
                  try {
                    setApprovingId(confirmingId);
                    await update.mutateAsync({ zakatId: confirmingId, paymentStatus: "PAID" });
                    showToast("Marked as PAID", "success");
                    setConfirmingId(null);
                  } catch (err: any) {
                    showToast(err?.message ?? "Failed to update status", "error");
                  } finally {
                    setApprovingId(null);
                  }
                }}
                disabled={approvingId === confirmingId}
              >
                {approvingId === confirmingId ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(recipients)} onClose={() => setRecipients(null)}>
        <div className="p-4">
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
            {recipients && recipients.length > 0 ? (
              recipients.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <UserAvatar src={null} name={r.recipientFullName} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{r.recipientFullName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {r.recipientUserId}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recipients found.</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <Button size="sm" variant="outline" onClick={() => setRecipients(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageZakat;

