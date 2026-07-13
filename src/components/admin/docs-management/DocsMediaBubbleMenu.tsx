import React from "react";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface DocsMediaBubbleMenuProps {
  editor: Editor;
}

export function DocsMediaBubbleMenu({ editor }: DocsMediaBubbleMenuProps) {
  if (!editor) return null;



  const setMediaStyle = (widthStr: string, alignStr: "left" | "center" | "right") => {
    let styleStr = "";
    if (alignStr === "left") {
      styleStr = "display: block; margin-right: auto; margin-left: 0;";
    } else if (alignStr === "center") {
      styleStr = "display: block; margin-left: auto; margin-right: auto;";
    } else if (alignStr === "right") {
      styleStr = "display: block; margin-left: auto; margin-right: 0;";
    }

    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { width: widthStr, style: styleStr }).run();
    } else if (editor.isActive("customVideo")) {
      editor.chain().focus().updateAttributes("customVideo", { width: widthStr, style: styleStr }).run();
    } else if (editor.isActive("youtube")) {
      editor.chain().focus().updateAttributes("youtube", { width: widthStr, style: styleStr }).run();
    }
  };

  const setWidth = (widthStr: string) => {
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { width: widthStr }).run();
    } else if (editor.isActive("customVideo")) {
      editor.chain().focus().updateAttributes("customVideo", { width: widthStr }).run();
    } else if (editor.isActive("youtube")) {
      editor.chain().focus().updateAttributes("youtube", { width: widthStr }).run();
    }
  };

  const setAlign = (alignStr: "left" | "center" | "right") => {
    // Keep current width if available
    let currentWidth = "100%";
    if (editor.isActive("image")) currentWidth = editor.getAttributes("image").width || "100%";
    else if (editor.isActive("customVideo")) currentWidth = editor.getAttributes("customVideo").width || "100%";
    else if (editor.isActive("youtube")) currentWidth = editor.getAttributes("youtube").width || "100%";

    setMediaStyle(currentWidth, alignStr);
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) =>
        editor.isActive("image") || editor.isActive("customVideo") || editor.isActive("youtube")
      }
    >
      <div className="flex items-center gap-1 bg-background border border-border shadow-md rounded-lg p-1">
        {/* Resize Buttons */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => setWidth("25%")}
            className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded transition-colors"
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => setWidth("50%")}
            className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded transition-colors"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => setWidth("75%")}
            className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded transition-colors"
          >
            75%
          </button>
          <button
            type="button"
            onClick={() => setWidth("100%")}
            className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded transition-colors"
          >
            100%
          </button>
        </div>

        {/* Align Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setAlign("left")}
            className="p-1.5 text-foreground hover:bg-muted rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAlign("center")}
            className="p-1.5 text-foreground hover:bg-muted rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAlign("right")}
            className="p-1.5 text-foreground hover:bg-muted rounded transition-colors"
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </BubbleMenu>
  );
}
