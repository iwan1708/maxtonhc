# MAXTON HUMAN CAPITAL LEARNING CENTRE

Aplikasi membership lokal berbasis Node.js 24+ dan SQLite. Tidak membutuhkan instalasi dependency npm.

## Menjalankan

```powershell
cd 'D:\DASHBOARD MAXTON'
npm start
```

Buka http://localhost:3000. Hentikan dengan Ctrl+C. `npm run dev` memulai server dengan restart otomatis saat source berubah.

## Akun contoh

| Peran | Email | Password |
|---|---|---|
| Member | member@maxton.local | MaxtonMember!2026 |
| Admin | admin@maxton.local | MaxtonAdmin!2026 |
| Member tanpa akses | other@maxton.local | MaxtonOther!2026 |

Akun dan seluruh materi/harga/jadwal merupakan ilustrasi untuk pengembangan lokal. Server hanya mendengarkan 127.0.0.1. Jangan menggunakan akun contoh pada layanan online.

## Fitur yang tersedia

- Website publik, katalog sembilan program, dan jadwal event.
- Pendaftaran/login/logout member, profil, dan pemilihan kebutuhan belajar.
- Pembelian serta perpanjangan per modul, konfirmasi referensi transfer simulasi, dan verifikasi admin.
- Aktivasi 12 bulan; perpanjangan dini menambah masa akses dari tanggal akhir terakhir.
- Materi teks contoh dan progres belajar tersimpan.
- Pendaftaran event sesuai hak akses dan kuota; admin dapat membuat event dengan link Zoom.
- Studio Job Description dengan preview langsung, simpan draft, cetak/Simpan PDF melalui browser, dan review admin.
- Folder kebijakan privat, versi, tanggal berlaku, status, serta impor .txt/.md.
- Chat AI di kanan bawah tersedia untuk member dengan modul aktif dan admin. Jawaban memakai dokumen berlaku milik akun yang sedang login, dengan riwayat, sumber, dan status API. Kunci API serta model tetap perlu diatur di server.
- Panel Pengetahuan Perusahaan tetap menampilkan kategori PP, kebijakan HR, SOP, serta struktur organisasi. Member dan admin dapat membaca dokumen miliknya yang berlaku beserta versi dan tanggal efektifnya, terpisah dari panel chat.
- Feedback tugas, bantuan member, tugas tim, serta laporan pembayaran dan jejak tindakan admin.

## Uji alur pembayaran

1. Login sebagai member dan pilih program yang belum dimiliki.
2. Buat pesanan, lalu isi referensi transfer contoh pada Langganan & Pembayaran. Jangan mentransfer uang nyata.
3. Logout, login admin, lalu verifikasi pada Pesanan & Pembayaran.
4. Login member kembali. Akses modul aktif selama 12 bulan.

## Konfigurasi AI

Salin `.env.example` menjadi `.env`. Isi `OPENAI_API_KEY` dan `OPENAI_MODEL` dengan model yang tersedia pada akun API, lalu mulai ulang server. Kunci tidak disimpan pada browser atau dikirim melalui UI. Jangan commit `.env`.

Implementasi menggunakan [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text), `store: false`, batas waktu 45 detik, dan maksimal keluaran 1400 token. Saat bertanya, hingga 12 dokumen berlaku milik member (maksimal 10.000 karakter per dokumen) dikirim sebagai konteks ke OpenAI. UI menginformasikan pengiriman ini. Riwayat pertanyaan/jawaban disimpan lokal. Biaya API mengikuti akun penyedia.

Jika belum ada konfigurasi, UI menyatakan API belum diatur; tidak menampilkan jawaban AI palsu. Jawaban AI tetap perlu diperiksa terhadap pasal sumber. Dokumen kosong, draft, dicabut, arsip, belum efektif, atau kedaluwarsa tidak dipakai untuk jawaban baru. File sumber saat ini berbentuk teks; ekstraksi PDF/Word dan OCR belum tersedia.

## Data dan backup

SQLite berada di `data/maxton.sqlite`. Hentikan server sebelum menyalin folder `data` sebagai backup; sertakan semua file dalam folder. Password di-hash menggunakan scrypt. Sesi login berada di memori, cookie HttpOnly/SameSite, dan berakhir setelah 24 jam atau restart server.

## Verifikasi

```powershell
npm test
```

Tes integrasi memakai database sementara terpisah, memeriksa otorisasi, isolasi dokumen, pembelian hingga aktivasi, idempotensi, progres, review, pendaftaran event, batas akses AI, CSRF origin, dan tanggal tahunan.

## Batas versi lokal

Belum termasuk pengiriman email/verifikasi email/reset password mandiri, pembayaran nyata/payment gateway, video/rekaman, penjadwalan mentoring, sertifikat, modul kerja KPI/strategi/interview interaktif, paket corporate bersama, pembukuan lengkap, dan OKR. Program selain Job Description berisi materi teks ilustrasi. Harga dapat diubah pada `lib/store.mjs`; riwayat pesanan menyimpan harga saat transaksi. Pengubahan produk dari UI admin belum tersedia.

Kunci API belum disediakan sehingga panggilan AI langsung belum dapat diverifikasi. Sebelum online, diperlukan pengelolaan rahasia, akun produksi, recovery akun, transport HTTPS, sesi persisten, kebijakan privasi/retensi, backup terjadwal, serta pengujian keamanan dan evaluasi sumber AI lebih lanjut.

Dokumen perencanaan dan referensi desain disimpan terpisah di workspace lokal dan tidak disertakan dalam repository kode aplikasi.
