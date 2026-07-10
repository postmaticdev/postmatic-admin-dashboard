import { useState, useRef, useEffect } from "react";
import { Bell, Settings, LogOut, CheckCheck, ChevronRight, X, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";

/* ─── Mock Data ─────────────────────────────────────────── */
const NOTIFICATIONS = [
  {
    id: 1,
    type: "success",
    title: "Pembayaran Berhasil",
    message: "Transaksi #TRX-2041 sebesar Rp 1.250.000 telah dikonfirmasi.",
    time: "2 menit lalu",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Pengguna Baru Menunggu Verifikasi",
    message: "Budi Santoso membutuhkan verifikasi akun sebelum bisa bertransaksi.",
    time: "15 menit lalu",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Laporan Bulanan Siap",
    message: "Laporan keuangan bulan Juni 2025 telah selesai diproses dan siap diunduh.",
    time: "1 jam lalu",
    read: false,
  },
  {
    id: 4,
    type: "info",
    title: "Pembaruan Sistem",
    message: "Sistem akan menjalani pemeliharaan pada Senin, 7 Juli pukul 02.00–04.00 WIB.",
    time: "3 jam lalu",
    read: true,
  },
  {
    id: 5,
    type: "success",
    title: "Integrasi API Aktif",
    message: "Koneksi ke gateway pembayaran eksternal kini berjalan normal.",
    time: "Kemarin",
    read: true,
  },
  {
    id: 6,
    type: "warning",
    title: "Batas Limit Mendekati",
    message: "Akun merchant PM-0099 telah mencapai 90% dari batas transaksi bulanan.",
    time: "2 hari lalu",
    read: true,
  },
];

const ICON_MAP = {
  success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-sky-400" />,
};

const DOT_MAP = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

/* ─── Hook: close on outside click ──────────────────────── */
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

/* ─── Topbar ─────────────────────────────────────────────── */
export function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = showAll ? notifications : notifications.slice(0, 3);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markReadAndNavigate(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setNotifOpen(false);
    navigate({ to: "/feedback", search: { tab: "Report" } });
  }

  function dismissNotif(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
      {/* Left */}
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Notification ── */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => {
            setNotifOpen((p) => !p);
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted/60 hover:scale-105 active:scale-95"
          aria-label="Notifikasi"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none shadow-md shadow-rose-500/30">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {notifOpen && (
          <div
            className="absolute right-0 top-12 w-[380px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 backdrop-blur-sm"
            style={{ animation: "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/15 text-rose-500 text-[11px] font-semibold px-2 py-0.5">
                    {unreadCount} belum dibaca
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai semua
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                </div>
              ) : (
                displayed.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markReadAndNavigate(n.id)}
                    className={`group relative flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-muted/40 ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    {/* Type icon */}
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl ${
                      n.type === "success" ? "bg-emerald-500/10" :
                      n.type === "warning" ? "bg-amber-500/10" : "bg-sky-500/10"
                    }`}>
                      {ICON_MAP[n.type as keyof typeof ICON_MAP]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug truncate ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                          {n.title}
                        </p>
                        <span className="flex-shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span className={`absolute right-3 top-3 h-2 w-2 rounded-full ${DOT_MAP[n.type as keyof typeof DOT_MAP]}`} />
                    )}

                    {/* Dismiss */}
                    <button
                      onClick={(e) => dismissNotif(n.id, e)}
                      className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 3 && (
              <div className="border-t border-border/50 px-4 py-2.5">
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-sm font-medium text-primary hover:bg-primary/8 transition-colors"
                >
                  {showAll ? "Sembunyikan" : `Lihat semua (${notifications.length})`}
                  <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </header>
  );
}