# Sistem Penanganan Kuota AI & Ekspor Spreadsheet Standar Analis Data

Solusi komprehensif untuk menangani batas kuota Gemini API (Error 429) menggunakan in-memory caching & circuit breaker, serta arsitektur ekspor spreadsheet profesional berstandar **Data Analyst / Data Engineer** (struktur tabel bersih, pemformatan angka ramah formula Excel, blok KPI eksekutif, dan sanitasi data tingkat lanjut).

## User Review & Critical Decisions

> [!IMPORTANT]
> Masukan revisi pengguna: **Format ekspor spreadsheet harus benar-benar rapi, terstruktur presisi, dan tidak berantakan layaknya disusun oleh seorang Ahli Data profesional.**

- **Standar Format Data Analyst (Revisi Utama)**:
  - **Pemisahan Tipe Data Murni**: Kolom angka (nominal rupiah, durasi menit, hitungan streak) diekspor sebagai nilai numerik murni (`450000` bukan `Rp 450.000,00`) dengan satuan tertera jelas di nama kolom (contoh: `amount_idr`, `duration_minutes`). Ini memastikan formula Excel (`=SUM()`, `=AVERAGE()`, Pivot Table) langsung berfungsi tanpa perlu pembersihan data manual.
  - **Blok Ringkasan Eksekutif (KPI Summary Table)**: Bagian atas memuat tabel matriks ringkasan metrik (Total Pemasukan, Total Pengeluaran, Saldo Bersih, *Savings Rate %*, Rasio Penyelesaian Kebiasaan, dan Efektivitas Tugas).
  - **Format Tanggal Standar ISO 8601**: Menggunakan `YYYY-MM-DD` dan `HH:mm` untuk mencegah galat interpretasi lokal tanggal di Excel maupun Google Sheets.
  - **Dukungan Dua Mode Ekspor**: Pengguna dapat mengunduh **Buku Besar Terkonsolidasi (Consolidated Master Ledger)** atau **Unduh Spesifik Per Modul** (Finansial, Kebiasaan, Jadwal Tugas) dengan nama berkas sistematis (`lifeflow_financial_ledger_2026-10.csv`).
  - **Fitur Salin Format TSV (Tab-Separated)**: Opsi satu klik untuk menyalin data ke clipboard yang dapat langsung di-*paste* rapi ke lembar kerja Google Sheets tanpa pergeseran kolom.
- **Penanganan Kuota AI (Dikonfirmasi)**:
  - In-memory request caching (TTL 10 menit) untuk permintaan yang identik.
  - Circuit Breaker instan yang aktif ketika mendeteksi 429, langsung mengalirkan *deterministic heuristic insight* berkecepatan tinggi tanpa membuat aplikasi macet atau menampilkan pesan galat mentah.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Data-Grade Spreadsheet Generator**: Menghasilkan berkas spreadsheet terstruktur dengan arsitektur tabel relasional profesional. Dilengkapi UTF-8 BOM (`\uFEFF`) anti-rusak karakter, pembatas kutip ganda RFC 4180 yang aman dari injeksi koma/baris baru, baris total agregasi, dan format numerik yang siap diolah ke Microsoft Excel, Google Sheets, maupun Python Pandas/Power BI.
  2. **AI Quota Resiliency**: Mengamankan semua panggilan Gemini API dari penolakan rate-limit (5 request/menit pada paket free-tier), mengeliminasi waktu tunggu, dan menjamin respons insight selalu hadir dalam <100ms.
- **Target Persona**: Pengguna teratur yang menuntut data mereka bersih, rapi, akurat, dan dapat langsung diolah ke software spreadsheet atau arsip akuntansi tanpa kekacauan format.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Alur Ekspor Spreadsheet Profesional**:
   - Pengguna membuka modal **Ekspor Spreadsheet Laporan** dari Dashboard Header atau Navigasi Laporan.
   - Pengguna memilih **Rentang Periode**:
     - *Bulan Ini (Default)*, *30 Hari Terakhir*, *Bulan Lalu*, *7 Hari Terakhir*, atau *Semua Waktu*.
   - Pengguna memilih **Format & Target Dataset**:
     - Mode Konsolidasi (*Master Report* lengkap dengan KPI eksekutif)
     - Mode Modular (*Buku Besar Keuangan Saja*, *Analisis Kebiasaan Saja*, atau *Log Jadwal Saja*)
   - Modal menampilkan **Live Data Preview & Data Health**:
     - Jumlah baris data yang siap diekspor (misal: 42 transaksi, 15 log kebiasaan)
     - Validasi keutuhan data (Status: *Clean & Formula-Ready*)
   - Pengguna mengklik tombol **Unduh Spreadsheet (.CSV)** atau **Salin untuk Google Sheets (TSV)**. File terunduh seketika dengan penamaan kronologis yang rapi.

2. **Alur Smart Fallback AI**:
   - Saat kuota Google AI mengalami rate-limit, aplikasi tetap memunculkan rekomendasi finansial dan produktivitas yang tajam dengan label halus "Mode Analisis Lokal Cepat", tanpa log error merah.

### Visual Identity & Theme

- **Aesthetic Direction**: Desain utilitarian presisi tinggi ala *Linear* / *Bloomberg Terminal Minimalist*.
- **Warna & Kontras**: Latar gelap teratur (`#141414`), garis tepi subtil 1px (`border-white/10`), aksen tegas hijau emerald (`#10b981`) untuk status siap ekspor dan merah marun (`#ff0051`) untuk aksi primer.
- **Tipografi**: Menggunakan `font-mono` dan `tabular-nums` pada setiap angka pratinjau, ukuran baris ringkas, dan visual label yang bersih tanpa badge berlebihan.

---

## 3. Struktur Berkas Spreadsheet Berstandar Data Analyst

Contoh struktur hasil ekspor CSV yang akan dihasilkan:

```csv
# ==============================================================================
# LIFEFLOW EXECUTIVE DATA REPORT
# User: Zeynnn | Period: 2026-10-01 to 2026-10-31 | Exported: 2026-10-13 08:55
# Encoding: UTF-8 with BOM | Format: Excel / Google Sheets Formula-Ready
# ==============================================================================

[SECTION: KPI_SUMMARY]
metric_name,metric_value,unit,notes
total_income,12500000,IDR,Total akumulasi pemasukan periode berjalan
total_expense,4850000,IDR,Total akumulasi pengeluaran periode berjalan
net_cashflow,7650000,IDR,Surplus operasional bersih
savings_rate_pct,61.2,PERCENT,Rasio tabungan terhadap pemasukan
habit_consistency_pct,88.5,PERCENT,Persentase pencapaian rutinitas harian
completed_tasks,46,COUNT,Jumlah tugas terselesaikan

[SECTION: FINANCIAL_TRANSACTIONS]
transaction_id,date,type,category,amount_idr,description,notes
TX-001,2026-10-02,INCOME,Gaji Bulanan,12000000,Transfer Payroll Kantor,Gaji pokok
TX-002,2026-10-03,EXPENSE,Makanan & Minuman,75000,Makan Siang Resto,
TX-003,2026-10-05,EXPENSE,Transportasi,150000,Bensin Pertamax,
TX-TOTAL,,,TOTAL_EXPENSE,4850000,,[Formula: =SUM(E3:E15)]

[SECTION: HABIT_TRACKER_LOGS]
habit_id,habit_name,frequency,current_streak,target_days,completion_rate_pct
HB-001,Olahraga Pagi,Harian,14,30,93.3
HB-002,Membaca Buku 20 Hal,Harian,8,30,80.0
HB-003,Meditasi & Jurnal,Harian,21,30,95.0

[SECTION: DAILY_TASKS_SCHEDULE]
task_id,date,start_time,end_time,duration_minutes,title,status
TK-001,2026-10-12,08:30,10:00,90,Review Laporan Q3,COMPLETED
TK-002,2026-10-12,13:00,14:30,90,Diskusi Tim Engineering,COMPLETED
```

---

## 4. Technical Architecture & Implementation Steps

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│                                                                        │
│   ┌────────────────────────────────┐   ┌───────────────────────────┐   │
│   │     DashboardHeader Action     │   │    FinanceReports View    │   │
│   └───────────────┬────────────────┘   └─────────────┬─────────────┘   │
│                   │                                  │                 │
│                   ▼                                  ▼                 │
│       ┌────────────────────────────────────────────────────────┐       │
│       │               PeriodicExportModal.tsx                  │       │
│       │  - Pemilih Rentang Periode (Presets & Custom Date)     │       │
│       │  - Pemilih Dataset & Mode Ekspor (Master vs Modular)   │       │
│       │  - Live Data Health & Summary Preview Counters         │       │
│       └───────────────────────────┬────────────────────────────┘       │
│                                   │                                    │
│                                   ▼                                    │
│       ┌────────────────────────────────────────────────────────┐       │
│       │                   exportService.ts                     │       │
│       │  - Data Sanitization & Normalizer (RFC 4180 Escaping)  │       │
│       │  - Pure Numeric Column Mapping (Formula-Compatible)    │       │
│       │  - UTF-8 BOM Prepending & Blob Download Stream         │       │
│       │  - Clipboard TSV Formatter (Google Sheets Direct Paste)│       │
│       └────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

### Rencana Eksekusi Bertahap

1. **Langkah 1**: Penyempurnaan Server Resilience & Cache Gemini API (`server.ts`, `server/routes/productivityRoute.ts`):
   - Tambahkan in-memory response cache berbasis payload hash dengan batas kedaluwarsa 10 menit.
   - Pasang circuit breaker cooldown 45 detik saat mendeteksi kode HTTP 429.
   - Sempurnakan fallback insight heuristik lokal agar selalu menghasilkan kalimat analisis tajam yang relevan dengan saldo & target pengguna.
2. **Langkah 2**: Refactoring & Peningkatan Mesin Ekspor (`src/services/exportService.ts`):
   - Bangun fungsi `exportStructuredDatasetToCSV` dengan sanitasi kutip ganda RFC 4180, baris metadata, dan pemformatan kolom numerik murni.
   - Bangun fungsi `copyDatasetToClipboardTSV` untuk paste instan ke Google Sheets.
   - Bangun agregator `buildPeriodicMasterDataset` yang menggabungkan keuangan, kebiasaan, dan jadwal secara tertib.
3. **Langkah 3**: Pembuatan Komponen Modal Ekspor Data Analyst (`src/components/PeriodicExportModal.tsx`):
   - Implementasikan antarmuka seleksi periode, opsi download terpisah vs konsolidasi, pratinjau matriks baris, dan feedback visual status ekspor.
   - Hubungkan tombol pemicu ekspor di header dashboard dan halaman laporan finansial.
4. **Langkah 4**: Verifikasi & Pengujian Kompilasi (`compile_applet` & `lint_applet`):
   - Uji kompilasi kode dan pastikan berkas CSV hasil unduhan teruji rapi di aplikasi spreadsheet.
