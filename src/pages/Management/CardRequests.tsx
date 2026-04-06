import React, { useMemo, useState } from "react";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useAcceptCardRequest from "@/hooks/useAcceptCardRequest";
import useGetPendingCardRequests from "@/hooks/useGetPendingCardRequests";
import useRejectCardRequest from "@/hooks/useRejectCardRequest";
import { CardRequest } from "@/interface/card.interface";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

type CardRequestAction = "ACCEPT" | "REJECT";

const CardRequests: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const adminUserId = useAuthStore((s) => s.user?.id ?? 0);
  const { data: cardRequests = [], isLoading, isError } = useGetPendingCardRequests();
  const acceptMutation = useAcceptCardRequest();
  const rejectMutation = useRejectCardRequest();
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState<{ request: CardRequest; action: CardRequestAction } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return cardRequests;

    return cardRequests.filter((request) => {
      return (
        String(request.fullName ?? "").toLowerCase().includes(query) ||
        String(request.userId).includes(query) ||
        request.purposeCode.toLowerCase().includes(query) ||
        String(request.userEmail ?? "").toLowerCase().includes(query)
      );
    });
  }, [cardRequests, search]);

  const columns: Column<CardRequest>[] = [
    {
      key: "name",
      header: "User",
      className: "flex items-center gap-3",
      render: (request) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={request.profilePicUrl ?? null} name={request.fullName ?? request.userEmail ?? String(request.userId)} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white/90">{request.fullName ?? "Unknown user"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{request.userEmail ?? `User ID: ${request.userId}`}</div>
          </div>
        </div>
      ),
    },
    {
      key: "purposeCode",
      header: "Request Type",
      render: (request) => request.purposeCode,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (request) => request.paymentStatus || "-",
    },
    {
      key: "createdAt",
      header: "Requested",
      render: (request) => (request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"),
    },
    {
      key: "statusCode",
      header: "Status",
      render: (request) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            request.statusCode === "ACCEPTED"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : request.statusCode === "REJECTED"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : request.statusCode === "CANCELED"
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {request.statusCode}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      align: "right",
      render: (request) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={() => {
              setRejectReason("");
              setSelectedAction({ request, action: "ACCEPT" });
            }}
            disabled={request.statusCode !== "REQUESTED"}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-300"
            onClick={() => {
              setRejectReason("");
              setSelectedAction({ request, action: "REJECT" });
            }}
            disabled={request.statusCode !== "REQUESTED"}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const isMutating = acceptMutation.isPending || rejectMutation.isPending;

  const closeModal = () => {
    if (isMutating) return;
    setSelectedAction(null);
    setRejectReason("");
  };

  const confirmAction = async () => {
    if (!selectedAction) return;

    if (!adminUserId) {
      showToast("Unable to identify the current admin user", "error");
      return;
    }

    if (selectedAction.action === "REJECT" && !rejectReason.trim()) {
      showToast("Reject reason is required", "error");
      return;
    }

    try {
      if (selectedAction.action === "ACCEPT") {
        await acceptMutation.mutateAsync({
          adminUserId,
          cardRequestId: selectedAction.request.id,
        });
        showToast("Card request accepted", "success");
      } else {
        await rejectMutation.mutateAsync({
          adminUserId,
          cardRequestId: selectedAction.request.id,
          adminDecisionReason: rejectReason.trim(),
        });
        showToast("Card request rejected", "success");
      }

      closeModal();
    } catch (error: any) {
      showToast(error?.message ?? "Failed to update card request", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Card Requests</h1>
        <input
          type="text"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          placeholder="Search by name, user ID, or card type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <BasicTable<CardRequest>
          columns={columns}
          data={filteredRequests}
          isLoading={isLoading}
          isError={isError}
          rowKey={(request) => request.id}
          emptyMessage="No card requests found."
          pagination={{ initialPage: 1, pageSize: 10 }}
        />
      </div>

      <Modal isOpen={Boolean(selectedAction)} onClose={closeModal}>
        <div className="p-6 pt-12 sm:pt-14">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm {selectedAction?.action === "ACCEPT" ? "acceptance" : "rejection"}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {selectedAction
              ? `Are you sure you want to ${selectedAction.action.toLowerCase()} the ${selectedAction.request.purposeCode.toLowerCase()} request for ${selectedAction.request.fullName ?? "this user"}?`
              : ""}
          </p>

          {selectedAction?.action === "REJECT" && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Reject Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                placeholder="Enter the rejection reason"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={closeModal} disabled={isMutating}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmAction} disabled={isMutating}>
              {isMutating ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CardRequests;