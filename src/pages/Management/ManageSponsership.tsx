import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import useGetBeneficiaries from "@/hooks/useGetBeneficiaries";
import { Beneficiary, Sponsor } from "@/interface/beneficiary.interface";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useApproveSponsor from "@/hooks/useApproveSponsor";
import { useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/stores/toastStore";

const ManageSponsership: React.FC = () => {
  const { data: beneficiaries = [], isLoading, isError } = useGetBeneficiaries();
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const showToast = useToastStore((s) => s.showToast);
  const approve = useApproveSponsor();
  const qc = useQueryClient();
  const [approvingSponsorId, setApprovingSponsorId] = useState<number | null>(null);

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

  const onApprove = async (beneficiaryId: number, sponsorId: number) => {
    try {
      await approve.mutateAsync({ beneficiaryId, sponsorId });
      showToast("Sponsor approved", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Failed to approve sponsor", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Sponsorship</h1>
      </div>

      <div className="mt-6">
        <BasicTable<Beneficiary>
          columns={columns}
          data={beneficiaries}
          isLoading={isLoading}
          isError={isError}
          rowKey={(b) => b.id}
          emptyMessage="No beneficiaries found."
        />
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sponsors for {selected?.fullName}</h3>

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
                      <Button size="sm" onClick={() => onApprove(selected.id, s.id)}>Approve</Button>
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
