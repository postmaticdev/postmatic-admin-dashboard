export interface DocItem {
  id: string;
  title: string;
  slug: string;
  menuLabel: string;
  categoryId?: string;
  categorySlug?: string;
  description?: string;
  content: string;
  order: number;
  status: "Published" | "Draft";
  updatedAt: string;
  author: string;
  icon?: string;
  createdAt?: string;
}

export type DocsViewMode = "list" | "create" | "edit";
