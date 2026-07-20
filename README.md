# 🌙 Jurnal Malam v2

Jurnal harian pribadi yang aman, nyaman, dan tidak bikin cemas kehilangan data.

## Fitur

- ✅ **Mobile-first layout** — nyaman di HP dan laptop
- ✅ **Autosave draft** — tidak akan kehilangan tulisan saat tab ketutup
- ✅ **Konfirmasi hapus** — anti salah pencet
- ✅ **8 mood** — pilih mood setiap menulis
- ✅ **Pencarian tajam** — search + highlight + filter tanggal + filter mood
- ✅ **Streak** — lacak hari berturut-turut menulis
- ✅ **Statistik ringan** — distribusi mood, kata rata-rata, grafik 30 hari
- ✅ **Export ke Markdown** — unduh semua catatan kapan saja
- ✅ **Keyboard navigation** — Tab, Enter, Esc, Ctrl+Enter
- ✅ **Supabase + localStorage** — online & offline-ready

## Tech Stack

- React 19 + Vite
- Tailwind CSS 3
- Supabase (PostgreSQL)
- date-fns

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd jurnal-malam
npm install
```

### 2. Setup Supabase

1. Buat akun gratis di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor** di dashboard
4. Paste isi `supabase/schema.sql` dan klik **Run**
5. Buka **Settings → API**, copy:
   - **Project URL** → paste ke `VITE_SUPABASE_URL`
   - **anon public key** → paste ke `VITE_SUPABASE_ANON_KEY`

### 3. Environment Variables

```bash
cp .env.example .env
```

Isi `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Run

```bash
npm run dev
```

Buka http://localhost:5173

## Deploy ke Vercel

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Import repo
4. Tambah environment variables:
   - `VITE_SUPABASE_URL` = URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = Anon key Supabase
5. Deploy!

## Deploy ke Netlify

1. Push repo ke GitHub
2. Buka [netlify.com](https://netlify.com)
3. Import repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Tambah environment variables di Site Settings → Environment
7. Deploy!

## Catatan Keamanan

- Anon key Supabase aman untuk frontend (read-only by default)
- RLS diaktifkan dengan policy yang membolehkan semua operasi
- Karena single-user, keamanan datang dari privacy project Supabase
- Untuk extra aman, bisa tambahkan password/encryption di app layer

## Struktur Project

```
jurnal-malam/
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── JournalEditor.jsx
│   │   ├── EntryList.jsx
│   │   ├── EntryDetail.jsx
│   │   ├── MoodSelector.jsx
│   │   ├── SearchBar.jsx
│   │   └── StatsPanel.jsx
│   ├── hooks/
│   │   └── useAutosave.js
│   ├── utils/
│   │   ├── storage.js   # Supabase + localStorage
│   │   ├── export.js    # Markdown export
│   │   └── streak.js    # Streak calculation
│   ├── lib/
│   │   └── supabase.js  # Supabase client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── schema.sql       # Database schema
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Lisensi

Personal use. Buat jurnalmu sendiri 🌙
