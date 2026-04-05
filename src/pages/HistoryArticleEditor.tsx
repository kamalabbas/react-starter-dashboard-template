import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { useToastStore } from "@/stores/toastStore";
import { useUpdateHistoryPage } from "@/hooks/useUpdateHistoryPage";
import { useGetHistoryPages } from "@/hooks/useGetHistoryPages";
import { uploadHistoryMediaFile } from "@/services/historyPageService";

type Loader = {
  file: Promise<File | null>;
};

class Base64UploadAdapter {
  loader: Loader;

  constructor(loader: Loader) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    if (!file) throw new Error("No file provided");
    const base64 = await this.fileToBase64(file);
    return { default: String(base64 || "") };
  }

  abort() {}

  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}

export default function HistoryArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const showToast = useToastStore((s) => s.showToast);
  const { mutateAsync, isLoading } = useUpdateHistoryPage();
  const { pages } = useGetHistoryPages();

  const isCreateMode = id === "new";
  const pageId = Number(id) || 0;

  const [showHtml, setShowHtml] = useState(false);
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [statusCode, setStatusCode] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const currentArticle = useMemo(() => {
    if (isCreateMode) return null;
    return pages.find((a) => a.pageId === pageId) ?? null;
  }, [pageId, isCreateMode, pages]);

  useEffect(() => {
    if (isCreateMode) {
      setTitle("");
      setContentHtml("");
      setStatusCode("DRAFT");
      return;
    }

    if (currentArticle) {
      setTitle(currentArticle.title);
      setContentHtml(currentArticle.contentHtml);
      setStatusCode(currentArticle.statusCode);
    }
  }, [currentArticle, isCreateMode]);

  const saveArticle = async () => {
    const safeTitle = title.trim();
    if (!safeTitle) {
      showToast("Title is required", "error");
      return;
    }

    try {
      await mutateAsync({
        pageId: isCreateMode ? -1 : pageId,
        title: safeTitle,
        contentHtml,
        statusCode,
      });

      navigate("/history-articles");
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const uploadPdf = async (file: File) => {
    if (isCreateMode || !pageId) {
      showToast("Create the history page first, then upload PDF", "error");
      return;
    }

    try {
      setIsUploadingPdf(true);
      const response = await uploadHistoryMediaFile({
        pageId,
        statusCode,
        file,
      });

      const url = response.data?.url;
      if (!url) {
        throw new Error("Upload did not return a file URL");
      }

      const safeName = file.name.replace(/"/g, "&quot;");
      setContentHtml((prev) => `${prev}<p><a href="${url}" target="_blank" rel="noopener noreferrer">${safeName}</a></p>`);
      showToast("PDF uploaded and inserted into content", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload PDF";
      showToast(message, "error");
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  if (!isCreateMode && !currentArticle) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Article not found</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This article may have been removed.</p>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/history-articles")}
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isCreateMode ? "Create History Page" : "Update History Page"}
          </h1>

          <div className="flex gap-2">
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                uploadPdf(file);
              }}
            />

            <button
              onClick={() => setShowHtml((v) => !v)}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {showHtml ? "Hide HTML" : "View HTML"}
            </button>

            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={isLoading || isUploadingPdf}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isUploadingPdf ? "Uploading PDF..." : "Upload PDF"}
            </button>

            <button
              onClick={saveArticle}
              disabled={isLoading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              {isLoading ? "Saving..." : isCreateMode ? "Create" : "Update"}
            </button>

            <button
              onClick={() => navigate("/history-articles")}
              disabled={isLoading}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
            <select
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value as "DRAFT" | "PUBLISHED")}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-gray-100"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div> */}
        </div>

        {/* {thumbnailPreview && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Thumbnail Preview</p>
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-700"
            />
          </div>
        )} */}

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
              return new Base64UploadAdapter(loader);
            };
          }}
          data={contentHtml}
          onChange={(_, editor) => {
            setContentHtml(editor.getData());
          }}
        />

        {showHtml && <textarea value={contentHtml} readOnly className="w-full h-60 mt-4 p-3 border rounded bg-gray-100 text-sm" />}
      </div>

      <style>
        {`
          .ck-editor__editable {
            min-height: 300px;
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
