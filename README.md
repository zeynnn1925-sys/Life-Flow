# LifeFlow — Personal Wealth & Productivity Hub

LifeFlow adalah aplikasi all-in-one untuk mengelola keuangan pribadi dan produktivitas Anda. Bangun kebiasaan baik, lacak pengeluaran, dan rencanakan masa depan Anda dengan cerdas.

## Fitur Utama

- **Finance Manager**: Lacak pemasukan, pengeluaran, dan buat anggaran bulanan.
- **Productivity Suite**: Jadwal harian, pelacak kebiasaan (Habit Tracker), dan AI Planner.
- **Smart Analytics**: Visualisasi data keuangan Anda agar lebih mudah dipahami.
- **AI Integration**: Personal coach untuk membantu mengoptimalkan hidup Anda.

## Cara Deploy ke Vercel

Jika Anda mengalami masalah layar kosong (blank screen) saat deploy ke Vercel, pastikan langkah-langkah berikut terpenuhi:

1. **Environment Variables**: 
   Salin semua isi dari `.env.example` ke bagian **Environment Variables** di dashboard Vercel. Pastikan `VITE_FIREBASE_API_KEY`, dan variabel lainnya sudah terisi.
   
2. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Firebase Configuration**:
   Pastikan file `firebase-applet-config.json` sudah memiliki data yang valid.

## Teknologi yang Digunakan

- React + Vite + TypeScript
- Tailwind CSS (Styling)
- Firebase (Database & Auth)
- Framer Motion (Animations)
- Gemini API (AI Capabilities)

---
Dibuat dengan ❤️ oleh Zeynn.
