# Dashboard Admin Postmatic — Plan

Membangun 7 halaman admin dashboard sesuai spesifikasi. Fokus UI/UX, mock data statis, komponen reusable. Backend menyusul (dibuat user).

## Design system

- Style: **Clean Light Corporate** — background `#F5F7FA`, surface `#FFFFFF`, primary `#2563EB`, foreground `#0F172A`, muted `#64748B`, border `#E2E8F0`, success `#16A34A`, warning `#F59E0B`, destructive `#DC2626`.
- Font: Inter (headings) + Inter (body) via `<link>` di `__root.tsx`.
- Radius `0.75rem`, shadow lembut (elegant token), spacing rapi 8px grid.
- Semua warna sebagai token di `src/styles.css` (`@theme inline`) — tidak ada hex hardcode di komponen.
- Bahasa: campuran (nav ID, istilah metrik EN sesuai spek).

## Struktur route (TanStack file-based)

```
src/routes/
  __root.tsx                 (head metadata + font link)
  index.tsx                  → redirect ke /dashboard
  _admin.tsx                 (layout: Sidebar + Topbar + <Outlet/>)
  _admin.dashboard.tsx       Menu 1 — Overview
  _admin.users.tsx           Menu 2 — User Management (tabs)
  _admin.financing.tsx       Menu 3 — Financing
  _admin.feedback.tsx        Menu 4 — Feedback & Report
  _admin.ai-model.tsx        Menu 5 — AI Model
  _admin.logs.tsx            Menu 6 — Log Activity
  _admin.settings.tsx        Menu 7 — Settings
```

## Komponen reusable (`src/components/admin/`)

- `AppSidebar.tsx` — sidebar collapsible (shadcn), highlight route aktif.
- `Topbar.tsx` — search, notif bell, avatar user login.
- `PageHeader.tsx` — title + description + slot action kanan.
- `Scorecard.tsx` — card metrik (icon, label, value, delta, trend).
- `ScorecardGrid.tsx` — grid responsif 2/3/4 kolom.
- `GlobalFilter.tsx` — dropdown Daily/Weekly/Monthly/Yearly + date range.
- `DataTable.tsx` — wrapper `@tanstack/react-table` (sort, search, pagination, row actions).
- `StatusBadge.tsx` — variant Active/Inactive/Success/Pending/Failed.
- `UserCell.tsx` — avatar + nama + email (dipakai di banyak tabel).
- `ActionMenu.tsx` — tombol Info + Edit (icon).
- `DetailModal.tsx` — shell modal besar dengan header/section/footer.
- `EmptyState.tsx`, `SectionCard.tsx`, `KeyValueList.tsx`, `JsonDiffBlock.tsx` (untuk Log Activity), `ChatList.tsx` + `ChatThread.tsx` (Feedback), `AiModelCard.tsx`.
- Chart: `RevenueLineChart.tsx` (Recharts, LineChart + tooltip semantic).

## Mock data

`src/lib/mock/` — file terpisah per domain: `users.ts`, `admins.ts`, `businesses.ts`, `transactions.ts`, `messages.ts`, `aiModels.ts`, `logs.ts`, `metrics.ts`, `revenueSeries.ts`. Ekspor typed arrays; tidak ada fetch.

## Detail per halaman

**1. Dashboard Overview** — GlobalFilter, 4 Scorecard (Total Revenue, Active User, Active Business, Total Generated), RevenueLineChart, tabel ringkas user (5 baris + link "Lihat semua"), 2 widget: Unread Messages list + AI Model Quick Access (grid shortcut card).

**2. User Management** — 4 Scorecard, `Tabs` (User / Admin / Business), tombol primary sesuai tab aktif ("Add New User/Admin/Business" → modal form Name/Email/Password atau Business Name/Owner). 3 DataTable variant + 3 modal detail berbeda (spesifikasi lengkap seperti spek: info pribadi, status, businesses, balance, transaksi, riwayat AI, log device).

**3. Financing** — 3 Scorecard, tombol "Add New Transaction" (modal form Date/Description/Type/Amount/Payment Method/Status), DataTable mutasi, modal invoice detail (audit log status).

**4. Feedback & Report** — 4 Scorecard, tombol "New Chat" (modal pilih WA/Email + kontak + pesan), `Tabs` Email/Chat/Report, layout 2 panel: `ChatList` (kiri) + `ChatThread` (kanan, bubble + composer).

**5. AI Model** — 4 Scorecard, tombol "Add New AI Model" (modal form), grid `AiModelCard` (nama, versi, deskripsi, Switch active, tombol Edit Prompt & Settings). Modal Settings: form Name/Provider, textarea System Prompt, 3 Slider (Temperature/Top-P/Max Tokens), list error log.

**6. Log Activity** — DataTable (Timestamp, User, Action, Module, IP, Status), modal detail: User-Agent, lokasi IP, `JsonDiffBlock` old vs new (dua kolom `<pre>` monospace).

**7. Settings** — Form profil (upload avatar, Nama, Email), section Change Password (Current/New/Confirm), tombol Save Changes (primary) + Logout (destructive).

## Technical notes

- Semua modal pakai shadcn `Dialog`.
- Tabel pakai `@tanstack/react-table` (sudah tersedia via query dep? cek — kalau tidak, `bun add @tanstack/react-table`).
- Charts pakai `recharts` (sudah termasuk shadcn chart).
- Setiap route punya `head()` unik (title + description).
- Semua nilai warna via token semantic, dark mode tetap diset di `.dark` walaupun default light.
- Sidebar mengikuti pola shadcn-sidebar (SidebarProvider di `_admin.tsx`).

Tidak ada auth/backend/database di ronde ini — pure UI dengan mock data siap dihubungkan nanti.