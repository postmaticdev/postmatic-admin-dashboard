import React from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { AlertTriangle, Lightbulb, Info } from "lucide-react";

export const AdmonitionCardView: React.FC<NodeViewProps> = ({ node }) => {
  const type = (node.attrs.type || "warning") as
    | "warning"
    | "caution"
    | "tip"
    | "info"
    | "note";

  const getConfig = () => {
    switch (type) {
      case "tip":
        return {
          title: "Tips",
          icon: <Lightbulb className="h-4.5 w-4.5 text-amber-500 shrink-0" />,
        };
      case "info":
      case "note":
        return {
          title: "Info",
          icon: <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />,
        };
      case "warning":
      case "caution":
      default:
        return {
          title: "Peringatan",
          icon: <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />,
        };
    }
  };

  const { title, icon } = getConfig();

  return (
    <NodeViewWrapper
      className={`admonition-card ${type}`}
      data-type={type}
    >
      <div
        className="adm-header"
        contentEditable={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
          fontWeight: 600,
          fontSize: "14.5px",
        }}
      >
        <span
          className="adm-icon flex items-center shrink-0"
          style={{ pointerEvents: "none" }}
        >
          {icon}
        </span>
        <span className="adm-title">{title}</span>
      </div>
      <NodeViewContent className="adm-content" />
    </NodeViewWrapper>
  );
};
