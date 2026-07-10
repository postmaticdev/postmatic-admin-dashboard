import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sortValue?: (row: T) => string | number | boolean | null;
}

function extractTextFromReactNode(node: any): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join(" ");
  }
  if (typeof node === "object" && node.props) {
    const parts: string[] = [];
    if (node.props.name) parts.push(String(node.props.name));
    if (node.props.email) parts.push(String(node.props.email));
    if (node.props.title) parts.push(String(node.props.title));
    if (node.props.value) parts.push(String(node.props.value));
    if (node.props.status) parts.push(String(node.props.status));
    if (node.props.label) parts.push(String(node.props.label));
    if (node.props.children) parts.push(extractTextFromReactNode(node.props.children));
    return parts.join(" ").trim();
  }
  return "";
}

function getSortValue(row: any, col: Column<any>): string | number {
  if (col.sortValue) {
    const val = col.sortValue(row);
    if (val !== undefined && val !== null) return val as string | number;
  }

  if (row === null || row === undefined || typeof row !== "object") return "";

  // 1. Check direct key match
  if (col.key in row && row[col.key] !== undefined && row[col.key] !== null) {
    const val = row[col.key];
    if (typeof val === "number" || typeof val === "string" || typeof val === "boolean") {
      return typeof val === "boolean" ? (val ? 1 : 0) : val;
    }
  }

  // 2. Check common header mapping to properties
  const headerLower = col.header.toLowerCase();
  const keyLower = col.key.toLowerCase();

  // Numeric checks first so numbers sort numerically!
  if (headerLower.includes("balance") || headerLower.includes("saldo") || keyLower.includes("balance") || keyLower === "bal") {
    if (typeof row.balance === "number") return row.balance;
  }
  if (
    headerLower.includes("amount") ||
    headerLower.includes("nominal") ||
    headerLower.includes("harga") ||
    headerLower.includes("price") ||
    headerLower.includes("total") ||
    headerLower.includes("potongan") ||
    headerLower.includes("biaya") ||
    headerLower.includes("admin")
  ) {
    if (typeof row.amount === "number") return row.amount;
    if (typeof row.price === "number") return row.price;
    if (typeof row.adminFee === "number") return row.adminFee;
    if (typeof row.total === "number") return row.total;
    if (typeof row.discount === "number") return row.discount;
    if (typeof row.balance === "number") return row.balance;
  }
  if (headerLower.includes("fee") || headerLower.includes("mdr") || keyLower.includes("fee")) {
    if (typeof row.feeValue === "number") return row.feeValue;
    if (typeof row.fee === "number") return row.fee;
  }
  if (headerLower.includes("tax") || headerLower.includes("pajak") || keyLower.includes("tax")) {
    if (typeof row.taxPercent === "number") return row.taxPercent;
    if (typeof row.tax === "number") return row.tax;
  }
  if (headerLower.includes("discount") || headerLower.includes("diskon") || keyLower.includes("discount")) {
    if (typeof row.value === "number") return row.value;
    if (typeof row.discount === "number") return row.discount;
  }
  if (headerLower.includes("usage") || headerLower.includes("penggunaan") || keyLower.includes("usage")) {
    if (typeof row.currentUsage === "number") return row.currentUsage;
    if (typeof row.usage === "number") return row.usage;
  }
  if (headerLower.includes("token") || headerLower.includes("request") || headerLower.includes("assigned")) {
    if (typeof row.tokens === "number") return row.tokens;
    if (typeof row.requests === "number") return row.requests;
    if (typeof row.totalAssigned === "number") return row.totalAssigned;
    if (typeof row.activeUsers === "number") return row.activeUsers;
  }

  // Date/Time checks
  if (
    headerLower.includes("date") ||
    headerLower.includes("time") ||
    headerLower.includes("tanggal") ||
    headerLower.includes("waktu") ||
    headerLower.includes("timestamp") ||
    keyLower.includes("date") ||
    keyLower.includes("time") ||
    headerLower.includes("last") ||
    headerLower.includes("updated")
  ) {
    if (row.datetime) return String(row.datetime);
    if (row.timestamp) return String(row.timestamp);
    if (row.lastUpdated) return String(row.lastUpdated);
    if (row.date) return String(row.date);
    if (row.at) return String(row.at);
    if (row.lastLogin) return String(row.lastLogin);
    if (row.joinDate) return String(row.joinDate);
  }

  // Name / Profile checks
  if (
    keyLower === "u" ||
    headerLower.includes("name") ||
    headerLower.includes("nama") ||
    headerLower.includes("profile") ||
    headerLower.includes("admin") ||
    headerLower.includes("user") ||
    headerLower.includes("business") ||
    headerLower.includes("workspace") ||
    headerLower.includes("actor") ||
    headerLower.includes("owner")
  ) {
    if (row.name) return String(row.name);
    if (row.actor) return String(row.actor);
    if (row.owner) return String(row.owner);
    if (row.title) return String(row.title);
    if (row.code) return String(row.code);
  }

  // Email checks
  if (keyLower === "e" || headerLower.includes("email")) {
    if (row.email) return String(row.email);
    if (row.contactEmail) return String(row.contactEmail);
    if (row.contact) return String(row.contact);
  }

  // Role / Status checks
  if (keyLower === "r" || headerLower.includes("role") || headerLower.includes("peran")) {
    if (row.role) return String(row.role);
  }
  if (headerLower.includes("status") || keyLower.includes("status") || headerLower.includes("crud")) {
    if (row.status) return String(row.status);
    if (row.action) return String(row.action);
    if (typeof row.active === "boolean") return row.active ? "Active" : "Inactive";
  }

  // Business / Category / Plan / Type / Method / Module / IP checks
  if (keyLower === "b" || headerLower.includes("business") || headerLower.includes("bisnis")) {
    if (Array.isArray(row.businesses)) return row.businesses.join(", ");
    if (row.business) return String(row.business);
  }
  if (headerLower.includes("category") || headerLower.includes("kategori")) {
    if (row.category) return String(row.category);
  }
  if (headerLower.includes("plan") || headerLower.includes("paket") || headerLower.includes("type") || headerLower.includes("tipe")) {
    if (row.plan) return String(row.plan);
    if (row.type) return String(row.type);
    if (row.method) return String(row.method);
  }
  if (headerLower.includes("method") || headerLower.includes("metode") || headerLower.includes("provider")) {
    if (row.method) return String(row.method);
    if (row.provider) return String(row.provider);
  }
  if (headerLower.includes("module") || headerLower.includes("modul")) {
    if (row.module) return String(row.module);
  }
  if (headerLower.includes("ip") || headerLower.includes("address")) {
    if (row.ip) return String(row.ip);
    if (row.ipAddress) return String(row.ipAddress);
  }
  if (
    headerLower.includes("description") ||
    headerLower.includes("keterangan") ||
    headerLower.includes("deskripsi") ||
    headerLower.includes("preview") ||
    headerLower.includes("subject")
  ) {
    if (row.description) return String(row.description);
    if (row.preview) return String(row.preview);
    if (row.subject) return String(row.subject);
  }
  if (headerLower.includes("id") || headerLower.includes("kode") || headerLower.includes("code") || headerLower.includes("promo")) {
    if (row.code) return String(row.code);
    if (row.id) return String(row.id);
  }
  if (headerLower.includes("platform")) {
    if (Array.isArray(row.platforms)) return row.platforms.join(", ");
    if (row.platform) return String(row.platform);
  }

  // 3. Check any property on row that matches key or words in header
  for (const [k, v] of Object.entries(row)) {
    if (k.toLowerCase() === keyLower || headerLower.includes(k.toLowerCase())) {
      if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") {
        return typeof v === "boolean" ? (v ? 1 : 0) : v;
      }
      if (Array.isArray(v)) return v.join(", ");
    }
  }

  // 4. Fallback to extracting text from React node
  try {
    const rendered = col.render(row);
    return extractTextFromReactNode(rendered);
  } catch {
    return "";
  }
}

export function DataTable<T>({
  columns,
  data,
  empty,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  empty?: string;
  onRowClick?: (row: T) => void;
}) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // Sorting State
  const [sortColKey, setSortColKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    setPage(1);
  }, [data, sortColKey, sortOrder]);

  const isActionCol = (col: Column<T>) => {
    if (col.sortable === false) return true;
    const h = col.header.toLowerCase();
    const k = col.key.toLowerCase();
    return (
      h === "action" ||
      h === "actions" ||
      h === "aksi" ||
      k === "action" ||
      k === "actions" ||
      (k === "a" && h === "Action")
    );
  };

  const handleHeaderClick = (col: Column<T>) => {
    if (isActionCol(col)) return;
    if (sortColKey === col.key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortColKey(null);
        setSortOrder(null);
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortColKey(col.key);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColKey || !sortOrder) return data;
    const col = columns.find((c) => c.key === sortColKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const valA = getSortValue(a, col);
      const valB = getSortValue(b, col);

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA ?? "").toLowerCase().trim();
      const strB = String(valB ?? "").toLowerCase().trim();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, columns, sortColKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((c) => {
                const isAction = isActionCol(c);
                const isSorted = sortColKey === c.key && sortOrder !== null;
                const alignClass =
                  c.align === "right"
                    ? "text-right justify-end"
                    : c.align === "center"
                    ? "text-center justify-center"
                    : "text-left justify-start";

                return (
                  <th
                    key={c.key}
                    onClick={() => !isAction && handleHeaderClick(c)}
                    className={cn(
                      "sticky top-0 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors select-none",
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left",
                      !isAction && "cursor-pointer hover:bg-muted/70 hover:text-foreground group"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        alignClass,
                        c.align === "right" && "flex-row-reverse"
                      )}
                    >
                      <span>{c.header}</span>
                      {!isAction && (
                        <span className="inline-flex items-center text-muted-foreground/60 group-hover:text-foreground transition-colors">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-primary font-bold animate-in fade-in zoom-in duration-150" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-primary font-bold animate-in fade-in zoom-in duration-150" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {empty ?? "Belum ada data."}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-muted/40" : ""}`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`border-b px-4 py-3 align-middle ${
                        c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""
                      } ${c.className ?? ""}`}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10">
          <div className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, sortedData.length)} dari{" "}
            {sortedData.length} data
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-sm font-medium px-2">
              Halaman {page} dari {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}