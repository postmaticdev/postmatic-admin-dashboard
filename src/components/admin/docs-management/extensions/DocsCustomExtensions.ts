import { Node, mergeAttributes } from "@tiptap/core";
import { Link } from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AdmonitionCardView } from "./AdmonitionCardView";

// 1. Custom Link extension that preserves inline style and class attributes (so Blue CTA Buttons show styled and editable in editor)
export const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

// 2. Editable Code Snippet Box Node
export const CodeSnippetBoxNode = Node.create({
  name: "codeSnippetBox",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: "TYPESCRIPT",
      },
      filename: {
        default: "welcome.ts",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.code-snippet-box",
        contentElement: "pre code",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const langEl = el.querySelector(".code-lang");
          const fileEl = el.querySelector(".code-filename");
          return {
            language:
              el.getAttribute("data-language") ||
              langEl?.textContent ||
              "TYPESCRIPT",
            filename:
              el.getAttribute("data-filename") ||
              fileEl?.textContent ||
              "welcome.ts",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const language = (node.attrs.language || "TYPESCRIPT").toUpperCase();
    const filename = node.attrs.filename || "welcome.ts";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "code-snippet-box",
        "data-language": language,
        "data-filename": filename,
        style:
          "background: #f8fafc; color: #1e293b; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);",
      }),
      [
        "div",
        {
          class: "code-snippet-header",
          contenteditable: "false",
          style:
            "background: #f8fafc; display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-bottom: 1px solid #e2e8f0; user-select: none;",
        },
        [
          "div",
          { style: "display: flex; align-items: center; gap: 14px;" },
          [
            "span",
            {
              class: "code-filename",
              style:
                "font-size: 13px; color: #64748b; font-weight: 500; font-family: 'Fira Code', Consolas, monospace;",
            },
            filename,
          ],
          [
            "span",
            {
              class: "code-lang",
              style:
                "font-size: 11.5px; color: #3b82f6; font-weight: 700; font-family: 'Fira Code', Consolas, monospace; letter-spacing: 0.05em; text-transform: uppercase;",
            },
            language,
          ],
        ],
        [
          "button",
          {
            type: "button",
            title: "Copy code",
            class: "copy-code-icon-btn",
            style:
              "display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; transition: all 0.2s;",
          },
          [
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              "rect",
              { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" },
            ],
            [
              "path",
              {
                d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
              },
            ],
          ],
        ],
      ],
      [
        "pre",
        {
          style:
            "margin: 0; padding: 20px; overflow-x: auto; line-height: 1.65; font-family: 'Fira Code', Consolas, monospace; font-size: 13.5px; background: #f8fafc; color: #1e293b;",
        },
        ["code", {}, 0],
      ],
    ];
  },
});

// 3. Editable Admonition / Callout Card Node
export const AdmonitionCardNode = Node.create({
  name: "admonitionCard",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "warning",
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdmonitionCardView);
  },

  parseHTML() {
    return [
      {
        tag: "div.admonition-card",
        contentElement: ".adm-content",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          let type = el.getAttribute("data-type") || "warning";
          if (el.classList.contains("caution")) type = "warning";
          if (el.classList.contains("warning")) type = "warning";
          if (el.classList.contains("note")) type = "info";
          if (el.classList.contains("info")) type = "info";
          if (el.classList.contains("tip")) type = "tip";
          return {
            type,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = (node.attrs.type || "warning") as string;

    const warningSvg = [
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        "path",
        {
          d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
        },
      ],
      ["path", { d: "M12 9v4" }],
      ["path", { d: "M12 17h.01" }],
    ];

    const tipSvg = [
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        "path",
        {
          d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
        },
      ],
      ["path", { d: "M9 18h6" }],
      ["path", { d: "M10 22h4" }],
    ];

    const infoSvg = [
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 16v-4" }],
      ["path", { d: "M12 8h.01" }],
    ];

    let headerTitle = "Peringatan";
    let iconSvg: any = warningSvg;
    if (type === "tip") {
      headerTitle = "Tips";
      iconSvg = tipSvg;
    } else if (type === "info" || type === "note") {
      headerTitle = "Info";
      iconSvg = infoSvg;
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: `admonition-card ${type}`,
        "data-type": type,
      }),
      [
        "div",
        {
          class: "adm-header",
          contenteditable: "false",
        },
        ["span", { class: "adm-icon" }, iconSvg],
        ["span", { class: "adm-title" }, headerTitle],
      ],
      ["div", { class: "adm-content" }, 0],
    ];
  },
});

// 4. Custom Video Node (Untuk upload video lokal)
export const CustomVideoNode = Node.create({
  name: "customVideo",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      style: {
        default: "display: block; margin: 18px auto; max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
      }),
    ];
  },
});

export const CustomImageNode = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      style: {
        default: "display: block; margin: 18px auto; max-width: 100%; border-radius: 8px;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

export const CustomYoutubeNode = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      style: {
        default: "display: block; margin: 18px auto; max-width: 100%; border-radius: 8px;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});
