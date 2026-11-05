# Redesain Halaman Login & Registrasi 3D Interaktif LifeFlow

Membangun ulang halaman autentikasi LifeFlow menjadi antarmuka modern kelas dunia dengan tata letak split-screen: pameran kanvas 3D Three.js interaktif di panel kiri (aliran partikel fluida cerdas dan elemen 3D pilar keuangan & produktivitas) bersanding dengan kartu autentikasi glassmorphism di panel kanan yang dilengkapi tab switch Login & Registrasi instan, Google OAuth, Face Recognition biometrik, serta Akses Tamu satu klik.

## User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan keputusan desain yang telah dikonfirmasi oleh pengguna melalui sesi klarifikasi:

- **Konsep Visual 3D**: Menggabungkan aliran partikel fluida dinamis Three.js yang merespons kursor mouse dengan objek-objek 3D prosedural representasi pilar LifeFlow (kubus target, cincin waktu Pomodoro, kristal finansial dengan pencahayaan PBR studio).
- **Tata Letak (Layout)**: Split-screen modern 50/50 di layar desktop (panel kiri kanvas visual 3D imersif dengan branding & kutipan filosofi LifeFlow; panel kanan kartu autentikasi elegan dan responsif yang ramah mobile).
- **Opsi Autentikasi**: Opsi lengkap dengan switch tab instan (Login vs Registrasi), tombol cepat Google Sign-In, verifikasi biometrik Face Recognition, form Email/Password dengan validasi halus, dan tombol One-Click Guest Demo.
- **Re-aktivasi Gate Login**: Mengembalikan proteksi login di `App.tsx` dan menyelaraskan `AuthContext` agar alur masuk dan keluar kembali berjalan normal setelah video demo selesai direkam.

---

## 1. Overview & Core Concept

- **Tujuan Utama**: Menghadirkan kesan pertama yang memukau dan berkesan profesional bagi setiap pengguna yang mengunjungi LifeFlow, mencerminkan harmoni antara pengelolaan finansial pribadi dan rutinitas produktivitas sehari-hari.
- **Target Pengguna**: Profesional muda, kreator digital, mahasiswa, dan individu yang menginginkan sistem manajemen hidup terpadu yang estetik, cepat, dan aman.
- **Nilai Utama**: Memadukan estetika visual mutakhir (tata letak split-screen dan kanvas 3D bertenaga Three.js tanpa latensi) dengan fungsionalitas autentikasi Firebase yang kokoh dan intuitif.

---

## 2. User Experience & Visual Design

### A. Alur Interaksi Pengguna (User Journey)
1. **Pendaratan Pertama (First Impression)**: Pengguna disambut dengan transisi fade-in halus. Di sisi kiri, kanvas Three.js menampilkan partikel cahaya keemasan & amber hangat yang melayang mengelilingi pilar-pilar geometri 3D (Finansial, Jadwal, Target) yang berotasi perlahan dan berinteraksi secara kinetik terhadap posisi pointer mouse pengguna.
2. **Tab Switch Login / Registrasi**: Di panel kanan, pengguna dapat berpindah antara tab **Masuk (Login)** dan **Daftar (Register)** dengan animasi tab sliding indicator (`framer-motion layoutId`) tanpa reload halaman.
3. **Pilihan Autentikasi Fleksibel**:
   - **Google Sign-In**: Tombol satu klik dengan icon Google resmi dan feedback state loading yang jelas.
   - **Face Recognition**: Tombol biometrik modern yang membuka dialog pengenalan wajah cerdas.
   - **Form Email & Password**: Inputfield elegan dengan ikon kontekstual (Mail, Lock), tombol toggle visibilitas kata sandi (Eye/EyeOff), dan tombol submit dengan status interaktif.
   - **Akses Tamu (Continue as Guest)**: Akses instan untuk eksplorasi kilat tanpa perlu mendaftar akun.
4. **Respon Sukses & Masuk Dashboard**: Animasi sukses singkat sebelum transisi mulus ke dashboard utama LifeFlow.

### B. Identitas Visual & Palet Warna
- **Tema & Nuansa**: *Dark Glassmorphism Obsidian & Warm Amber Accent*.
- **Warna Utama**:
  - Background Base: `#0c0d12` (deep obsidian canvas)
  - Card & Surface: `#14161f` dengan border halus `rgba(255, 255, 255, 0.08)` dan aksen ambient `rgba(200, 162, 124, 0.15)`.
  - Brand Accent: `#C8A27C` (warm amber gold), `#E0C097`, dan `#f77f00`.
  - Text: `#FFFFFF` (headings), `#E2E8F0` (body), `#94A3B8` (subtitles/placeholders).
- **Tipografi**: Display font tegas dan modern berpasangan dengan font monospace bersih untuk micro-label dan angka statistik.

---

## 3. Key Product Decisions & Trade-Offs

- **Three.js Prosedural vs Asset Eksternal (Zero 404s)**:
  - *Keputusan*: Seluruh geometri 3D, partikel, material PBR (roughness/metalness), dan shader pencahayaan dibangun 100% prosedural via Three.js (BufferGeometry, InstancedMesh, MeshPhysicalMaterial).
  - *Alasan*: Menjamin performa 60fps tanpa jeda loading file eksternal `.glb`/`.gltf` yang berisiko 404 atau lambat saat diakses jaringan.
- **Pemisahan Modul Kanvas & Isolasi Render Loop**:
  - *Keputusan*: Kanvas WebGL dibungkus dalam komponen terisolasi (`LifeFlow3DShowcase.tsx`) dengan `useRef` mandiri dan `requestAnimationFrame` loop yang teratur, dilengkapi fallback deteksi WebGL software (`isSoftwareGl`).
  - *Alasan*: Mencegah re-render React pada form input mempengaruhi performa putaran 3D di sisi kiri.
- **Transisi Halus Mobile ke Desktop**:
  - *Keputusan*: Di layar desktop ($\ge 1024\text{px}$), tampilan split 50/50 penuh. Di layar mobile/tablet, visual 3D beradaptasi menjadi banner ambient compact di bagian atas kartu login sehingga form tetap mudah dijangkau dan nyaman diisi dengan keyboard virtual ponsel.

---

## 4. Technical Architecture & Data Strategy

### A. Diagram Arsitektur Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                              src/App.tsx                               │
│            (Validasi Sesi Pengguna: user == null -> Login)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        src/components/Login.tsx                        │
│                 (Split-Screen Container & Form States)                 │
├───────────────────────────────────┬────────────────────────────────────┤
│         PANEL KIRI (3D)           │          PANEL KANAN (FORM)        │
│ ┌───────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │  LifeFlow3DShowcase.tsx       │ │ │ Brand Header & Tagline         │ │
│ │  - Three.js WebGL Scene       │ │ │ Sliding Tab: Login | Register  │ │
│ │  - Ambient Partikel Fluida    │ │ │ Social Auth: Google Button     │ │
│ │  - 3D Productivity Objects    │ │ │ Biometric: Face Recognition    │ │
│ │  - Kinetic Pointer Tracking   │ │ │ Email & Password Form          │ │
│ │  - Clean Typography Layer     │ │ │ One-Click Guest Demo Button    │ │
│ └───────────────────────────────┘ │ └────────────────────────────────┘ │
└───────────────────────────────────┴────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      src/contexts/AuthContext.tsx                      │
│       (Firebase Auth: Google, Email/Pass, Anonymous, Face Auth)        │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Rencana Modifikasi File & Paket
1. **Dependensi Baru**:
   - `three` dan `@types/three` dipasang untuk membangun kanvas 3D profesional sesuai standar Three.js skill.
2. **File Baru & Modifikasi**:
   - `src/components/auth/LifeFlow3DCanvas.tsx`: Komponen kanvas Three.js modular dengan partikel dinamis dan objek pilar produktivitas.
   - `src/components/Login.tsx`: Didesain ulang total menjadi split-screen responsif dengan tab switch Login/Register, visual card glassmorphism, dan integrasi auth lengkap.
   - `src/App.tsx`: Mengaktifkan kembali pengecekan `if (!user) return <Login />` dengan penanganan transisi yang mulus.
   - `src/contexts/AuthContext.tsx`: Mengembalikan fungsi login sesungguhnya dan memastikan sesi auth tersinkronisasi sempurna dengan Firebase.
