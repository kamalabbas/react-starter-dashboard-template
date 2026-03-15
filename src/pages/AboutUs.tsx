import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

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
  Undo
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

export default function AboutUs() {
  const [content, setContent] = useState("");

  const savePage = () => {
    console.log("HTML TO SAVE:");
    console.log(content);

    // send to backend
    // axios.post('/api/about-page', { html: content })
  };

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            About Us Page Builder
          </h1>

          <button
            onClick={savePage}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Page
          </button>
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
              Image,
              ImageToolbar,
              ImageUpload,
              Table,
              TableToolbar,
              MediaEmbed,
              Undo
            ],

            toolbar: [
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
              "redo"
            ],

            image: {
              toolbar: [
                "imageTextAlternative",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side"
              ]
            },

            table: {
              contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells"
              ]
            }
          }}

          data={content}

          onChange={(event, editor) => {
            const data = editor.getData();
            setContent(data);
          }}
        />

      </div>
    </div>
  );
}