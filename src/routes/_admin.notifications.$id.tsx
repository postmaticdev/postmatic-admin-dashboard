import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";

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
  success: <CheckCircle className="h-6 w-6 text-emerald-400" />,
  warning: <AlertTriangle className="h-6 w-6 text-amber-400" />,
  info: <Info className="h-6 w-6 text-sky-400" />,
};

export const Route = createFileRoute("/_admin/notifications/$id")({
  component: NotificationDetail,
});

function NotificationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  
  const notification = NOTIFICATIONS.find((n) => n.id === parseInt(id, 10));
  
  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-4">Notifikasi tidak ditemukan</h2>
        <Button onClick={() => navigate({ to: "/dashboard" })}>Kembali ke Dashboard</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </div>
      
      <PageHeader 
        title="Detail Notifikasi" 
        description="Informasi lengkap mengenai notifikasi yang Anda pilih." 
      />
      
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className={`mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
            notification.type === "success" ? "bg-emerald-500/10" :
            notification.type === "warning" ? "bg-amber-500/10" : "bg-sky-500/10"
          }`}>
            {ICON_MAP[notification.type as keyof typeof ICON_MAP]}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">{notification.title}</h3>
              <span className="text-sm text-muted-foreground">{notification.time}</span>
            </div>
            
            <div className="rounded-lg border bg-muted/20 p-4 mt-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
