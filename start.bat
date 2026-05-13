@echo off
echo =========================================
echo    Menyiapkan Aplikasi (Windows)       
echo =========================================

echo [1/3] Menginstal dependensi (npm install)...
call npm install

if not exist .env (
    echo [2/3] Membuat file .env dari .env.example...
    copy .env.example .env
    echo PENTING: Jangan lupa untuk mengisi API Key di dalam file .env jika diperlukan!
) else (
    echo [2/3] File .env sudah ada, melewati langkah ini.
)

echo [3/3] Menjalankan server lokal (npm run dev)...
call npm run dev
pause
