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
  isActive: yup.boolean().required().default(true),
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { id: -1, subject: "", body: "", isActive: true },
  });

  const [saving, setSaving] = React.useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getData<GetAnnouncementsResponse>("/FamilyTreeBe/Announcement/GetAnnouncements");
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
    reset({ id: -1, subject: "", body: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    reset({
      id: a.id,
      subject: a.subject ?? "",
      body: a.body ?? "",
      isActive: !!a.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      await mutation.mutateAsync(data as UpdateAnnouncementRequest);
      showToast("Announcement saved", "success");
      setModalOpen(false);
      setEditing(null);
      reset({ id: -1, subject: "", body: "", isActive: true });
      await fetchAnnouncements();
    } catch (err: any) {
      const msg = err?.message || "Failed to save announcement";
      showToast(msg, "error");
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
        <Button size="sm" onClick={() => openEdit(a)}>
          Edit
        </Button>
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

            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                {...register("isActive")}
                id="isActive"
                className="h-4 w-4 rounded border-gray-200 bg-white dark:bg-white/[0.03]"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
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
    </div>
  );
};

export default CreateAnnouncements;
