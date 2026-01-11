import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import useGetBeneficiaries from "@/hooks/useGetBeneficiaries";
import { Beneficiary, Sponsor } from "@/interface/beneficiary.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useApproveSponsor from "@/hooks/useApproveSponsor";
import Switch from "@/components/form/switch/Switch";
import useGetMobileFeatures from "@/hooks/useGetMobileFeatures";
import useUpdateMobileFeatureAccess from "@/hooks/useUpdateMobileFeatureAccess";

import { useToastStore } from "@/stores/toastStore";

const ManageSponsership: React.FC = () => {
  const { data: beneficiaries = [], isLoading, isError } = useGetBeneficiaries();
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [search, setSearch] = useState("");
  const showToast = useToastStore((s) => s.showToast);
  const approve = useApproveSponsor();
  const [approvingSponsorId, setApprovingSponsorId] = useState<number | null>(null);

  const { data: mobileFeatures = [], isLoading: isFeaturesLoading } = useGetMobileFeatures();
  const updateFeatureAccess = useUpdateMobileFeatureAccess();

  const sponsorFeature = mobileFeatures.find((f) => f.code === "SPONSOR");
  const isSponsorEnabled = sponsorFeature ? sponsorFeature.isEnabled : false;

  const getPendingSponsorsCount = (b: Beneficiary) =>
    (b.sponsors ?? []).filter(
      (s) => s.isSponsoring && (s.statusCode ?? "").toUpperCase() !== "ACCEPTED"
    ).length;

  const columns: Column<Beneficiary>[] = [
    {
      key: "name",
      header: "Name",
      className: "flex items-center gap-3",
      render: (b) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={b.profilePicUrl ?? null} name={b.fullName} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white/90">{b.fullName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{b.civilFamilyNumber ?? "-"}</div>
          </div>
        </div>
      ),
    },
    { key: "dob", header: "DOB", className: "whitespace-nowrap", render: (b) => b.dateOfBirth ?? "-" },
    { key: "gender", header: "Gender", render: (b) => b.genderDescription ?? "-" },
    { key: "reason", header: "Reason", render: (b) => b.beneficiaryReason ?? "-" },
    { key: "sponsors", header: "Sponsors", render: (b) => String(b.sponsors?.length ?? 0) },
    {
      key: "pending",
      header: "Pending Sponsors",
      render: (b) => {
        const pending = getPendingSponsorsCount(b);
        if (!pending) {
          return <span className="text-gray-500 dark:text-gray-400">0</span>;
        }
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {pending}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (b) => (
        <div className="flex items-center gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => setSelected(b)}>
            View Sponsors
          </Button>
        </div>
      ),
    },
  ];

  const filteredBeneficiaries = beneficiaries.filter(b => {
    return (
      b.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.civilFamilyNumber ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const onApprove = async (beneficiaryId: number, sponsorId: number) => {
    try {
      setApprovingSponsorId(sponsorId);
      await approve.mutateAsync({ beneficiaryId, sponsorId });
      // Optimistically update selected sponsors in the modal so UI reflects approval immediately
      setSelected((prev) => {
        if (!prev || prev.id !== beneficiaryId) return prev;
        return {
          ...prev,
          sponsors: prev.sponsors?.map((sp) => (sp.id === sponsorId ? { ...sp, statusCode: "ACCEPTED" } : sp)) ?? prev.sponsors,
        };
      });
      showToast("Sponsor approved", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Failed to approve sponsor", "error");
    } finally {
      setApprovingSponsorId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Manage Sponsership
        </h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            placeholder="Search by name or family number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <Switch
            key={`${sponsorFeature?.id ?? "missing"}-${isSponsorEnabled}`}
            label="Enable feature"
            defaultChecked={isSponsorEnabled}
            disabled={!sponsorFeature || isFeaturesLoading || updateFeatureAccess.isPending}
            onChange={async (checked) => {
              if (!sponsorFeature) return;
              try {
                await updateFeatureAccess.mutateAsync({ featureId: sponsorFeature.id, isEnabled: checked });
              } catch (err: any) {
                showToast(err?.message ?? "Failed to update feature", "error");
              }
            }}
          />
        </div>
      </div>
      <div className="mt-6">
        <BasicTable<Beneficiary>
          columns={columns}
          data={filteredBeneficiaries}
          isLoading={isLoading}
          isError={isError}
          rowKey={(b) => b.id}
          emptyMessage="No beneficiaries found."
          pagination={{ initialPage: 1, pageSize: 10 }}
        />
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        <div className="p-6 pt-12 sm:pt-14">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white/90">Sponsors for {selected?.fullName}</h3>

          <div className="space-y-3">
            {selected?.sponsors?.length ? (
              selected.sponsors.map((s: Sponsor) => (
                <div key={s.id} className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={s.profilePicUrl ?? null} name={s.fullName} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white/90">{s.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{s.dateOfBirth ?? "-"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.statusCode ?? "-"}</div>
                    {s.statusCode !== "ACCEPTED" && (
                      <Button
                        size="sm"
                        onClick={() => onApprove(selected.id, s.id)}
                        startIcon={approvingSponsorId === s.id ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        ) : undefined}
                        disabled={approvingSponsorId === s.id}
                      >
                        {approvingSponsorId === s.id ? "Approving..." : "Approve"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">No sponsors found.</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageSponsership;
