import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@/components/ui/button/Button";
import useUpdateAnnouncement, { UpdateAnnouncementRequest } from "@/hooks/useUpdateAnnouncement";
import { useToastStore } from "@/stores/toastStore";

const schema = yup.object({
  id: yup.number().required().default(-1),
  subject: yup.string().required("Subject is required"),
  body: yup.string().required("Body is required"),
  isActive: yup.boolean().required().default(true),
});

type FormValues = yup.InferType<typeof schema>;

const CreateAnnouncements: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const mutation = useUpdateAnnouncement();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { id: -1, subject: "", body: "", isActive: true },
  });

  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      await mutation.mutateAsync(data as UpdateAnnouncementRequest);
      showToast("Announcement saved", "success");
      reset({ id: -1, subject: "", body: "", isActive: true });
    } catch (err: any) {
      const msg = err?.message || "Failed to save announcement";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Create Announcement</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-3xl">
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
          <input type="checkbox" {...register("isActive")} id="isActive" className="h-4 w-4 rounded border-gray-200 bg-white dark:bg-white/[0.03]" />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || saving}>Save</Button>
          <Button variant="outline" onClick={() => reset()}>Reset</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncements;
