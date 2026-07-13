import React from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import * as LucideIcons from "lucide-react";
import { ADMONITION_COLORS, ICON_COLORS, ICON_DARK_COLORS } from "./DocsCustomExtensions";

export const AdmonitionCardView: React.FC<NodeViewProps> = ({ node }) => {
  const type = (node.attrs.type || "warning") as
    | "warning"
    | "caution"
    | "tip"
    | "info"
    | "note";

  const title = (node.attrs.title || "") as string;
  const iconName = (node.attrs.iconName || "") as string;
  const cardColor = (node.attrs.cardColor || "") as string;
  const iconColor = (node.attrs.iconColor || "") as string;

  const colorKey = (cardColor || (type === "tip" ? "green" : (type === "info" || type === "note" ? "blue" : "red"))) as keyof typeof ADMONITION_COLORS;
  const colors = ADMONITION_COLORS[colorKey] || ADMONITION_COLORS.yellow;

  const iconColorKey = (iconColor || cardColor || (type === "tip" ? "green" : (type === "info" || type === "note" ? "blue" : "red"))) as keyof typeof ICON_COLORS;
  const lightIcon = ICON_COLORS[iconColorKey] || colors.text;
  const darkIcon = ICON_DARK_COLORS[iconColorKey] || colors.darkText;

  // Determine title text
  const displayTitle = title || (type === "tip" ? "Tips" : (type === "info" || type === "note" ? "Info" : "Peringatan"));

  // Determine icon component
  const defaultIconName = type === "tip" ? "Lightbulb" : (type === "info" || type === "note" ? "Info" : "AlertTriangle");
  const IconComponent = (LucideIcons as any)[iconName || defaultIconName] || LucideIcons.FileText;

  const isCustom = Boolean(cardColor) || Boolean(iconColor);

  // Generate style variables to pass
  const inlineStyles: React.CSSProperties = {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "16px",
    borderRadius: "8px",
    margin: "1.5rem 0",
    // Also set custom CSS properties so child/dark mode styles can pick it up
    ...({
      "--adm-bg-light": colors.bg,
      "--adm-border-light": colors.border,
      "--adm-text-light": colors.text,
      "--adm-bg-dark": colors.darkBg,
      "--adm-border-dark": colors.darkBorder,
      "--adm-text-dark": colors.darkText,
      "--adm-icon-light": lightIcon,
      "--adm-icon-dark": darkIcon,
    } as any)
  };

  return (
    <NodeViewWrapper
      className={`admonition-card ${type} ${isCustom ? "custom-colored" : ""}`}
      data-type={type}
      data-title={title}
      data-icon={iconName}
      data-color={cardColor}
      data-icon-color={iconColor}
      style={inlineStyles}
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
          color: colors.text,
        }}
      >
        <span
          className="adm-icon flex items-center shrink-0"
          style={{ pointerEvents: "none" }}
        >
          <IconComponent className="h-4.5 w-4.5 shrink-0" style={{ color: "var(--adm-icon-color, var(--adm-text-light))" }} />
        </span>
        <span className="adm-title">{displayTitle}</span>
      </div>
      <NodeViewContent className="adm-content" />
    </NodeViewWrapper>
  );
};
