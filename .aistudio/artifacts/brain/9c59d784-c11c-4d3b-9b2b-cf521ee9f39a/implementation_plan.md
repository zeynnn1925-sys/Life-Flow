# Transformasi 3D Nametag Kamar Estetik & Realistis Profil Developer (Full Stack Developer)

Menata ulang komponen About Developer di LifeFlow agar deskripsi dan gelar profesi tampil apa adanya dan realistis ("Full Stack Developer", tanpa klaim berlebihan atau istilah yang tidak ada di industri), membersihkan komentar-komentar kode yang tidak penting, serta mengubah total gaya visual nametag menjadi gantungan 3D yang menggantung di dinding/lemari kamar estetik dengan pencahayaan hangat lo-fi dan interaktivitas Zoom In / Zoom Out saat foto diklik.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang dikonfirmasi:
> - **Latar Suasana Kamar Estetik**: Kombinasi antara lemari kayu estetik dan dinding kamar mood lo-fi dengan gantungan tali/strap fisik, paku/hook dinding, serta bayangan pencahayaan hangat (*ambient room lighting*).
> - **Interaksi Zoom**: Saat foto/nametag diklik, akan memicu **Zoom In modal fokus besar dengan efek 3D tilt penuh** yang interaktif, dan dapat di-zoom out kembali dengan klik tombol tutup atau klik di luar kartu.
> - **Gelar Profesi**: Mengganti semua penyebutan "Software Engineer" dan istilah berlebihan menjadi **"Full Stack Developer"** yang membumi, kredibel, dan realistis di dunia nyata.
> - **Pembersihan Kode**: Menghilangkan seluruh komentar JSX dan komentar baris yang tidak penting di file komponen.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Nametag Estetik Kamar 3D**: Menggantikan tampilan lanyard kartu biasa dengan adegan gantungan realistis: hook logam di dinding/lemari bertekstur kayu hangat dengan bayangan lembut, tali gantungan bertekstur kain yang jatuh gravitasi, serta nametag ID berbingkai matte akrilik 3D yang merespons pergerakan kursor mouse (*interactive parallax tilt*).
  2. **Interaktivitas Zoom In / Out**: Pengguna dapat mengklik nametag atau ikon kaca pembesar / klik langsung pada kartu untuk masuk ke mode inspeksi fokus penuh (*Zoomed-In 3D Showcase*), di mana kartu membesar mulus dengan animasi Framer Motion dan tetap memiliki interaksi tilt 3D berglare optik dinamis.
  3. **Narasi Realistis & Membumi**: Menghilangkan jargon berlebihan (seperti "Distributed Systems Architect", "Senior Full-Stack Software Engineer & High Performance Systems"), digantikan dengan keahlian praktis dunia nyata seorang **Full Stack Developer**: Frontend modern (React, TypeScript, Tailwind), Backend API & Database (Node.js, Express, PostgreSQL/Firestore), serta deployment & integrasi aplikasi web.

---

## 2. User Experience & Visual Design

### Alur Interaksi Pengguna:
1. **Membuka Modal Profil**: Pengguna membuka *About Developer* dari menu navigasi samping atau profil.
2. **Tampilan Hero Kamar Estetik**:
   - Di sisi kiri kartu hero, terdapat ruang visual dengan dinding kamar lo-fi berpadu panel lemari kayu hangat (`#1c1a17` hingga `#2a2520`).
   - Sebuah pin / hook logam terpasang di dinding, menahan tali gantungan yang terhubung ke ID card holder.
   - Nametag berayun dan miring secara 3D mengikuti kursor mouse (menggunakan komponen `TiltedCard` yang ditingkatkan dengan depth visual).
3. **Klik untuk Zoom In**:
   - Terdapat label petunjuk halus: *"Klik untuk memperbesar / zoom in"*.
   - Saat foto atau kartu diklik, kartu bertransisi secara mulus membesar ke tengah layar (mode lightbox 3D) dengan tombol kembali/zoom out, memungkinkan pengguna melihat detail foto dan kartu secara tajam.
4. **Informasi Karir & Bahasa yang Jujur**:
   - Gelar: **Full Stack Developer**.
   - Deskripsi: Pengembang web full-stack yang fokus pada pembangunan antarmuka pengguna interaktif, pembuatan API backend yang andal, dan manajemen database untuk aplikasi web modern.

---

## 3. Key Product Decisions & Trade-Offs

- **Pilihan Efek 3D Kamar Lo-Fi**:
  - *Pendekatan*: Menggunakan CSS 3D transforms dan Framer Motion springs (`perspective: 1000px`, `transform-style: preserve-3d`) dengan latar gradient kayu & bayangan ambient drop-shadow.
  - *Rasional*: Sangat ringan, performa 60fps tanpa membebani browser dengan aset 3D WebGL yang berat, namun tetap memberikan ilusi fisik nametag nyata yang menggantung di sudut kamar.
- **Pembersihan Komentar Kode**:
  - Menghapus semua komentar JSX `/* ... */` dan komentar internal redundan agar kode rapi, ringkas, dan mudah dirawat.

---

## 4. Technical Architecture & Implementation Details

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ABOUT DEVELOPER MODAL                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Header: Nama & Tombol Tutup (ESC)                              │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ HERO SECTION: KAMAR ESTETIK + NAMETAG 3D                       │   │
│   │                                                                │   │
│   │  [ Dinding & Lemari Kayu Lo-Fi ]                               │   │
│   │      ┌─ [Hook Logam Dinding] ─┐                                │   │
│   │      │   Tali Gantungan       │                                │   │
│   │      │   ▼                    │      Deskripsi Full Stack:     │   │
│   │      │ ┌──────────────────┐   │      - Nama: M. Faiz Dzahin    │   │
│   │      │ │ ID Nametag 3D    │   │      - Gelar: Full Stack Dev   │   │
│   │      │ │ Foto + Info      │   │      - Fokus: Web Apps, API,   │   │
│   │      │ │ (Click to Zoom)  │───┼────>   Modern UI & Database    │   │
│   │      │ └──────────────────┘   │                                │   │
│   │      └────────────────────────┘                                │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ TAB NAVIGASI & KONTEN: Profil, Stack, Layanan, Kontak          │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ OVERLAY LIGHTBOX: ZOOM IN 3D NAMETAG                           │   │
│   │ (Aktif saat foto/kartu diklik, tilt 3D penuh + tombol tutup)   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Rincian Perubahan Berkas:
- **`src/components/AboutDeveloperModal.tsx`**:
  - Hapus semua komentar tidak penting.
  - Ubah gelar: `Full Stack Developer`.
  - Hapus teks yang melebih-lebihkan ("Senior Distributed Systems Architect", dsb.).
  - Bangun container kamar estetik lo-fi (dinding + panel lemari kayu gelap + bayangan cahaya lembut).
  - Bangun tali gantungan dan pin realistis.
  - Tambahkan state `isZoomed` dengan dialog modal / portal zoom in 3D animasi penuh.
