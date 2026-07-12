export interface DocItem {
  id: string;
  title: string;
  slug: string;
  menuLabel: string;
  description?: string;
  content: string;
  order: number;
  status: "Published" | "Draft";
  updatedAt: string;
  author: string;
  icon?: string;
}

export type DocsViewMode = "list" | "create" | "edit";
