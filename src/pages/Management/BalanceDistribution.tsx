import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import {
  BalanceFeature,
  DonationAllocation,
  DonationType,
  FitraBalanceCampaign,
  FitraDistributionHistoryItem,
  FitraPaymentBalanceItem,
  SadakaBalanceItem,
  SadakaDistributionHistoryItem,
  UpdateDonationTypePayload,
  ZakatBalanceItem,
  ZakatDistributionHistoryItem,
} from "@/interface/balanceDistribution.interface";
import {
  distributeFitra,
  distributeSadaka,
  distributeZakat,
  getAllBalances,
  getDonationTypes,
  getFitraBalanceDetails,
  getFitraDistributionHistory,
  getSadakaBalanceDetails,
  getSadakaDistributionHistory,
  getZakatBalanceDetails,
  getZakatDistributionHistory,
  updateDonationType,
} from "@/services/balanceDistributionService";
import { useToastStore } from "@/stores/toastStore";

type Section = "overview" | "zakat" | "sadaka" | "fitra" | "donation-types" | "history";
type HistoryTab = "zakat" | "sadaka" | "fitra";

type DistributeTarget = {
  feature: BalanceFeature;
  id: number;
  fullName: string;
  paymentTypeCode: string;
  remainingAmount: number;
};

type DonationDraftRow = {
  id: number;
  donationTypeId: number;
  amount: string;
};

type HistoryRow = {
  id: number;
  payer: string;
  paymentTypeCode: string;
  donationTypeDescription: string | null;
  distributedAmount: number;
  distributedAt: string;
  distributorFullName: string;
};

const formatMoney = (value: number) => `$${Number(value || 0).toFixed(2)}`;
const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const getRemaining = (amount: number, distributedAmount: number) => Math.max(0, Number(amount || 0) - Number(distributedAmount || 0));

export default function BalanceDistribution() {
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [historyTab, setHistoryTab] = useState<HistoryTab>("zakat");
  const [historyPaymentType, setHistoryPaymentType] = useState("");
  const [historyDonationType, setHistoryDonationType] = useState("");
  const [historyPayer, setHistoryPayer] = useState("");
  const [historyDistributor, setHistoryDistributor] = useState("");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");

  const [distributeTarget, setDistributeTarget] = useState<DistributeTarget | null>(null);
  const [donationRows, setDonationRows] = useState<DonationDraftRow[]>([{ id: 1, donationTypeId: 0, amount: "" }]);

  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [editingDonationType, setEditingDonationType] = useState<UpdateDonationTypePayload>({
    id: -1,
    code: "",
    description: "",
    sortOrder: 1,
    isActive: true,
  });

  const overviewQuery = useQuery({
    queryKey: ["balance", "overview"],
    queryFn: getAllBalances,
    select: (response: any) => response.data,
  });

  const donationTypesQuery = useQuery({
    queryKey: ["balance", "donation-types"],
    queryFn: getDonationTypes,
    select: (response: any) => (response.data?.donationTypeList ?? []) as DonationType[],
  });

  const zakatDetailsQuery = useQuery({
    queryKey: ["balance", "zakat-details"],
    queryFn: getZakatBalanceDetails,
    enabled: section === "zakat",
    select: (response: any) => (response.data?.zakatList ?? []) as ZakatBalanceItem[],
  });

  const sadakaDetailsQuery = useQuery({
    queryKey: ["balance", "sadaka-details"],
    queryFn: getSadakaBalanceDetails,
    enabled: section === "sadaka",
    select: (response: any) => (response.data?.sadakaList ?? []) as SadakaBalanceItem[],
  });

  const fitraDetailsQuery = useQuery({
    queryKey: ["balance", "fitra-details"],
    queryFn: getFitraBalanceDetails,
    enabled: section === "fitra",
    select: (response: any) => (response.data?.fitraList ?? []) as FitraBalanceCampaign[],
  });

  const zakatHistoryQuery = useQuery({
    queryKey: ["balance", "history", "zakat"],
    queryFn: getZakatDistributionHistory,
    enabled: section === "history" && historyTab === "zakat",
    select: (response: any) => (response.data?.distributionList ?? []) as ZakatDistributionHistoryItem[],
  });

  const sadakaHistoryQuery = useQuery({
    queryKey: ["balance", "history", "sadaka"],
    queryFn: getSadakaDistributionHistory,
    enabled: section === "history" && historyTab === "sadaka",
    select: (response: any) => (response.data?.distributionList ?? []) as SadakaDistributionHistoryItem[],
  });

  const fitraHistoryQuery = useQuery({
    queryKey: ["balance", "history", "fitra"],
    queryFn: getFitraDistributionHistory,
    enabled: section === "history" && historyTab === "fitra",
    select: (response: any) => (response.data?.distributionList ?? []) as FitraDistributionHistoryItem[],
  });

  const distributeZakatMutation = useMutation({
    mutationFn: distributeZakat,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["balance", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "zakat-details"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "history", "zakat"] }),
      ]);
    },
  });

  const distributeSadakaMutation = useMutation({
    mutationFn: distributeSadaka,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["balance", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "sadaka-details"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "history", "sadaka"] }),
      ]);
    },
  });

  const distributeFitraMutation = useMutation({
    mutationFn: distributeFitra,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["balance", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "fitra-details"] }),
        queryClient.invalidateQueries({ queryKey: ["balance", "history", "fitra"] }),
      ]);
    },
  });

  const updateDonationTypeMutation = useMutation({
    mutationFn: updateDonationType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["balance", "donation-types"] });
    },
  });

  const activeDonationTypes = useMemo(
    () => (donationTypesQuery.data ?? []).filter((item) => item.isActive),
    [donationTypesQuery.data]
  );

  const isDonationTarget = distributeTarget?.paymentTypeCode === "DONATION";

  const filteredZakat = useMemo(() => {
    const items = zakatDetailsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.fullName.toLowerCase().includes(q) || String(item.userId).includes(q));
  }, [search, zakatDetailsQuery.data]);

  const filteredSadaka = useMemo(() => {
    const items = sadakaDetailsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.fullName.toLowerCase().includes(q) || String(item.userId).includes(q));
  }, [search, sadakaDetailsQuery.data]);

  const filteredFitra = useMemo(() => {
    const campaigns = fitraDetailsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;

    return campaigns
      .map((campaign) => ({
        ...campaign,
        fitraPaymentList: campaign.fitraPaymentList.filter((payment) => payment.fullName.toLowerCase().includes(q) || String(payment.userId).includes(q)),
      }))
      .filter((campaign) => campaign.fitraPaymentList.length > 0);
  }, [search, fitraDetailsQuery.data]);

  const historyRows = useMemo((): HistoryRow[] => {
    if (historyTab === "zakat") {
      return (zakatHistoryQuery.data ?? []).map((item) => ({
        id: item.id,
        payer: item.fullName,
        paymentTypeCode: item.paymentTypeCode,
        donationTypeDescription: item.donationTypeDescription,
        distributedAmount: item.distributedAmount,
        distributedAt: item.distributedAt,
        distributorFullName: item.distributorFullName,
      }));
    }

    if (historyTab === "sadaka") {
      return (sadakaHistoryQuery.data ?? []).map((item) => ({
        id: item.id,
        payer: item.fullName,
        paymentTypeCode: item.paymentTypeCode,
        donationTypeDescription: item.donationTypeDescription,
        distributedAmount: item.distributedAmount,
        distributedAt: item.distributedAt,
        distributorFullName: item.distributorFullName,
      }));
    }

    return (fitraHistoryQuery.data ?? []).map((item) => ({
      id: item.id,
      payer: item.fullName,
      paymentTypeCode: item.paymentTypeCode,
      donationTypeDescription: item.donationTypeDescription,
      distributedAmount: item.distributedAmount,
      distributedAt: item.distributedAt,
      distributorFullName: item.distributorFullName,
    }));
  }, [fitraHistoryQuery.data, historyTab, sadakaHistoryQuery.data, zakatHistoryQuery.data]);

  const filteredHistory = useMemo(() => {
    const payer = historyPayer.trim().toLowerCase();
    const distributor = historyDistributor.trim().toLowerCase();

    return historyRows.filter((row) => {
      const distributedAt = new Date(row.distributedAt);
      const fromOk = historyFromDate ? distributedAt >= new Date(`${historyFromDate}T00:00:00`) : true;
      const toOk = historyToDate ? distributedAt <= new Date(`${historyToDate}T23:59:59`) : true;

      return (
        (historyPaymentType ? row.paymentTypeCode === historyPaymentType : true) &&
        (historyDonationType ? (row.donationTypeDescription ?? "") === historyDonationType : true) &&
        (payer ? row.payer.toLowerCase().includes(payer) : true) &&
        (distributor ? row.distributorFullName.toLowerCase().includes(distributor) : true) &&
        fromOk &&
        toOk
      );
    });
  }, [historyDonationType, historyDistributor, historyFromDate, historyPayer, historyPaymentType, historyRows, historyToDate]);

  const openDistributeModal = (target: DistributeTarget) => {
    setDistributeTarget(target);
    setDonationRows([{ id: 1, donationTypeId: 0, amount: "" }]);
  };

  const addDonationRow = () => {
    setDonationRows((prev) => [...prev, { id: Date.now(), donationTypeId: 0, amount: "" }]);
  };

  const removeDonationRow = (id: number) => {
    setDonationRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateDonationRow = (id: number, partial: Partial<DonationDraftRow>) => {
    setDonationRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...partial } : row)));
  };

  const submitDistribution = async () => {
    if (!distributeTarget) return;

    const isDonation = distributeTarget.paymentTypeCode === "DONATION";
    let donationPayload: DonationAllocation[] | null = null;

    if (isDonation) {
      if (donationRows.length === 0) {
        showToast("Add at least one donation allocation", "error");
        return;
      }

      const normalized = donationRows
        .map((row) => ({
          donationTypeId: row.donationTypeId,
          amount: Number(row.amount),
        }))
        .filter((row) => row.donationTypeId > 0 && row.amount > 0);

      if (normalized.length === 0) {
        showToast("Provide valid donation type and amount", "error");
        return;
      }

      const total = normalized.reduce((sum, row) => sum + row.amount, 0);
      if (total > distributeTarget.remainingAmount) {
        showToast("Donation total cannot exceed remaining amount", "error");
        return;
      }

      donationPayload = normalized;
    }

    try {
      if (distributeTarget.feature === "zakat") {
        await distributeZakatMutation.mutateAsync({
          zakatId: distributeTarget.id,
          donation: donationPayload,
        });
      } else if (distributeTarget.feature === "sadaka") {
        await distributeSadakaMutation.mutateAsync({
          sadakaId: distributeTarget.id,
          donation: donationPayload,
        });
      } else {
        await distributeFitraMutation.mutateAsync({
          fitraPaymentId: distributeTarget.id,
          donation: donationPayload,
        });
      }

      showToast("Distribution completed", "success");
      setDistributeTarget(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to distribute";
      showToast(message, "error");
    }
  };

  const saveDonationType = async () => {
    if (!editingDonationType.code.trim() || !editingDonationType.description.trim()) {
      showToast("Code and description are required", "error");
      return;
    }

    try {
      await updateDonationTypeMutation.mutateAsync(editingDonationType);
      showToast(editingDonationType.id === -1 ? "Donation type created" : "Donation type updated", "success");
      setDonationModalOpen(false);
      setEditingDonationType({ id: -1, code: "", description: "", sortOrder: 1, isActive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update donation type";
      showToast(message, "error");
    }
  };

  const paymentTypeOptions = useMemo(() => {
    const rows = historyRows;
    return Array.from(new Set(rows.map((row) => row.paymentTypeCode))).filter(Boolean);
  }, [historyRows]);

  const donationTypeOptions = useMemo(() => {
    const rows = historyRows;
    return Array.from(new Set(rows.map((row) => row.donationTypeDescription ?? ""))).filter(Boolean);
  }, [historyRows]);

  const isDistributing = distributeZakatMutation.isPending || distributeSadakaMutation.isPending || distributeFitraMutation.isPending;

  return (
    <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Balance Distribution</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "overview" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("overview")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Overview</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Cards</div>
        </button>
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "zakat" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("zakat")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Details</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Zakat</div>
        </button>
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "sadaka" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("sadaka")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Details</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Sadaka</div>
        </button>
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "fitra" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("fitra")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Details</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Fitra</div>
        </button>
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "donation-types" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("donation-types")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Admin</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Donation Types</div>
        </button>
        <button
          type="button"
          className={`rounded-xl border p-3 text-left ${section === "history" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
          onClick={() => setSection("history")}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Audit</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">History</div>
        </button>
      </div>

      {section === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Sadaka", value: overviewQuery.data?.sadaka ?? 0, action: () => setSection("sadaka") },
            { label: "Zakat", value: overviewQuery.data?.zakat ?? 0, action: () => setSection("zakat") },
            { label: "Fitra", value: overviewQuery.data?.fitra ?? 0, action: () => setSection("fitra") },
            { label: "Total", value: overviewQuery.data?.total ?? 0, action: () => setSection("overview") },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="rounded-xl border border-gray-200 bg-white p-5 text-left dark:border-gray-800 dark:bg-gray-900"
              onClick={item.action}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">Available Balance</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{formatMoney(item.value)}</div>
              <div className="mt-2 text-xs text-brand-600">Open {item.label} details</div>
            </button>
          ))}
        </div>
      )}

      {(section === "zakat" || section === "sadaka" || section === "fitra") && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {section === "zakat" ? "Zakat Details" : section === "sadaka" ? "Sadaka Details" : "Fitra Details"}
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              placeholder="Search by payer name or user ID..."
            />
          </div>

          {section === "zakat" && (
            <div className="space-y-3">
              {filteredZakat.map((item) => {
                const remaining = getRemaining(item.amount, item.distributedAmount);
                return (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={null} name={item.fullName} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {item.userId} • {item.paymentTypeCode}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          openDistributeModal({
                            feature: "zakat",
                            id: item.id,
                            fullName: item.fullName,
                            paymentTypeCode: item.paymentTypeCode,
                            remainingAmount: remaining,
                          })
                        }
                        disabled={remaining <= 0}
                      >
                        Distribute
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-4">
                      <div>Amount: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(item.amount)}</span></div>
                      <div>Distributed: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(item.distributedAmount)}</span></div>
                      <div>Remaining: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(remaining)}</span></div>
                      <div>Date: <span className="font-medium text-gray-900 dark:text-white">{formatDate(item.paymentDate)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {section === "sadaka" && (
            <div className="space-y-3">
              {filteredSadaka.map((item) => {
                const remaining = getRemaining(item.amount, item.distributedAmount);
                return (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={null} name={item.fullName} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {item.userId} • {item.paymentTypeCode}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          openDistributeModal({
                            feature: "sadaka",
                            id: item.id,
                            fullName: item.fullName,
                            paymentTypeCode: item.paymentTypeCode,
                            remainingAmount: remaining,
                          })
                        }
                        disabled={remaining <= 0}
                      >
                        Distribute
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-4">
                      <div>Amount: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(item.amount)}</span></div>
                      <div>Distributed: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(item.distributedAmount)}</span></div>
                      <div>Remaining: <span className="font-medium text-gray-900 dark:text-white">{formatMoney(remaining)}</span></div>
                      <div>Date: <span className="font-medium text-gray-900 dark:text-white">{formatDate(item.paymentDate)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {section === "fitra" && (
            <div className="space-y-3">
              {filteredFitra.map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
                    <div className="font-medium text-gray-900 dark:text-white">Fitra Campaign #{campaign.id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {campaign.fitraPaymentList.map((payment: FitraPaymentBalanceItem) => {
                      const remaining = getRemaining(payment.amount, payment.distributedAmount);
                      return (
                        <div key={payment.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.fullName}</div>
                            <Button
                              size="sm"
                              onClick={() =>
                                openDistributeModal({
                                  feature: "fitra",
                                  id: payment.id,
                                  fullName: payment.fullName,
                                  paymentTypeCode: payment.paymentTypeCode,
                                  remainingAmount: remaining,
                                })
                              }
                              disabled={remaining <= 0}
                            >
                              Distribute
                            </Button>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-5">
                            <div>Type: {payment.paymentTypeCode}</div>
                            <div>Amount: {formatMoney(payment.amount)}</div>
                            <div>Distributed: {formatMoney(payment.distributedAmount)}</div>
                            <div>Remaining: {formatMoney(remaining)}</div>
                            <div>Date: {formatDate(payment.paymentDate)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "donation-types" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Types</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingDonationType({ id: -1, code: "", description: "", sortOrder: (donationTypesQuery.data?.length ?? 0) + 1, isActive: true });
                setDonationModalOpen(true);
              }}
            >
              Add Donation Type
            </Button>
          </div>

          <div className="space-y-2">
            {(donationTypesQuery.data ?? []).map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{item.code}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{item.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Sort: {item.sortOrder} • {item.isActive ? "Active" : "Inactive"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!item.isEditable}
                      onClick={() => {
                        setEditingDonationType({
                          id: item.id,
                          code: item.code,
                          description: item.description,
                          sortOrder: item.sortOrder,
                          isActive: item.isActive,
                        });
                        setDonationModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!item.isEditable || updateDonationTypeMutation.isPending}
                      onClick={async () => {
                        try {
                          await updateDonationTypeMutation.mutateAsync({
                            id: item.id,
                            code: item.code,
                            description: item.description,
                            sortOrder: item.sortOrder,
                            isActive: !item.isActive,
                          });
                          showToast("Donation type updated", "success");
                        } catch (error) {
                          const message = error instanceof Error ? error.message : "Failed to update donation type";
                          showToast(message, "error");
                        }
                      }}
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "history" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["zakat", "sadaka", "fitra"] as HistoryTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-lg px-3 py-2 text-sm ${historyTab === tab ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                onClick={() => setHistoryTab(tab)}
              >
                {tab.toUpperCase()} History
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <select
              value={historyPaymentType}
              onChange={(e) => setHistoryPaymentType(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">All Payment Types</option>
              {paymentTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={historyDonationType}
              onChange={(e) => setHistoryDonationType(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">All Donation Types</option>
              {donationTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              value={historyPayer}
              onChange={(e) => setHistoryPayer(e.target.value)}
              placeholder="Payer"
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
            <input
              value={historyDistributor}
              onChange={(e) => setHistoryDistributor(e.target.value)}
              placeholder="Distributor"
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
            <input
              type="date"
              value={historyFromDate}
              onChange={(e) => setHistoryFromDate(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="date"
              value={historyToDate}
              onChange={(e) => setHistoryToDate(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            {filteredHistory.map((row) => (
              <div key={`${historyTab}-${row.id}`} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-6">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Payer</div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.payer}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.paymentTypeCode}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Donation</div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.donationTypeDescription ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Distributed</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatMoney(row.distributedAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">By</div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.distributorFullName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">At</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDate(row.distributedAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={Boolean(distributeTarget)} onClose={() => setDistributeTarget(null)} className="max-w-2xl">
        <div className="p-6 pt-12 sm:pt-14">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribute Balance</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {distributeTarget
              ? `${distributeTarget.fullName} • Remaining ${formatMoney(distributeTarget.remainingAmount)} • ${distributeTarget.paymentTypeCode}`
              : ""}
          </p>

          {isDonationTarget ? (
            <div className="mt-4 space-y-3">
              {donationRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2">
                  <select
                    value={row.donationTypeId}
                    onChange={(e) => updateDonationRow(row.id, { donationTypeId: Number(e.target.value) })}
                    className="col-span-6 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value={0}>Select donation type</option>
                    {activeDonationTypes.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.description}</option>
                    ))}
                  </select>
                  <input
                    value={row.amount}
                    onChange={(e) => updateDonationRow(row.id, { amount: e.target.value })}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Amount"
                    className="col-span-4 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    className="col-span-2 rounded border border-red-200 bg-white px-2 py-2 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-red-900/20"
                    onClick={() => removeDonationRow(row.id)}
                    disabled={donationRows.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addDonationRow}>Add Donation Row</Button>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Non-donation payment type. Full remaining amount will be distributed automatically.
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setDistributeTarget(null)} disabled={isDistributing}>Cancel</Button>
            <Button size="sm" onClick={submitDistribution} disabled={isDistributing}>{isDistributing ? "Distributing..." : "Confirm"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} className="max-w-lg">
        <div className="p-6 pt-12 sm:pt-14 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingDonationType.id === -1 ? "Create" : "Edit"} Donation Type</h3>

          <input
            value={editingDonationType.code}
            onChange={(e) => setEditingDonationType((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="Code"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
          />
          <input
            value={editingDonationType.description}
            onChange={(e) => setEditingDonationType((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
          />
          <input
            type="number"
            value={editingDonationType.sortOrder}
            onChange={(e) => setEditingDonationType((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 1 }))}
            placeholder="Sort Order"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={editingDonationType.isActive}
              onChange={(e) => setEditingDonationType((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>

          <div className="mt-4 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setDonationModalOpen(false)} disabled={updateDonationTypeMutation.isPending}>Cancel</Button>
            <Button size="sm" onClick={saveDonationType} disabled={updateDonationTypeMutation.isPending}>
              {updateDonationTypeMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
