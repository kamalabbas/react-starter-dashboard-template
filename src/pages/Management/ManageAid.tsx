import React, { useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import useGetAllAidRequests, { AskForAidItem } from "@/hooks/useGetAllAidRequests";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useApproveAid from "@/hooks/useApproveAid";
import { useToastStore } from "@/stores/toastStore";

const ManageAid: React.FC = () => {
  const { data: aids = [], isLoading, isError } = useGetAllAidRequests();
  const [selected, setSelected] = useState<AskForAidItem | null>(null);
  const [approvingAidId, setApprovingAidId] = useState<number | null>(null);
  const approve = useApproveAid();
  const showToast = useToastStore((s) => s.showToast);

  const columns: Column<AskForAidItem>[] = [
    {
      key: "requester",
      header: "Requester",
      className: "flex items-center gap-3",
      render: (a) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={a.requester.profilePicUrl ?? null} name={a.requester.fullName} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white/90">{a.requester.fullName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{a.requester.civilFamilyNumber ?? "-"}</div>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (a) => a.typeCode ?? "-" },
    { key: "dob", header: "DOB", className: "whitespace-nowrap", render: (a) => a.requester.dateOfBirth ?? "-" },
    { key: "gender", header: "Gender", render: (a) => a.requester.genderDescription ?? "-" },
    { key: "requestedAt", header: "Requested", render: (a) => a.requester.requestedAt ?? "-" },
    { key: "helper", header: "Helper", render: (a) => (a.helper ? a.helper.fullName : "-") },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (a) => (
        <div className="flex items-center gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => setSelected(a)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  const onApprove = async (askForAidId: number) => {
    try {
      setApprovingAidId(askForAidId);
      await approve.mutateAsync({ askForAidId });
      showToast("Aid request approved", "success");
      setSelected(null);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to approve aid", "error");
    } finally {
      setApprovingAidId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Aid Requests</h1>
      </div>

      <div className="mt-6">
        <BasicTable<AskForAidItem>
          columns={columns}
          data={aids}
          isLoading={isLoading}
          isError={isError}
          rowKey={(a) => a.askForAidId}
          emptyMessage="No aid requests found."
        />
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        <div className=" mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <UserAvatar src={selected?.requester.profilePicUrl ?? null} name={selected?.requester.fullName} size="md"/>
                <div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{selected?.requester.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">DOB: {selected?.requester.dateOfBirth ?? "-"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Requested: {selected?.requester.requestedAt ?? "-"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-400">Type</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-100">{selected?.typeCode ?? "-"}</div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-400">Description</div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{selected?.description ?? "-"}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-400 mb-2">Helper</div>
              {selected?.helper ? (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={selected.helper.profilePicUrl ?? null} name={selected.helper.fullName} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selected.helper.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Helped at: {selected.helper.helpedAt ?? "-"}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{selected.helper.statusCode ?? "-"}</div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">No helper assigned.</div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            {!selected?.helper && (
              <Button
                size="sm"
                onClick={() => selected && onApprove(selected.askForAidId)}
                startIcon={approvingAidId === selected?.askForAidId ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : undefined}
                disabled={approvingAidId === selected?.askForAidId}
              >
                {approvingAidId === selected?.askForAidId ? "Approving..." : "Approve"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageAid;
