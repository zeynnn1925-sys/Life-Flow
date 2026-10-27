# LifeFlow Human-Centric UI/UX Refinement: Eliminasi AI Slop, Sparkles & Emojis Berbasis Referensi Desain Produk Nyata

Menata ulang antarmuka LifeFlow menjadi sistem kerja digital yang berpusat pada manusia (*human-centric*), tenang (*calm computing*), dan matang: menghapus seluruh manifestasi "AI slop" (ikon sparkle, robot, badge `[AI]`, gradient glow neon, dan emoji dekoratif generik), mengganti dependensi ikon navigasi ke Phosphor Icons murni, mengubah penamaan fitur menjadi fungsional dan natural sesuai pola Mobbin dan Refero, serta memoles tata bahasa microcopy tanpa tanda em dash (`—`).

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain revisi yang mendasari transformasi ini:

- **Eliminasi Total Penanda AI Generik (Tanpa Badge `[AI]`, Tanpa Sparkle, Tanpa Emoji)**:
  - Mengikuti pola produk tier-1 di Mobbin & Refero (Linear, Notion, Cron, Wise, Stripe, Raycast): kapabilitas komputasi cerdas diperlakukan sebagai fitur bawaan sistem yang kompeten, bukan trik sulap atau materi promosi.
  - **Dihapus**: Segala bentuk label atau badge `[AI]`, ikon sparkle (`Sparkles`, `BrainCircuit`, `Zap`), ikon robot, dan emoji seperti `✨`, `💡`, `🧠`, `🚀` pada judul, notifikasi, toast, dan card header.
  - **Diganti**: Penamaan berbasis manfaat manusia yang lugas dan fungsional:
    - *AI Planner* → **Rencana Hari Ini** / **Daily Plan** (aksi: *Susun Jadwal Otomatis* / *Auto-schedule*)
    - *AIFinanceAdvisor* → **Wawasan Finansial** / **Financial Insights** (aksi: *Analisis Anggaran* / *Analyze Budget*)
    - *AIHabitCoach* → **Evaluasi Rutinitas** / **Routine Insights** (aksi: *Lihat Evaluasi* / *View Insights*)
- **Keluarga Ikon Tunggal: Phosphor Icons murni (`@phosphor-icons/react`)**:
  - Mengganti seluruh ikon Lucide di level Shell (`Header.tsx`, `MobileNav.tsx`, `FloatingPomodoro`) dan komponen fitur dengan Phosphor Icons berbobot `light` (kondisi standar) dan `regular` (kondisi aktif/fokus).
  - Menggunakan metafora ikon fungsional riil: `CalendarBlank`, `ChartDonut`, `SlidersHorizontal`, `ArrowsClockwise`, `CheckCircle`, `MagnifyingGlass`, `Bell`, `Sun`, `Moon`, `Globe`.
- **Standar Tipografi & Dark Mode (Dark Mode Design & Typewolf)**:
  - Kanvas utama gelap alami `#0d0e11`, kartu permukaan `#14161b` dengan garis rambut 1px `border-white/[0.07]`.
  - Satu aksen hangat tunggal: clay-amber `#C8A27C` (menggantikan seluruh biru neon/indigo pada navigasi seluler dan status aktif).
  - Angka metrik selalu menggunakan `tabular-nums` dan `font-mono`.
- **Pembersihan Bahasa & Penghapusan Em Dash (`—`)**:
  - Audit menyeluruh terhadap salinan bahasa (Indonesia & Inggris) di `translations.ts` dan komponen: menghapus em dash (`—`), menggantinya dengan struktur kalimat aktif yang ringkas, titik dua (`:`), atau pemisah titik tengah tipografis (`·`).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **De-hyping AI / Human Dignity**: Menghapus sensasionalisme AI murahan dari pengalaman harian pengguna. Aplikasi tidak "berteriak" bahwa ia menggunakan AI; sebaliknya, aplikasi memberikan hasil komputasi yang terstruktur, tenang, dan langsung bermanfaat bagi produktivitas pengguna.
  2. **Harmonisasi Navigasi & Shell**: Menyamakan bahasa visual Header desktop, Bottom Navigation seluler, dan Sidebar menjadi satu keluarga visual dengan Phosphor Icons dan palet aksen tanah liat redup (*clay amber* `#C8A27C`).
  3. **Editorial Micro-interactions**: Mengadopsi pola Godly dan Collect UI untuk feedback interaksi: tombol dengan tactile settling saat ditekan (`active:scale-[0.99]`), indikator proses dengan bar kemajuan minimal atau animasi denyut garis rambut yang tenang alih-alih animasi sparkle.
- **Target Audience / Persona**: Kalangan profesional, kreator, dan pembangun yang menghargai ketenangan mental, kebersihan tipografi, dan efisiensi kerja tanpa distraksi kosmetik.
- **Key Value**: Pengalaman visual yang percaya diri, bebas dari kesan prototipe AI generik, dan memberikan kenyamanan optik jangka panjang (*eye comfort*).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Alur Perencanaan Harian (Sebelumnya: AI Planner)**:
   - Pengguna membuka tab Target atau Dashboard. Di sana terdapat modul **Rencana Hari Ini** (*Daily Plan*).
   - Di sudut header modul, terdapat tombol fungsional dengan ikon Phosphor `ArrowsClockwise` bertuliskan "Perbarui Rencana" (*Update Plan*). Tidak ada bintang sparkle dan tidak ada badge `[AI]`.
   - Kartu inspirasi fokus harian ditampilkan dengan bingkai kartu minimal tanpa border kiri tebal 4px (`border-l-4`) yang mencolok, melainkan latar permukaan `#14161b` yang teduh dengan tipografi serif/sans yang berjarak nyaman.
2. **Alur Evaluasi Finansial (Sebelumnya: AI Finance Advisor)**:
   - Pada halaman Finansial, pengguna dapat menekan "Analisis Anggaran" (*Analyze Budget*).
   - Selama proses perhitungan, sistem menampilkan teks status tenang "Menganalisis alokasi 50/30/20..." dengan indikator pemuatan garis rambut tipis, bukan ikon tongkat sihir berputar.
   - Hasil analisis ditampilkan dalam tipografi markdown yang bersih dengan hierarki tebal/tipis yang tegas, tanpa kartu berwarna ungu atau bayangan neon.
   - Notifikasi yang muncul bertuliskan "Evaluasi Anggaran Selesai" tanpa emoji `💡` atau `✨`.
3. **Alur Navigasi Seluler & Header Terpadu**:
   - Header aplikasi menampilkan wordmark LifeFlow, jam digital berformat monospaced tabular, pencarian cepat (`⌘K`), dan ikon utilitas Phosphor (`Bell`, `Sun`/`Moon`, `Globe`).
   - Mobile Nav di bagian bawah menggunakan Phosphor Icons dengan label teks bersahaja dan warna aktif `#C8A27C`. Titik biru penanda di atas ikon dihilangkan demi kesederhanaan.

### Visual Identity & Theme

- **Aesthetic Direction**: *Quiet Digital Craftsmanship* terinspirasi dari arsip Mobbin (Linear, Cron, Superhuman) dan Dark Mode Design.
- **Color Palette & Contrast**:
  - *Canvas*: `#0d0e11` (gelap netral, tidak berkabut ungu).
  - *Cards & Panels*: `#14161b` dengan pembatas halus `border-white/[0.07]`.
  - *Hover State*: `#1c1f26`.
  - *Accent*: Single warm clay-amber `#C8A27C` (hanya untuk penanda aktif dan data penting).
  - *Text Primary*: `#f2f3f5` (keterbacaan tinggi).
  - *Text Muted*: `rgba(255,255,255,0.48)`.
- **Typography & Hierarchy (Typewolf / FontPair Guidance)**:
  - Sentence case untuk semua heading dan label tombol.
  - Tidak ada kapitalisasi berlebihan (*NO ALL-CAPS OVERKILL*).
  - Metrik angka: `tabular-nums font-mono` untuk memudahkan pemindaian mata pada pengeluaran, pemasukan, dan target.
- **Microcopy Discipline**:
  - Nol em dash (`—`). Contoh revisi:
    - Sebelum: *"LifeFlow — Master Your Life, Find Your Flow"*
    - Sesudah: *"LifeFlow · Kelola Waktu dan Capai Fokus Harian"*
    - Sebelum: *"AI Planner — Mengoptimalkan rutinitas harianmu..."*
    - Sesudah: *"Susun jadwal harian secara otomatis berdasarkan prioritas tugas hari ini."*
  - Nol emoji dalam notifikasi sistem. Contoh revisi:
    - Sebelum: *"✨ Rencana AI Harian Siap"*
    - Sesudah: *"Rencana harian berhasil diperbarui"*

---

## 3. Key Product Decisions & Trade-Offs

- **Menolak Badge `[AI]` dan Segala Bentuk Ikon AI Generik**:
  - *Keputusan*: Menghilangkan ide penandaan eksplisit seperti chip `[AI]` atau ikon otak/sparkle. Fitur cukup dinamai sesuai fungsinya bagi pengguna (misal: "Rencana Hari Ini", "Wawasan Finansial", "Evaluasi Rutinitas").
  - *Rasional*: Berdasarkan analisis produk mutakhir di Mobbin (Notion, Apple Intelligence, Linear), pengguna tidak peduli apakah sebuah fitur menggunakan LLM atau algoritma heuristik biasa; yang mereka inginkan adalah nilai guna nyata tanpa kebisingan pemasaran teknologi.
- **Standardisasi Phosphor Icons 100% pada Seluruh Shell**:
  - *Keputusan*: Mengganti total Lucide React di `Header.tsx`, `MobileNav.tsx`, modul analisis, dan notifikasi dengan `@phosphor-icons/react`.
  - *Rasional*: Konsistensi bobot garis ikon (*stroke weight*) dan estetika geometri yang menyatu dengan Sidebar yang sudah direfaktor sebelumnya.
- **Pembersihan Em Dash dan Nada Bahasa**:
  - *Keputusan*: Melakukan pemindaian menyeluruh terhadap teks UI di `translations.ts` dan komponen terkait.
  - *Rasional*: Menghilangkan kesan bahasa terjemahan mesin atau teks promosi AI yang sering menyisipkan tanda hubung panjang em dash yang kaku.

---

## 4. Technical Architecture & Data Strategy

### Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LIFEFLOW APP SHELL                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Header.tsx                                                     │   │
│   │ - Phosphor: List, Bell, Sun/Moon, Globe, Keyboard, Magnify...  │   │
│   │ - Tabular clock (font-mono) & minimalist search trigger        │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┼────────────────────────────────┐   │
│   │ DESKTOP SIDEBAR               │ MAIN CONTENT AREA              │   │
│   │                               │                                │   │
│   │ Sidebar.tsx                   │ ┌────────────────────────────┐ │   │
│   │ - Phosphor Icons              │ │ DailyPlan.tsx              │ │   │
│   │   (weight: light / regular)   │ │ (d/h AIPlanner.tsx)        │ │   │
│   │ - Accent: #C8A27C             │ │ - Label: "Rencana Hari Ini"│ │   │
│   │ - Zero sparkles, zero slop    │ │ - Action: "Perbarui Jadwal"│ │   │
│   │ - Pure calm hierarchy         │ └────────────────────────────┘ │   │
│   │                               │ ┌────────────────────────────┐ │   │
│   │                               │ │ FinanceInsights.tsx        │ │   │
│   │                               │ │ (d/h AIFinanceAdvisor.tsx) │ │   │
│   │                               │ │ - Phosphor: ChartPieSlice  │ │   │
│   │                               │ │ - Clear markdown report    │ │   │
│   │                               │ └────────────────────────────┘ │   │
│   │                               │ ┌────────────────────────────┐ │   │
│   │                               │ │ HabitInsights.tsx          │ │   │
│   │                               │ │ (d/h AIHabitCoach.tsx)     │ │   │
│   │                               │ │ - Phosphor: TrendUp        │ │   │
│   │                               │ │ - Clean advice cards       │ │   │
│   │                               │ └────────────────────────────┘ │   │
│   └───────────────────────────────┴────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │ MobileNav.tsx (Mobile Viewport)                                │   │
│   │ - Phosphor: SquaresFour, Wallet, Lightning, Gear, User         │   │
│   │ - Active color: #C8A27C (no indigo, no floating blue dots)    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### File-Level Implementation Plan

1. **`src/components/layout/Header.tsx`**:
   - Ganti `lucide-react` (`Menu`, `Bell`, `Moon`, `Sun`, `Search`, `Keyboard`) dengan `@phosphor-icons/react` (`List`, `Bell`, `Moon`, `Sun`, `MagnifyingGlass`, `Keyboard`).
   - Sederhanakan modal pemilih bahasa: tampilkan kode bahasa atau teks nama bahasa bersih tanpa bendera emoji yang terpotong.
2. **`src/components/layout/MobileNav.tsx`**:
   - Ganti ikon Lucide dengan Phosphor:
     - Dashboard: `SquaresFour`
     - Finance: `Wallet`
     - Habits: `Lightning`
     - Schedule: `CalendarBlank`
     - Profile/Settings: `User` / `Gear`
   - Ganti warna aktif `#5e6ad2` menjadi `#C8A27C`.
   - Hapus titik biru dekoratif di atas ikon aktif, gunakan `weight="regular"` untuk aktif dan `weight="light"` untuk inaktif.
3. **`src/components/AIPlanner.tsx` (Rencana Harian)**:
   - Hapus impor `BrainCircuit`, `Sparkles`, dan segala ikon sparkle. Ganti dengan `CalendarBlank` atau `CheckCircle` dari Phosphor.
   - Ganti judul modul menjadi "Rencana Hari Ini" (*Daily Plan*).
   - Hapus label/chip `[AI]`. Ganti tombol aksi menjadi "Susun Rencana Otomatis" atau "Perbarui Rencana" dengan ikon `ArrowsClockwise`.
   - Hilangkan `border-l-4` dan gradien warna aksen tebal pada kutipan inspirasi harian. Jadikan kartu latar tenang dengan kutipan tipografi rapi.
   - Perbarui pesan notifikasi: hapus emoji `✨` dan ganti menjadi teks informatif: "Rencana harian telah diperbarui."
4. **`src/components/AIFinanceAdvisor.tsx` (Wawasan Finansial)**:
   - Ganti `lucide-react` dengan Phosphor (`ChartPieSlice`, `ArrowUpRight`, `SpinnerGap`, `WarningCircle`).
   - Ubah judul menjadi "Wawasan & Evaluasi Anggaran" (*Budget Insights*).
   - Hapus emoji `💡` dari notifikasi dan gantikan dengan judul tenang: "Evaluasi Anggaran Tersedia".
5. **`src/components/habits/AIHabitCoach.tsx` (Evaluasi Rutinitas)**:
   - Ganti ikon otak `Brain` dengan Phosphor `TrendUp` atau `Compass`.
   - Ubah teks pemicu menjadi "Evaluasi Pola Rutinitas" (*Routine Insights*).
   - Hapus emoji `🧠` dari payload notifikasi.
6. **`src/components/SmartSpace.tsx`**:
   - Migrasi ikon Lucide di tab navigasi Smart Space (`Volume2`, `Play`, `Pause`, `BrainCircuit`, dll.) ke Phosphor Icons (`SpeakerHigh`, `Play`, `Pause`, `SlidersHorizontal`, dll.).
   - Sederhanakan tata letak kartu fokus agar senada dengan dashboard utama.
7. **`src/translations.ts` & Microcopy Audit**:
   - Hapus seluruh karakter em dash (`—`) pada string deskripsi dan tooltip di kedua bahasa (ID & EN).
   - Hapus emoji generik (`✨`, `🚀`, `💡`, `🧠`, `🔥`) yang disisipkan di dalam string teks sistem atau notifikasi.

---

## 5. Implementation Sequence & Verification

- **Langkah 1**: Refaktor `Header.tsx` dan `MobileNav.tsx` ke Phosphor Icons dan selaraskan warna aktif ke `#C8A27C`.
- **Langkah 2**: Refaktor `AIPlanner.tsx` dan `AIFinanceAdvisor.tsx` untuk menghapus seluruh jejak sparkle, emoji, border tebal, dan badge AI generik, berganti ke penamaan fungsional dan Phosphor Icons.
- **Langkah 3**: Refaktor `AIHabitCoach.tsx` dan `SmartSpace.tsx` untuk menyelaraskan ikon, bahasa, dan feedback interaksi.
- **Langkah 4**: Pembersihan string `translations.ts` dan notifikasi dari em dash (`—`) dan emoji.
- **Langkah 5**: Menjalankan `compile_applet` dan `lint_applet` untuk memverifikasi kebersihan kode dan ketiadaan galat build.
