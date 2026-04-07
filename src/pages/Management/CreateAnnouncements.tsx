import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@/components/ui/button/Button";
import BasicTable, { Column } from "@/components/tables/BasicTables/BasicTable";
import { Modal } from "@/components/ui/modal";
import useUpdateAnnouncement, { UpdateAnnouncementRequest } from "@/hooks/useUpdateAnnouncement";
import { useToastStore } from "@/stores/toastStore";
import { getData } from "@/services/api";
import { AlertIcon } from "@/icons";

type GetAnnouncementsResponse = {
  data?: {
    announcementList?: Announcement[];
  };
};

type Announcement = {
  id: number;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
};

const schema = yup.object({
  // Create uses -1; update uses real id
  id: yup.number().required().default(-1),
  subject: yup.string().required("Subject is required"),
  body: yup.string().required("Body is required"),
});

type FormValues = yup.InferType<typeof schema>;

const CreateAnnouncements: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const mutation = useUpdateAnnouncement();

  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { id: -1, subject: "", body: "" },
  });

  const [saving, setSaving] = React.useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getData<GetAnnouncementsResponse>("/FamilyTreeBe/Announcement/GetAnnouncements?isActive=true");
      setList(res?.data?.announcementList ?? []);
    } catch (err: any) {
      showToast(err?.message ?? "Failed to fetch announcements", "error");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => (a.subject ?? "").toLowerCase().includes(q) || (a.body ?? "").toLowerCase().includes(q));
  }, [list, search]);

  const openCreate = () => {
    setEditing(null);
    reset({ id: -1, subject: "", body: "" });
    setModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    reset({
      id: a.id,
      subject: a.subject ?? "",
      body: a.body ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: UpdateAnnouncementRequest = {
        id: data.id,
        subject: data.subject,
        body: data.body,
        isActive: editing ? !!editing.isActive : true,
      };
      await mutation.mutateAsync(payload);
      showToast("Announcement saved", "success");
      setModalOpen(false);
      setEditing(null);
      reset({ id: -1, subject: "", body: "" });
      await fetchAnnouncements();
    } catch (err: any) {
      const msg = err?.message || "Failed to save announcement";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (a: Announcement) => {
    setDeleteTarget(a);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await mutation.mutateAsync({
        id: deleteTarget.id,
        subject: deleteTarget.subject,
        body: deleteTarget.body,
        isActive: false,
      });
      showToast("Announcement deleted", "success");
      closeDeleteModal();
      await fetchAnnouncements();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Announcement>[] = [
    {
      key: "subject",
      header: "Subject",
      className: "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (a) => <span className="text-gray-800 dark:text-gray-100">{a.subject}</span>,
    },
    {
      key: "body",
      header: "Body",
      className: "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (a) => <span className="text-gray-600 dark:text-gray-300">{a.body}</span>,
    },
    {
      key: "isActive",
      header: "Active",
      className: "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (a) => (
        <span className={a.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
          {a.isActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      className: "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (a) => <span className="text-gray-600 dark:text-gray-300">{a.createdAt}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300",
      render: (a) => (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => openEdit(a)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDeleteModal(a)}
            disabled={saving || mutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Announcements</h1>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>Create Announcement</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or body..."
          className="w-full sm:max-w-sm rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-white/[0.03] dark:border-white/[0.03] dark:text-white/90"
        />
      </div>

      <div className="mt-4">
        <BasicTable columns={columns} data={filtered} isLoading={loading} pagination={{ pageSize: 10 }} />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} showCloseButton={true}>
        <div className="p-6 w-full max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
              {editing ? "Update Announcement" : "Create Announcement"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <input type="hidden" {...register("id")} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <input
                {...register("subject")}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-white/[0.03] dark:border-white/[0.03] dark:text-white/90"
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
              <textarea
                {...register("body")}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-white/[0.03] dark:border-white/[0.03] dark:text-white/90"
              />
              {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting || saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={closeDeleteModal} showCloseButton={true}>
        <div className="p-6 w-full max-w-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/20 dark:text-error-400">
              <AlertIcon />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">Delete Announcement</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                This action will hide the announcement from active listings.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Selected Announcement</p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white/90">{deleteTarget?.subject ?? "-"}</p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{deleteTarget?.body ?? "-"}</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={() => void handleDelete()}
              disabled={saving || mutation.isPending}
              className="bg-error-600 hover:bg-error-700 disabled:bg-error-300"
            >
              {saving ? "Deleting..." : "Yes, Delete"}
            </Button>
            <Button variant="outline" onClick={closeDeleteModal} disabled={saving || mutation.isPending}>
              Keep It
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateAnnouncements;
