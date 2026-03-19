import { useState } from "react";
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

export default function AboutUs() {
  const [content, setContent] = useState("");
  const [showHtml, setShowHtml] = useState(false);

  const savePage = () => {
    console.log(content);
  };

  // ✅ IMAGE UPLOAD ADAPTER
  type Loader = {
    file: Promise<File | null>;
  };

  class MyUploadAdapter {
    loader: Loader;

    constructor(loader: Loader) {
      this.loader = loader;
    }

    async upload(): Promise<{ default: string }> {
      const file = await this.loader.file;

      // ✅ handle null safely
      if (!file) {
        throw new Error("No file provided");
      }

      // 🔹 TEMP: base64 (works now)
      const base64 = await this.fileToBase64(file);

      return {
        default: base64 as string,
      };

      // 🔴 LATER: your API
      /*
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("userId", String(userId));

    const res = await postData<FormData, BaseResponse<any>>(
      `/FamilyTreeBe/UploadProfilePicture/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    return {
      default: res.data.url
    };
    */
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

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">About Us Page Builder</h1>

          <div className="flex gap-2">
            <button onClick={() => setShowHtml(!showHtml)} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">
              {showHtml ? "Hide HTML" : "View HTML"}
            </button>

            <button onClick={savePage} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Save Page
            </button>
          </div>
        </div>

        {/* Editor */}
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

              // ✅ REQUIRED ORDER
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

            // ✅ LIMIT CODE BLOCK LANGUAGES HERE
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
              return new MyUploadAdapter(loader);
            };
          }}
          data={content}
          onChange={(event, editor) => {
            setContent(editor.getData());
          }}
        />

        {/* HTML Preview */}
        {showHtml && <textarea value={content} readOnly className="w-full h-60 mt-4 p-3 border rounded bg-gray-100 text-sm" />}
      </div>

      {/* STYLES */}
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
