import { DocItem } from "./types";

export const initialDocsData: DocItem[] = [
  {
    id: "doc-1",
    title: "Pengenalan Platform docs.postmatic.id",
    slug: "getting-started/introduction",
    menuLabel: "Getting Started",
    order: 1,
    status: "Published",
    updatedAt: "12 Juli 2026",
    author: "Rizky Pratama",
    icon: "Rocket",
    content: `
      <h1>Pengenalan Platform Postmatic Docs</h1>
      <p>Selamat datang di dokumentasi resmi <strong>Postmatic</strong>. Platform ini menyediakan infrastruktur pengiriman pesan otomatis (WhatsApp, Email & SMS Blast) dengan kapabilitas automasi cerdas.</p>
      
      <div class="admonition-card note" data-type="note">
        <div class="adm-content">
          <p><strong>📌 Note — Lingkungan Produksi</strong></p>
          <p>Pastikan Anda telah melakukan verifikasi domain dan nomor WhatsApp Business sebelum menguji pengiriman massal.</p>
        </div>
      </div>

      <h2>Daftar Topik Utama</h2>
      <ul>
        <li>Otentikasi API & Token Management</li>
        <li>Manajemen Kontak & Segmentasi Audiens</li>
        <li>Konfigurasi Webhook & Event Listener</li>
      </ul>

      <p style="margin: 20px 0;">
        <a href="https://docs.postmatic.id/getting-started/quickstart" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #1d4ed8; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);">
          Mulai Quickstart Guide →
        </a>
      </p>
    `.trim(),
  },
  {
    id: "doc-2",
    title: "Otentikasi & Manajemen API Key",
    slug: "authentication/api-keys",
    menuLabel: "Authentication",
    order: 2,
    status: "Published",
    updatedAt: "11 Juli 2026",
    author: "Anisa Putri",
    icon: "Key",
    content: `
      <h1>Otentikasi & Manajemen API Key</h1>
      <p>Semua permintaan ke REST API Postmatic membutuhkan token otentikasi berupa <code>Bearer Token</code> yang disertakan dalam HTTP header.</p>
      <h2>Contoh Request Header</h2>
      
      <div class="code-snippet-box" data-language="TYPESCRIPT" data-filename="welcome.ts">
        <pre><code>async function sendWelcomeEmail(userEmail: string) {
  const response = await client.emails.send({
    to: userEmail,
    template: 'welcome-id',
    variables: {
      name: 'Pengguna',
      loginUrl: 'https://app.postmatic.id/login',
    },
  })

  console.log('Email terkirim:', response.id)
  return response
}</code></pre>
      </div>

      <div class="code-snippet-box" data-language="BASH / cURL" data-filename="request.sh">
        <pre><code>curl -X GET https://api.postmatic.id/v1/workspace \
  -H "Authorization: Bearer pm_live_xxxxxxxxx" \
  -H "Content-Type: application/json"</code></pre>
      </div>

      <h2>Spesifikasi Parameter Konfigurasi Client</h2>
      <table class="docs-spec-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Tipe</th>
            <th>Wajib</th>
            <th>Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>apiKey</code></td>
            <td><code>string</code></td>
            <td><span class="badge-wajib-ya">Ya</span></td>
            <td>Kunci API dari dashboard Postmatic</td>
          </tr>
          <tr>
            <td><code>region</code></td>
            <td><code>string</code></td>
            <td><span class="badge-wajib-tidak">Tidak</span></td>
            <td>Region server, default: id-jkt-1</td>
          </tr>
          <tr>
            <td><code>timeout</code></td>
            <td><code>number</code></td>
            <td><span class="badge-wajib-tidak">Tidak</span></td>
            <td>Timeout request dalam ms, default: 30000</td>
          </tr>
          <tr>
            <td><code>retry</code></td>
            <td><code>boolean</code></td>
            <td><span class="badge-wajib-tidak">Tidak</span></td>
            <td>Aktifkan retry otomatis, default: true</td>
          </tr>
        </tbody>
      </table>

      <div class="admonition-card warning" data-type="warning">
        <div class="adm-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span>Peringatan</span>
        </div>
        <div class="adm-content">
          <p>Selalu validasi signature webhook menggunakan secret key Anda untuk memastikan payload benar-benar berasal dari Postmatic.id.</p>
        </div>
      </div>

      <div class="admonition-card tip" data-type="tip">
        <div class="adm-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          <span>Tips</span>
        </div>
        <div class="adm-content">
          <p>Gunakan template yang sudah dibuat di dashboard untuk memisahkan desain email dari logika aplikasi Anda.</p>
        </div>
      </div>

      <div class="admonition-card info" data-type="info">
        <div class="adm-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>Info</span>
        </div>
        <div class="adm-content">
          <p>Postmatic.id tersedia dalam paket gratis hingga 1.000 email per bulan. Untuk volume lebih besar, lihat halaman harga.</p>
        </div>
      </div>
    `.trim(),
  },
  {
    id: "doc-3",
    title: "Mengirim Pesan Broadcast WhatsApp",
    slug: "messaging/whatsapp-broadcast",
    menuLabel: "Messaging Guides",
    order: 3,
    status: "Published",
    updatedAt: "10 Juli 2026",
    author: "Devi Anggraeni",
    content: `
      <h1>Mengirim Pesan Broadcast WhatsApp</h1>
      <p>Anda dapat menjadwalkan dan mengirim pesan kampanye WhatsApp massal menggunakan template resmi yang disetujui Meta.</p>
      <h2>Daftar Parameter Utama</h2>
      <table class="docs-spec-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Tipe</th>
            <th>Wajib</th>
            <th>Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>template_id</code></td>
            <td><code>string</code></td>
            <td><span class="badge-wajib-ya">Ya</span></td>
            <td>ID unik template WhatsApp dari dashboard Meta</td>
          </tr>
          <tr>
            <td><code>recipients</code></td>
            <td><code>Array</code></td>
            <td><span class="badge-wajib-ya">Ya</span></td>
            <td>Daftar nomor telepon tujuan dalam format internasional (misal: 628123456789)</td>
          </tr>
        </tbody>
      </table>
      <p style="margin: 20px 0;">
        <a href="https://docs.postmatic.id/messaging/whatsapp-templates" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #1d4ed8; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);">
          Lihat Daftar Template WhatsApp →
        </a>
      </p>
    `.trim(),
  },
  {
    id: "doc-4",
    title: "Konfigurasi Webhook & Event Listener",
    slug: "webhooks/event-listener",
    menuLabel: "Webhooks & Events",
    order: 4,
    status: "Published",
    updatedAt: "08 Juli 2026",
    author: "Budi Santoso",
    content: `
      <h1>Konfigurasi Webhook & Event Listener</h1>
      <p>Webhook memungkinkan sistem Anda menerima notifikasi real-time setiap kali pesan WhatsApp terkirim, dibaca, atau gagal pengiriman.</p>
      
      <div class="admonition-card tip" data-type="tip">
        <div class="adm-content">
          <p><strong>💡 Tip — Verifikasi HMAC Signature</strong></p>
          <p>Gunakan header <code>X-Postmatic-Signature</code> untuk memverifikasi bahwa webhook benar-benar berasal dari server Postmatic.</p>
        </div>
      </div>
    `.trim(),
  },
  {
    id: "doc-5",
    title: "Batasan Rate Limit & Kuota Pengiriman",
    slug: "limits/rate-limits",
    menuLabel: "Rate Limits",
    order: 5,
    status: "Draft",
    updatedAt: "05 Juli 2026",
    author: "Rizky Pratama",
    content: `
      <h1>Batasan Rate Limit & Kuota Pengiriman</h1>
      <p>Untuk menjaga stabilitas jaringan dan kepatuhan terhadap regulasi WhatsApp Business API, Postmatic menerapkan pembatasan jumlah request per detik (QPS).</p>
      
      <div class="admonition-card caution" data-type="caution">
        <div class="adm-content">
          <p><strong>🚨 Caution — Batasan Maksimal Request</strong></p>
          <p>Melebihi 80 request per detik akan mengembalikan HTTP Status 429 (Too Many Requests). Gunakan mekanisme Exponential Backoff.</p>
        </div>
      </div>
    `.trim(),
  },
];
