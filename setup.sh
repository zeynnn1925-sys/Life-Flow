#!/bin/bash

echo "========================================="
echo "   Menyiapkan Aplikasi (Mac/Linux)       "
echo "========================================="

echo "[1/3] Menginstal dependensi (npm install)..."
npm install

if [ ! -f .env ]; then
    echo "[2/3] Membuat file .env dari .env.example..."
    cp .env.example .env
    echo "PENTING: Jangan lupa untuk mengisi API Key di dalam file .env jika diperlukan!"
else
    echo "[2/3] File .env sudah ada, melewati langkah ini."
fi

echo "[3/3] Menjalankan server lokal (npm run dev)..."
npm run dev
