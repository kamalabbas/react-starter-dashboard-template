import { useEffect, useMemo, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ImageResize, ImageStyle, ImageBlock, ImageInline } from "ckeditor5";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Alignment,
  Link,
  List,
  BlockQuote,
  CodeBlock,
  Image,
  ImageToolbar,
  ImageUpload,
  Table,
  TableToolbar,
  MediaEmbed,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import useUsersList from "@/hooks/useUsersList";
import usePendingBiographies from "@/hooks/usePendingBiographies";
import useBiographyForAdmin from "@/hooks/useBiographyForAdmin";
import useBiographyAdminMutations from "@/hooks/useBiographyAdminMutations";
import { BiographyPage, BiographyStatus } from "@/interface/biography.interface";
import { useToastStore } from "@/stores/toastStore";

type Loader = {
  file: Promise<File | null>;
};

type ViewMode = "pending-review" | "all-users";

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const statusClass = (status: BiographyStatus) => {
  if (status === "APPROVED") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (status === "PENDING_APPROVAL") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (status === "DRAFT") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
};

const getEditorSource = (approvedBiography: BiographyPage | null, workingBiography: BiographyPage | null) => {
  return workingBiography?.contentHtml ?? approvedBiography?.contentHtml ?? "";
};

export default function BiographyManagement() {
  const showToast = useToastStore((s) => s.showToast);

  const [viewMode, setViewMode] = useState<ViewMode>("pending-review");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const { data: users = [] } = useUsersList();
  const { data: pendingBiographies = [], isLoading: isPendingLoading } = usePendingBiographies();
  const { data: workspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useBiographyForAdmin(selectedUserId);
  const { updateMutation, approveMutation, rejectMutation, uploadMutation } = useBiographyAdminMutations(selectedUserId);

  const approvedBiography = workspace?.approvedBiography ?? null;
  const workingBiography = workspace?.workingBiography ?? null;

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u.id === selectedUserId) ?? null;
  }, [selectedUserId, users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) => {
      const fullName = `${u.userProfile?.firstName ?? ""} ${u.userProfile?.familyName ?? ""}`.trim().toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const id = String(u.id);
      return fullName.includes(query) || email.includes(query) || id.includes(query);
    });
  }, [search, users]);

  const pendingByUserId = useMemo(() => {
    const map = new Map<number, BiographyPage>();
    pendingBiographies.forEach((item) => {
      map.set(item.userId, item);
    });
    return map;
  }, [pendingBiographies]);

  const userRows = useMemo(() => {
    return filteredUsers.map((u) => {
      const fullName = `${u.userProfile?.firstName ?? ""} ${u.userProfile?.familyName ?? ""}`.trim() || u.email;
      const pending = pendingByUserId.get(u.id) ?? null;
      return {
        id: u.id,
        name: fullName,
        email: u.email,
        avatar: u.userProfile?.profilePicUrl ?? null,
        pending,
      };
    });
  }, [filteredUsers, pendingByUserId]);

  const pendingUserRows = useMemo(() => userRows.filter((user) => Boolean(user.pending)), [userRows]);

  const visibleUserRows = useMemo(() => {
    if (viewMode === "pending-review") return pendingUserRows;
    return userRows;
  }, [pendingUserRows, userRows, viewMode]);

  const selectedPendingIndex = useMemo(() => {
    if (!selectedUserId) return -1;
    return pendingUserRows.findIndex((user) => user.id === selectedUserId);
  }, [pendingUserRows, selectedUserId]);

  const isSelectedUserPending = selectedPendingIndex >= 0;

  useEffect(() => {
    if (pendingUserRows.length === 0 && viewMode === "pending-review") {
      setViewMode("all-users");
    }
  }, [pendingUserRows.length, viewMode]);

  useEffect(() => {
    if (visibleUserRows.length === 0) {
      setSelectedUserId(null);
      return;
    }

    const stillVisible = selectedUserId !== null && visibleUserRows.some((user) => user.id === selectedUserId);
    if (!stillVisible) {
      setSelectedUserId(visibleUserRows[0].id);
    }
  }, [selectedUserId, visibleUserRows]);

  useEffect(() => {
    if (!selectedUserId) {
      setEditorHtml("");
      return;
    }

    setEditorHtml(getEditorSource(approvedBiography, workingBiography));
  }, [selectedUserId, approvedBiography, workingBiography]);

  const activeStatus = (workingBiography?.statusCode ?? approvedBiography?.statusCode ?? null) as BiographyStatus | null;
  const canApprove = workingBiography?.statusCode === "PENDING_APPROVAL";
  const canReject = workingBiography?.statusCode === "PENDING_APPROVAL";
  const canUpdateBiography = selectedUserId !== null;
  const canUpload = selectedUserId !== null;

  const uploadStatus = workingBiography?.statusCode === "PENDING_APPROVAL" ? "PENDING_APPROVAL" : "APPROVED";

  const isBusy =
    updateMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    uploadMutation.isPending ||
    isWorkspaceLoading;

  const selectNextPending = () => {
    if (pendingUserRows.length === 0) return;

    if (!selectedUserId) {
      setSelectedUserId(pendingUserRows[0].id);
      return;
    }

    const currentIndex = pendingUserRows.findIndex((user) => user.id === selectedUserId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % pendingUserRows.length : 0;
    setSelectedUserId(pendingUserRows[nextIndex].id);
  };

  const updateBiography = async () => {
    if (!selectedUserId) return;

    try {
      await updateMutation.mutateAsync({
        userId: selectedUserId,
        contentHtml: editorHtml,
        statusCode: "APPROVED",
      });
      showToast("Biography updated", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update biography";
      showToast(message, "error");
    }
  };

  const approve = async () => {
    if (!selectedUserId) return;

    try {
      await approveMutation.mutateAsync({ userId: selectedUserId });
      showToast("Biography approved", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve biography";
      showToast(message, "error");
    }
  };

  const submitReject = async () => {
    if (!selectedUserId) return;

    if (!rejectReason.trim()) {
      showToast("Reject reason is required", "error");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        userId: selectedUserId,
        rejectionReason: rejectReason.trim(),
      });
      showToast("Biography rejected and returned as draft", "success");
      setIsRejectModalOpen(false);
      setRejectReason("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reject biography";
      showToast(message, "error");
    }
  };

  const uploadBiographyPdf = async (file: File) => {
    if (!selectedUserId) {
      showToast("Select a user first", "error");
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync({
        userId: selectedUserId,
        statusCode: uploadStatus,
        image: file,
      });

      const url = response.data?.url;
      if (!url) {
        throw new Error("Upload did not return a file URL");
      }

      const safeName = file.name.replace(/"/g, "&quot;");
      setEditorHtml((prev) => `${prev}<p><a href="${url}" target="_blank" rel="noopener noreferrer">${safeName}</a></p>`);
      showToast("PDF uploaded and inserted into content", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload PDF";
      showToast(message, "error");
    } finally {
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  class BiographyAdminUploadAdapter {
    loader: Loader;

    constructor(loader: Loader) {
      this.loader = loader;
    }

    async upload(): Promise<{ default: string }> {
      if (!selectedUserId) {
        throw new Error("Select a user first");
      }

      const file = await this.loader.file;
      if (!file) throw new Error("No file provided");

      const response = await uploadMutation.mutateAsync({
        userId: selectedUserId,
        statusCode: uploadStatus,
        image: file,
      });

      return {
        default: response.data?.url ?? "",
      };
    }

    abort() {}
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Biography Management</h1>
          <div className="mt-2 inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("pending-review")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "pending-review"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
              }`}
              disabled={pendingUserRows.length === 0}
            >
              Review Pending ({pendingUserRows.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all-users")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "all-users"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
              }`}
            >
              Create or Edit For Any User
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {viewMode === "pending-review" ? "Checking and submitting pending biographies" : "Create or update biography for a selected user"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Users</h2>

          {pendingUserRows.length > 0 && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-medium text-amber-800 dark:text-amber-300">Pending queue</div>
                <Button size="sm" variant="outline" onClick={selectNextPending} disabled={isBusy || pendingUserRows.length < 2}>
                  Next Pending
                </Button>
              </div>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {pendingUserRows.map((user) => {
                  const isActive = selectedUserId === user.id;
                  return (
                    <button
                      key={`pending-${user.id}`}
                      type="button"
                      onClick={() => {
                        setViewMode("pending-review");
                        setSelectedUserId(user.id);
                      }}
                      className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                        isActive
                          ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : "border-amber-200 bg-white text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-900/20"
                      }`}
                    >
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={viewMode === "pending-review" ? "Search pending users by name, email, ID..." : "Search all users by name, email, ID..."}
            className="mb-3 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
          />

          <div className="mb-3 rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700">
            <div className="text-gray-600 dark:text-gray-300">Pending biographies</div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{pendingBiographies.length}</div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {viewMode === "pending-review" ? "Showing pending users only" : "Showing all users (pending marked)"}
            </div>
          </div>

          <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {visibleUserRows.map((user) => {
              const isActive = selectedUserId === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">User ID: {user.id}</span>
                    {user.pending && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Pending
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {!isPendingLoading && visibleUserRows.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {viewMode === "pending-review" ? "No pending biographies found for this search." : "No users found."}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
          {selectedUserId === null ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Select a user to open biography workspace.
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser
                      ? `${selectedUser.userProfile?.firstName ?? ""} ${selectedUser.userProfile?.familyName ?? ""}`.trim() || selectedUser.email
                      : `User #${selectedUserId}`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {selectedUserId}</div>
                </div>

                <div className="flex items-center gap-2">
                  {viewMode === "pending-review" && (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${isSelectedUserPending ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"}`}>
                      {isSelectedUserPending && pendingUserRows.length > 0
                        ? `Pending ${selectedPendingIndex + 1} of ${pendingUserRows.length}`
                        : "Not Pending"}
                    </span>
                  )}
                  {activeStatus && (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(activeStatus)}`}>
                      {activeStatus}
                    </span>
                  )}
                  {approvedBiography && (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Has Approved
                    </span>
                  )}
                  {workingBiography && (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Has Working
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-slate-800/40 sm:grid-cols-4">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Submitted</div>
                  <div className="mt-1 text-gray-900 dark:text-white">{formatDate(workingBiography?.submittedAt ?? null)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Decision At</div>
                  <div className="mt-1 text-gray-900 dark:text-white">{formatDate(workingBiography?.adminDecisionAt ?? approvedBiography?.adminDecisionAt ?? null)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Updated</div>
                  <div className="mt-1 text-gray-900 dark:text-white">{formatDate(workingBiography?.updatedAt ?? approvedBiography?.updatedAt ?? null)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Rejection Reason</div>
                  <div className="mt-1 text-gray-900 dark:text-white line-clamp-2">{workingBiography?.rejectionReason ?? approvedBiography?.rejectionReason ?? "-"}</div>
                </div>
              </div>

              {isWorkspaceError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                  Failed to load biography workspace for this user.
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadBiographyPdf(file);
                  }}
                />

                <Button size="sm" variant="outline" onClick={() => setShowHtml((v) => !v)} disabled={isBusy}>
                  {showHtml ? "Hide HTML" : "View HTML"}
                </Button>

                <Button size="sm" variant="outline" onClick={() => pdfInputRef.current?.click()} disabled={!canUpload || isBusy}>
                  Upload PDF
                </Button>

                <Button size="sm" onClick={approve} disabled={!canApprove || isBusy}>
                  Approve
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-300"
                  onClick={() => {
                    setRejectReason("");
                    setIsRejectModalOpen(true);
                  }}
                  disabled={!canReject || isBusy}
                >
                  Reject
                </Button>

                <Button size="sm" onClick={updateBiography} disabled={!canUpdateBiography || isBusy}>
                  Update Biography
                </Button>

                {viewMode === "pending-review" && (
                  <Button size="sm" variant="outline" onClick={selectNextPending} disabled={isBusy || pendingUserRows.length < 2}>
                    Next Pending
                  </Button>
                )}

                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload image/PDF: {canUpload ? "Enabled" : "Disabled"}
                </span>
              </div>

              <CKEditor
                editor={ClassicEditor}
                config={{
                  licenseKey: "GPL",
                  plugins: [
                    Essentials,
                    Paragraph,
                    Heading,
                    Bold,
                    Italic,
                    Underline,
                    Strikethrough,
                    FontSize,
                    FontFamily,
                    FontColor,
                    FontBackgroundColor,
                    Alignment,
                    Link,
                    List,
                    BlockQuote,
                    CodeBlock,
                    Image,
                    ImageBlock,
                    ImageInline,
                    ImageToolbar,
                    ImageUpload,
                    ImageResize,
                    ImageStyle,
                    Table,
                    TableToolbar,
                    MediaEmbed,
                    Undo,
                  ],
                  image: {
                    toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "resizeImage"],
                  },
                  toolbar: {
                    items: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "fontSize",
                      "fontFamily",
                      "fontColor",
                      "fontBackgroundColor",
                      "|",
                      "alignment",
                      "|",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "link",
                      "blockQuote",
                      "codeBlock",
                      "|",
                      "insertTable",
                      "uploadImage",
                      "mediaEmbed",
                      "|",
                      "undo",
                      "redo",
                    ],
                    shouldNotGroupWhenFull: true,
                  },
                  codeBlock: {
                    languages: [
                      { language: "html", label: "HTML" },
                      { language: "css", label: "CSS" },
                    ],
                  },
                  htmlSupport: {
                    allow: [
                      {
                        name: /.*/,
                        attributes: true,
                        classes: true,
                        styles: true,
                      },
                    ],
                  },
                  heading: {
                    options: [
                      {
                        model: "paragraph",
                        title: "Paragraph",
                        class: "ck-heading_paragraph",
                      },
                      {
                        model: "heading1",
                        view: "h1",
                        title: "Heading 1",
                        class: "ck-heading_heading1",
                      },
                      {
                        model: "heading2",
                        view: "h2",
                        title: "Heading 2",
                        class: "ck-heading_heading2",
                      },
                      {
                        model: "heading3",
                        view: "h3",
                        title: "Heading 3",
                        class: "ck-heading_heading3",
                      },
                    ],
                  },
                }}
                onReady={(editor) => {
                  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
                    if (!canUpload) {
                      throw new Error("Select a user first");
                    }
                    return new BiographyAdminUploadAdapter(loader);
                  };
                }}
                data={editorHtml}
                onChange={(_, editor) => {
                  setEditorHtml(editor.getData());
                }}
                disabled={isBusy}
              />

              {showHtml && <textarea value={editorHtml} readOnly className="mt-4 h-56 w-full rounded border bg-gray-100 p-3 text-sm dark:bg-slate-800" />}
            </>
          )}
        </section>
      </div>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} className="max-w-lg">
        <div className="p-6 pt-12 sm:pt-14">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Biography</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Provide a rejection reason for user #{selectedUserId ?? "-"}.</p>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
              placeholder="Write the reason"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={submitReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Saving..." : "Confirm Reject"}
            </Button>
          </div>
        </div>
      </Modal>

      <style>
        {`
          .ck-editor__editable {
            min-height: 320px;
          }

          .ck-content h1 { font-size: 32px; font-weight: bold; margin: 16px 0; }
          .ck-content h2 { font-size: 26px; font-weight: bold; margin: 14px 0; }
          .ck-content h3 { font-size: 22px; font-weight: bold; margin: 12px 0; }

          .ck-content table {
            border-collapse: collapse;
            width: 100%;
          }

          .ck-content td, .ck-content th {
            border: 1px solid #ccc;
            padding: 8px;
          }

          .ck-content pre {
            background: #1e293b;
            color: white;
            padding: 10px;
            border-radius: 6px;
          }
        `}
      </style>
    </div>
  );
}
