import { useEffect, useRef, useState } from "react";
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
import usePrivacyPolicyQuery from "@/hooks/usePrivacyPolicyQuery";
import useUpdatePrivacyPolicyMutation from "@/hooks/useUpdatePrivacyPolicyMutation";
import { PrivacyPolicyStatus } from "@/interface/privacyPolicy.interface";
import { useToastStore } from "@/stores/toastStore";

type Loader = {
  file: Promise<File | null>;
};

export default function PrivacyPolicy() {
  const [content, setContent] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PrivacyPolicyStatus>("DRAFT");

  const hasBootstrappedEmptyPage = useRef(false);

  const showToast = useToastStore((s) => s.showToast);
  const { data, isLoading } = usePrivacyPolicyQuery();
  const { updatePrivacyPolicy, uploadPrivacyPolicyMedia, undoPrivacyPolicyDraft } = useUpdatePrivacyPolicyMutation();

  useEffect(() => {
    const page = data?.data?.privacyPolicyPage;

    if (!page && !hasBootstrappedEmptyPage.current && !isLoading) {
      hasBootstrappedEmptyPage.current = true;

      updatePrivacyPolicy.mutate(
        {
          contentHtml: null,
          statusCode: "DRAFT",
        },
        {
          onSuccess: () => {
            showToast("Initial Privacy Policy draft created", "success");
          },
          onError: (error) => {
            showToast(error.message || "Failed to create initial draft", "error");
          },
        }
      );
      return;
    }

    if (!initialized && page) {
      setContent(page.contentHtml ?? "");
      setCurrentStatus(page.statusCode ?? "DRAFT");
      setInitialized(true);
    }
  }, [data, initialized, isLoading, showToast, updatePrivacyPolicy]);

  const saveWithStatus = (statusCode: PrivacyPolicyStatus) => {
    updatePrivacyPolicy.mutate(
      {
        contentHtml: content,
        statusCode,
      },
      {
        onSuccess: () => {
          setCurrentStatus(statusCode);
          showToast(statusCode === "PUBLISHED" ? "Privacy Policy published" : "Privacy Policy draft saved", "success");
        },
        onError: (error) => {
          showToast(error.message || "Failed to save Privacy Policy", "error");
        },
      }
    );
  };

  class PrivacyPolicyUploadAdapter {
    loader: Loader;

    constructor(loader: Loader) {
      this.loader = loader;
    }

    async upload(): Promise<{ default: string }> {
      const file = await this.loader.file;

      if (!file) {
        throw new Error("No file provided");
      }

      const res = await uploadPrivacyPolicyMedia.mutateAsync({
        image: file,
        statusCode: currentStatus,
      });

      return {
        default: res.data?.url || "",
      };
    }

    abort() {}
  }

  const isBusy =
    updatePrivacyPolicy.isPending ||
    undoPrivacyPolicyDraft.isPending ||
    uploadPrivacyPolicyMedia.isPending ||
    isLoading;

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Privacy Policy Page Builder</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowHtml((v) => !v)}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-60"
              disabled={isBusy}
            >
              {showHtml ? "Hide HTML" : "View HTML"}
            </button>

            {/* <button
              onClick={() => saveWithStatus("DRAFT")}
              className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
              disabled={isBusy}
            >
              Save Draft
            </button> */}

            <button
              onClick={() => saveWithStatus("PUBLISHED")}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={isBusy}
            >
              Publish
            </button>

            {/* <button
              onClick={undoDraftChanges}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={isBusy}
            >
              Undo Draft
            </button> */}
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Current status: <span className="font-semibold">{currentStatus}</span>
        </p>

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
              return new PrivacyPolicyUploadAdapter(loader);
            };
          }}
          data={content}
          onChange={(_, editor) => {
            setContent(editor.getData());
          }}
        />

        {showHtml && <textarea value={content} readOnly className="w-full h-60 mt-4 p-3 border rounded bg-gray-100 text-sm" />}
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
