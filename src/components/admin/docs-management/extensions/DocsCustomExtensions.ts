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

// 3. ADMONITION COLOR PRESETS & SVG ICON BUILDER
export const ADMONITION_COLORS = {
  red: {
    bg: "oklch(0.97 0.05 20)",
    border: "oklch(0.85 0.1 20)",
    text: "oklch(0.4 0.15 20)",
    darkBg: "oklch(0.2 0.05 20)",
    darkBorder: "oklch(0.3 0.1 20)",
    darkText: "oklch(0.85 0.1 20)",
  },
  orange: {
    bg: "oklch(0.97 0.05 45)",
    border: "oklch(0.85 0.1 45)",
    text: "oklch(0.4 0.15 45)",
    darkBg: "oklch(0.2 0.05 45)",
    darkBorder: "oklch(0.3 0.1 45)",
    darkText: "oklch(0.85 0.1 45)",
  },
  yellow: {
    bg: "oklch(0.98 0.05 70)",
    border: "oklch(0.85 0.1 70)",
    text: "oklch(0.4 0.15 70)",
    darkBg: "oklch(0.2 0.05 70)",
    darkBorder: "oklch(0.3 0.1 70)",
    darkText: "oklch(0.85 0.1 70)",
  },
  green: {
    bg: "oklch(0.97 0.05 140)",
    border: "oklch(0.85 0.1 140)",
    text: "oklch(0.4 0.15 140)",
    darkBg: "oklch(0.2 0.05 140)",
    darkBorder: "oklch(0.3 0.1 140)",
    darkText: "oklch(0.85 0.1 140)",
  },
  blue: {
    bg: "oklch(0.97 0.05 250)",
    border: "oklch(0.85 0.1 250)",
    text: "oklch(0.4 0.15 250)",
    darkBg: "oklch(0.2 0.05 250)",
    darkBorder: "oklch(0.3 0.1 250)",
    darkText: "oklch(0.85 0.1 250)",
  },
  purple: {
    bg: "oklch(0.97 0.05 300)",
    border: "oklch(0.85 0.1 300)",
    text: "oklch(0.4 0.15 300)",
    darkBg: "oklch(0.2 0.05 300)",
    darkBorder: "oklch(0.3 0.1 300)",
    darkText: "oklch(0.85 0.1 300)",
  },
  gray: {
    bg: "oklch(0.97 0 0)",
    border: "oklch(0.85 0 0)",
    text: "oklch(0.4 0 0)",
    darkBg: "oklch(0.2 0 0)",
    darkBorder: "oklch(0.3 0 0)",
    darkText: "oklch(0.85 0 0)",
  },
};

export const getIconSvgNode = (iconName: string, color: string) => {
  const strokeColor = color || "currentColor";
  const baseAttrs = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: strokeColor,
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  switch (iconName) {
    case "AlertTriangle":
    case "AlertOctagon":
      return [
        "svg",
        baseAttrs,
        ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }],
        ["path", { d: "M12 9v4" }],
        ["path", { d: "M12 17h.01" }],
      ];
    case "Lightbulb":
    case "Sparkles":
      return [
        "svg",
        baseAttrs,
        ["path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" }],
        ["path", { d: "M9 18h6" }],
        ["path", { d: "M10 22h4" }],
      ];
    case "Info":
    case "HelpCircle":
      return [
        "svg",
        baseAttrs,
        ["circle", { cx: "12", cy: "12", r: "10" }],
        ["path", { d: "M12 16v-4" }],
        ["path", { d: "M12 8h.01" }],
      ];
    case "CheckCircle2":
      return [
        "svg",
        baseAttrs,
        ["circle", { cx: "12", cy: "12", r: "10" }],
        ["path", { d: "m9 12 2 2 4-4" }],
      ];
    case "Code2":
    case "Terminal":
      return [
        "svg",
        baseAttrs,
        ["path", { d: "m18 16 4-4-4-4" }],
        ["path", { d: "m6 8-4 4 4 4" }],
        ["path", { d: "m14.5 4-5 16" }],
      ];
    case "Settings":
    case "Wrench":
      return [
        "svg",
        baseAttrs,
        ["path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" }],
      ];
    case "Database":
    case "Server":
      return [
        "svg",
        baseAttrs,
        ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2" }],
        ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2" }],
        ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }],
        ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18" }],
      ];
    case "BookOpen":
    case "Book":
      return [
        "svg",
        baseAttrs,
        ["path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }],
        ["path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" }],
      ];
    case "FileText":
    case "File":
    default:
      return [
        "svg",
        baseAttrs,
        ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
        ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
        ["path", { d: "M10 9H8" }],
        ["path", { d: "M16 13H8" }],
        ["path", { d: "M16 17H8" }],
      ];
  }
};

// Icon color codes (light and dark mode values)
export const ICON_COLORS = {
  red: "oklch(0.5 0.2 20)",
  orange: "oklch(0.55 0.2 45)",
  yellow: "oklch(0.55 0.18 70)",
  green: "oklch(0.45 0.18 140)",
  blue: "oklch(0.45 0.18 250)",
  purple: "oklch(0.45 0.18 300)",
  gray: "oklch(0.4 0 0)",
};

export const ICON_DARK_COLORS = {
  red: "oklch(0.7 0.15 20)",
  orange: "oklch(0.75 0.15 45)",
  yellow: "oklch(0.75 0.15 70)",
  green: "oklch(0.7 0.15 140)",
  blue: "oklch(0.7 0.15 250)",
  purple: "oklch(0.7 0.15 300)",
  gray: "oklch(0.7 0 0)",
};

// Editable Admonition / Callout Card Node
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
      title: {
        default: "",
      },
      iconName: {
        default: "",
      },
      cardColor: {
        default: "",
      },
      iconColor: {
        default: "",
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
            title: el.getAttribute("data-title") || "",
            iconName: el.getAttribute("data-icon") || "",
            cardColor: el.getAttribute("data-color") || "",
            iconColor: el.getAttribute("data-icon-color") || "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = (node.attrs.type || "warning") as string;
    const title = (node.attrs.title || "") as string;
    const iconName = (node.attrs.iconName || "") as string;
    const cardColor = (node.attrs.cardColor || "") as string;
    const iconColor = (node.attrs.iconColor || "") as string;

    const colorKey = (cardColor || (type === "tip" ? "green" : (type === "info" || type === "note" ? "blue" : "red"))) as keyof typeof ADMONITION_COLORS;
    const colors = ADMONITION_COLORS[colorKey] || ADMONITION_COLORS.yellow;

    const iconColorKey = (iconColor || cardColor || (type === "tip" ? "green" : (type === "info" || type === "note" ? "blue" : "red"))) as keyof typeof ICON_COLORS;
    const lightIcon = ICON_COLORS[iconColorKey] || colors.text;
    const darkIcon = ICON_DARK_COLORS[iconColorKey] || colors.darkText;

    const headerTitle = title || (type === "tip" ? "Tips" : (type === "info" || type === "note" ? "Info" : "Peringatan"));
    const defaultIcon = type === "tip" ? "Lightbulb" : (type === "info" || type === "note" ? "Info" : "AlertTriangle");
    const iconSvg = getIconSvgNode(iconName || defaultIcon, lightIcon);

    const styleVars = `background-color: ${colors.bg}; border-color: ${colors.border}; --adm-bg-light: ${colors.bg}; --adm-border-light: ${colors.border}; --adm-text-light: ${colors.text}; --adm-bg-dark: ${colors.darkBg}; --adm-border-dark: ${colors.darkBorder}; --adm-text-dark: ${colors.darkText}; --adm-icon-light: ${lightIcon}; --adm-icon-dark: ${darkIcon};`;

    const isCustom = Boolean(cardColor) || Boolean(iconColor);

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: `admonition-card ${type} ${isCustom ? "custom-colored" : ""}`,
        "data-type": type,
        "data-title": title,
        "data-icon": iconName,
        "data-color": cardColor,
        "data-icon-color": iconColor,
        style: styleVars,
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
