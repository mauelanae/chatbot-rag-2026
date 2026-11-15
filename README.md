# chatbot-rag-2026

# 🪟 PANDUAN LENGKAP INSTALASI & MENJALANKAN PROYEK DI WINDOWS
### *Chatbot RAG Pendidikan Lingkungan Hidup (PLH)*

Dokumen ini berisi panduan langkah demi langkah (*step-by-step*) untuk menginstal dan menjalankan proyek Chatbot RAG (Backend Flask & Frontend React Vite) di sistem operasi **Windows 10 / Windows 11**.

---

## 📋 DAFTAR ISI
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Download / Clone Proyek](#2-download--clone-proyek)
3. [Setup & Instalasi Backend (Python Flask)](#3-setup--instalasi-backend-python-flask)
4. [Konfigurasi File Environment (.env)](#4-konfigurasi-file-environment-env)
5. [Setup & Instalasi Frontend (React + Vite + Tailwind)](#5-setup--instalasi-frontend-react--vite--tailwind)
6. [Menjalankan Aplikasi Secara Bersamaan](#6-menjalankan-aplikasi-secara-bersamaan)
7. [Solusi Masalah Umum di Windows (Troubleshooting)](#7-solusi-masalah-umum-di-windows-troubleshooting)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan dua perangkat lunak berikut telah terpasang di komputer Windows Anda:

### A. Python (Versi 3.10, 3.11, atau 3.12 Disarankan)
1. Unduh installer resmi dari [python.org/downloads](https://www.python.org/downloads/).
2. ⚠️ **SANGAT PENTING:** Saat menjalankan file instalasi `.exe`, beri tanda centang pada opsi:
   > `☑ Add python.exe to PATH` (berada di bagian paling bawah tampilan awal installer).
3. Klik **Install Now**.
4. Buka **Command Prompt (CMD)** atau **PowerShell**, lalu ketik untuk mengecek:
   ```cmd
   python --version
   ```

### B. Node.js (Versi LTS Disarankan: v18, v20, atau v22)
1. Unduh installer Node.js LTS dari [nodejs.org](https://nodejs.org/).
2. Jalankan instalasi hingga selesai (klik Next sampai Finish).
3. Verifikasi instalasi di CMD/PowerShell:
   ```cmd
   node -v
   npm -v
   ```

---

## 2. Download / Clone Proyek

Buka folder proyek Anda di Windows Explorer. Struktur folder utama harus terlihat seperti ini:

```text
Chatbot RAG/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── services/
│   ├── uploads/
│   └── storage/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── index.html
└── MATERI/
```

---

## 3. Setup & Instalasi Backend (Python Flask)

Buka terminal **Command Prompt (CMD)** atau **PowerShell**, lalu arahkan ke folder `backend`:

### Langkah 1: Masuk ke direktori backend
```cmd
cd "path\ke\folder\Chatbot RAG\backend"
```
*(Contoh: `cd C:\PROJECT\Chatbot RAG\backend`)*

---

### Langkah 2: Membuat Virtual Environment (`venv`)
Virtual environment berfungsi mengisolasi library agar tidak bercampur dengan library global di Windows.

```cmd
python -m venv venv
```
*Tunggu beberapa detik hingga folder baru bernama `venv` muncul di dalam folder `backend`.*

---

### Langkah 3: Mengaktifkan Virtual Environment di Windows

Pilih salah satu sesuai terminal yang Anda gunakan:

#### Jika Menggunakan Command Prompt (CMD):
```cmd
venv\Scripts\activate
```

#### Jika Menggunakan PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```
> 💡 *Catatan:* Jika muncul pesan error `running scripts is disabled on this system`, lihat solusi pada [Bab 7 (Troubleshooting)](#masalah-1-powershell-script-execution-policy-error).

*Tanda virtual environment berhasil aktif:* Akan muncul tanda `(venv)` di depan baris perintah Anda, contoh: `(venv) C:\Chatbot RAG\backend>`.

---

### Langkah 4: Memperbarui pip (Opsional tapi Disarankan)
```cmd
python -m pip install --upgrade pip
```

---

### Langkah 5: Menginstal Seluruh Library Backend
Jalankan perintah ini untuk menginstal semua dependensi dari file `requirements.txt`:

```cmd
pip install -r requirements.txt
```
Library yang akan diinstal meliputi:
- `Flask` & `Flask-CORS` (Web API Server)
- `Sentence-Transformers` (Model Embedding Lokal Multilingual)
- `Scikit-Learn` & `NumPy` (Algoritma KNN Vector Search)
- `PyPDF` & `Python-Docx` (Ekstraksi modul PDF & Word)
- `OpenAI` & `Python-Dotenv` (Koneksi LLM)

*Tunggu proses download hingga selesai (memerlukan koneksi internet).*

---

## 4. Konfigurasi File Environment (.env)

Pastikan ada file bernama `.env` di dalam folder `backend/`. Jika belum ada, buat file baru dengan nama `.env` di dalam folder `backend/` dengan isi sebagai berikut:

```env
ROUTER9_API_KEY=sk-8e506e2b3b3f00b8-6hvtaz-2b8a3ff5
ROUTER9_API_URL=https://siasistenai.online/v1
ROUTER9_MODEL_NAME=cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast
PORT=5000
```

> 📌 **Catatan:** Jangan ubah `ROUTER9_MODEL_NAME` ke model yang tidak aktif agar tidak terjadi error 500.

---

## 5. Setup & Instalasi Frontend (React + Vite + Tailwind)

Buka **jendela terminal baru** (biarkan terminal backend tetap terbuka).

### Langkah 1: Masuk ke direktori frontend
```cmd
cd "path\ke\folder\Chatbot RAG\frontend"
```
*(Contoh: `cd C:\PROJECT\Chatbot RAG\frontend`)*

---

### Langkah 2: Menginstal Dependensi Node.js
Jalankan perintah berikut:

```cmd
npm install
```
Perintah ini akan mengunduh React 19, Tailwind CSS v4, Lucide-React, dan Vite ke dalam folder `node_modules`.

---

## 6. Menjalankan Aplikasi Secara Bersamaan

Aplikasi membutuhkan **dua terminal berjalan bersamaan**: satu untuk Backend dan satu untuk Frontend.

---

### 🟢 Terminal 1: Menjalankan Backend (Flask API)

1. Pastikan Anda berada di folder `backend` dan virtual environment sudah aktif `(venv)`:
   ```cmd
   cd backend
   venv\Scripts\activate
   ```
2. Jalankan server Flask:
   ```cmd
   python app.py
   ```
3. Jika berhasil, akan muncul output:
   ```text
   * Running on all addresses (0.0.0.0)
   * Running on http://127.0.0.1:5000
   * Running on http://localhost:5000
   Press CTRL+C to quit
   ```
   *(Saat pertama kali dijalankan, model Sentence-Transformers akan mengunduh bobot embedding `paraphrase-multilingual-MiniLM-L12-v2` sekitar ~400MB. Proses ini hanya terjadi sekali saja).*

---

### 🟢 Terminal 2: Menjalankan Frontend (React Vite)

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```cmd
   cd frontend
   ```
2. Jalankan dev server Vite:
   ```cmd
   npm run dev
   ```
3. Output akan menampilkan link lokal:
   ```text
     VITE v8.3.8  ready in 180 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

---

### 🌐 Akses Aplikasi di Browser
Buka browser favorit Anda (Google Chrome / Microsoft Edge) dan ketik alamat:
👉 **`http://localhost:5173`**

Selamat! Antarmuka **Chatbot PLH Asisten Pintar** sudah aktif dan siap digunakan untuk tanya jawab materi.

---

## 7. Solusi Masalah Umum di Windows (Troubleshooting)

### Masalah 1: PowerShell Script Execution Policy Error
Saat menjalankan `.\venv\Scripts\Activate.ps1`, muncul pesan:
> *File ... cannot be loaded because running scripts is disabled on this system.*

**Penyebab:** Kebijakan keamanan default Windows PowerShell membatasi eksekusi skrip lokal.

**Solusi:**
Jalankan perintah ini di PowerShell sebelum aktivasi venv:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Setelah itu, ulangi perintah aktivasi:
```powershell
.\venv\Scripts\Activate.ps1
```
*(Atau gunakan saja terminal **Command Prompt / CMD** biasa yang tidak memiliki batasan ini).*

---

### Masalah 2: `python` tidak dikenali / `'python' is not recognized`
**Penyebab:** Opsi `Add to PATH` belum dicentang saat menginstal Python.

**Solusi:**
1. Buka kembali file installer Python `.exe`.
2. Pilih menu **Modify**.
3. Pastikan opsi `Add Python to environment variables` dicentang, lalu selesaikan instalasi.
4. Restart terminal CMD/PowerShell Anda.

---

### Masalah 3: Port 5000 Sudah Terpakai (Port Already in Use)
Jika port 5000 sudah digunakan oleh aplikasi lain di Windows:
1. Buka file `backend/.env`.
2. Ubah `PORT=5000` menjadi `PORT=5001`.
3. Buka file `frontend/src/App.jsx` dan `frontend/src/components/DatasetUploaderModal.jsx`, lalu ubah URL `http://localhost:5000` menjadi `http://localhost:5001`.

---

### Masalah 4: Gagal Terhubung ke Backend Server
Jika chatbot membalas: *"Koneksi ke backend Flask gagal"*:
1. Pastikan terminal pertama (`python app.py`) masih berjalan dan tidak ditutup.
2. Pastikan tidak ada pesan error merah di terminal backend.

---

### 💡 Ringkasan Perintah Cepat (Cheat Sheet)

| Bagian | Perintah Terminal Windows |
| :--- | :--- |
| **Buka Backend** | `cd backend` |
| **Aktifkan venv** | `venv\Scripts\activate` |
| **Start Backend** | `python app.py` |
| **Buka Frontend** | `cd frontend` |
| **Start Frontend** | `npm run dev` |
| **URL Browser** | `http://localhost:5173` |

