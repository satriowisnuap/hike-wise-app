# Hike Wise - Platform Asisten Pendakian Gunung Pintar

## Deskripsi Proyek
Hike Wise adalah aplikasi asisten pendakian gunung berbasis web yang dirancang untuk membantu para pendaki merencanakan perjalanan mereka secara cerdas, aman, dan ramah lingkungan. Aplikasi ini memfasilitasi pendaki dalam menyusun rencana perjalanan (itinerary), memeriksa tingkat keselamatan jalur pendakian berdasarkan berbagai parameter fisik dan cuaca, menyusun daftar perlengkapan (packing list) yang dinamis, serta melacak dan menukarkan sampah yang dibawa turun menjadi poin ekologis (Eco Score) untuk mendorong pendakian yang berkelanjutan (sustainable mountaineering). 

Di sisi lain, Hike Wise juga menyediakan panel administrasi yang komprehensif bagi admin untuk mengelola database gunung Indonesia, memverifikasi laporan ekologis pendaki, mengelola pencapaian (achievements), serta memantau statistik pengguna secara real-time.

## Tech Stack (Teknologi yang Digunakan)
Aplikasi ini dibangun menggunakan teknologi modern:
- Framework Utama: Next.js 15.4.9 (App Router)
- Library UI: React 19.2.1
- Bahasa Pemrograman: TypeScript 5.9.3
- Database dan Autentikasi: Firebase 11.3.1 (Firestore untuk basis data, Firebase Auth untuk autentikasi pengguna, Firebase Storage untuk penyimpanan gambar)
- Styling: Tailwind CSS 4.1.11 dengan PostCSS dan Tailwind Typography
- Animasi: Motion 12.23.24 untuk interaksi UI yang dinamis dan halus
- Ikonografi: Lucide React 0.553.0
- Notifikasi: Sonner 2.0.1 untuk sistem toast notifications
- Integrasi AI: @google/genai 2.4.0 (untuk fungsionalitas kecerdasan buatan berbasis Gemini)

## Fitur Utama

### Fitur Pengguna (Hikers)
1. Dasbor Pengguna (User Dashboard): Menampilkan statistik pendakian pribadi, riwayat aktivitas terbaru, status trip yang akan datang, dan status Eco Score secara real-time.
2. Perencana Jalur Pintar (Smart Trail Planner): Menghasilkan rencana perjalanan (itinerary) harian yang disesuaikan secara otomatis berdasarkan durasi pendakian, jumlah anggota tim, tingkat pengalaman, dan tingkat kesulitan gunung.
3. Pemeriksa Keselamatan (Safety Checker): Menganalisis tingkat kelayakan pendakian ("GO", "CAUTION", atau "NO-GO") berdasarkan musim, perkiraan cuaca, kondisi fisik, ukuran kelompok, penggunaan pemandu lokal (guide), riwayat medis, dan tingkat pengalaman pendaki.
4. Generator Daftar Perlengkapan (Packing List Generator): Membuat daftar bawaan perlengkapan pribadi, kelompok, logistik, P3K, navigasi, hingga perlengkapan darurat secara dinamis yang disesuaikan dengan profil perjalanan (durasi, jumlah anggota, tingkat kesulitan gunung).
5. Pelacak Ekologis (Eco-Tracker): Memungkinkan pendaki melaporkan berat sampah yang dibawa turun untuk ditukarkan menjadi Eco Score guna melacak kontribusi lingkungan mereka.
6. Forum Komunitas (Community Forum): Sarana interaksi sosial antarpendaki untuk berbagi pengalaman, foto, tips pendakian, dan laporan kondisi jalur terbaru.
7. Pencapaian dan Lencana (Achievements and Badges): Sistem gamifikasi yang memberikan lencana khusus kepada pendaki saat berhasil menyelesaikan milestone tertentu (seperti menyelesaikan trip pertama, mengumpulkan total berat sampah tertentu, atau menyelesaikan sejumlah pemeriksaan keselamatan).

### Fitur Administrasi (Admin)
1. Dasbor Administrasi (Admin Dashboard): Memberikan statistik global mengenai total pendaki terdaftar, jumlah gunung dalam database, total sampah yang berhasil dikumpulkan dari gunung, dan aktivitas terbaru.
2. Manajemen Gunung (Mountain Management): Operasi CRUD database gunung-gunung di Indonesia meliputi nama, ketinggian, lokasi, deskripsi, tingkat kesulitan, tarif registrasi, dan foto.
3. Manajemen Laporan Ekologis dan Jalur (Reports and Eco Logs Approval): Meninjau dan memverifikasi laporan sampah atau kondisi jalur yang dikirim oleh pengguna, serta membuat laporan langsung dengan persetujuan otomatis apabila dibuat oleh admin.
4. Manajemen Pengguna (User Management): Memantau data pengguna aktif, peran (role), dan kontribusi ekologis mereka.
5. Manajemen Pencapaian (Achievements Management): Mengelola lencana dan kriteria pencapaian aktif dalam sistem.

## Struktur Direktori
Berikut adalah struktur folder utama dari proyek Hike Wise:
```
hike-wise/
├── app/                      # Next.js App Router (Direktori Halaman & API)
│   ├── (auth)/               # Rute yang memerlukan autentikasi
│   │   ├── admin/            # Panel Administrasi (Dashboard, Mountains, Users, Reports, Achievements)
│   │   └── user/             # Panel Pengguna (Dashboard, Planner, Safety Checker, Eco-Tracker, Packing List, My Trips, Community, Profile)
│   ├── (public)/             # Rute publik (Homepage, Login, Register, Kebijakan Privasi, Syarat & Ketentuan)
│   ├── api/                  # Rute API Backend (e.g., Upload Mountain Image)
│   ├── globals.css           # Styling global dan Tailwind CSS import
│   └── layout.tsx            # Root layout aplikasi
├── components/               # Komponen UI Reusable (Navbar, Footer, Sidebar, Custom Select, Avatar, Hero, dll.)
├── hooks/                    # Custom React Hooks
├── lib/                      # Modul utilitas dan logika bisnis
│   ├── achievement-checker.ts# Logika pemeriksaan dan pemberian pencapaian otomatis
│   ├── auth-context.tsx      # Context provider untuk Firebase Authentication
│   ├── firebase.ts           # Inisialisasi Firebase App, Auth, Firestore, dan Storage
│   ├── packing-list.ts       # Algoritma penentuan daftar perlengkapan dinamis
│   ├── safety-checker.ts     # Logika kalkulasi skor keselamatan pendakian
│   ├── storage.ts            # Utilitas interaksi penyimpanan berkas Firebase
│   └── trail-planner.ts      # Algoritma pembuat rencana perjalanan (itinerary) harian
├── public/                   # Aset statis (gambar, logo)
├── types/                    # Definisi tipe TypeScript
├── firestore.rules           # Aturan keamanan database Firebase Firestore
├── firestore.indexes.json    # Konfigurasi indeks database Firestore
├── firebase.json             # Konfigurasi deploy Firebase Hosting / Services
├── package.json              # Daftar ketergantungan (dependencies) dan skrip npm
└── tsconfig.json             # Konfigurasi compiler TypeScript
```

## Langkah Instalasi dan Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js (versi v18 atau yang lebih baru direkomendasikan)
- Akun Firebase (untuk Firestore, Auth, dan Storage)

### Langkah-langkah
1. Klon Repositori
   ```bash
   git clone <url-repositori>
   cd hike-wise
   ```

2. Instalasi Dependensi
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables
   Buat file `.env.local` di direktori utama dan isi dengan konfigurasi Firebase serta API Key Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="kunci_api_firebase_anda"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="domain_auth_firebase_anda"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="id_proyek_firebase_anda"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="bucket_storage_firebase_anda"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="sender_id_firebase_anda"
   NEXT_PUBLIC_FIREBASE_APP_ID="app_id_firebase_anda"
   GEMINI_API_KEY="kunci_api_gemini_anda"
   ```

4. Menjalankan Server Pengembangan (Dev Server)
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000 di browser Anda untuk melihat aplikasi berjalan.

5. Membangun Aplikasi untuk Produksi
   ```bash
   npm run build
   ```

6. Menjalankan Build Produksi
   ```bash
   npm run start
   ```

## Kontribusi
Proyek ini dikembangkan dengan fokus pada integrasi asisten digital untuk mendukung pariwisata berkelanjutan dan keselamatan aktivitas luar ruangan di Indonesia.
