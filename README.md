# Kost Management System - Frontend

Aplikasi manajemen kost berbasis Next.js 16 dengan React 19, Tailwind CSS, dan Prisma.

## 🚀 Tech Stack

- **Framework**: Next.js 16.2.3
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 3.4
- **Database ORM**: Prisma 7.7
- **Language**: TypeScript 5
- **PDF Generation**: jsPDF

## 📋 Features

### Admin Features
- Dashboard dengan statistik real-time
- Manajemen kamar (tambah, edit, hapus)
- Manajemen penghuni
- Generate tagihan pembayaran otomatis
- Verifikasi pembayaran
- Kelola permintaan penghuni

### User Features
- Dashboard penghuni
- Lihat tagihan pembayaran
- Upload bukti pembayaran
- Buat permintaan (maintenance, dll)
- Update profil
- Notifikasi real-time

### PWA Features
- Installable sebagai aplikasi mobile
- Offline support
- Push notifications
- Service worker caching

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- MySQL database (untuk Prisma)

### Setup

1. Clone repository:
```bash
git clone <repository-url>
cd kost-app
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="mysql://user:password@localhost:3306/kost_db"
```

4. Setup Prisma:
```bash
npx prisma generate
npx prisma db push
```

5. Run development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
kost-app/
├── app/
│   ├── (admin)/          # Admin routes
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── rooms/
│   │       ├── residents/
│   │       ├── payments/
│   │       └── requests/
│   ├── (auth)/           # Auth routes
│   │   └── login/
│   ├── (dashboard)/      # User routes
│   │   ├── dashboard/
│   │   ├── payments/
│   │   ├── profile/
│   │   └── requests/
│   ├── components/       # Shared components
│   ├── lib/             # Utilities & hooks
│   ├── types/           # TypeScript types
│   └── layout.tsx       # Root layout
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
└── ...config files
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Utilities
npm run lint            # Run ESLint
npm run clear-cache     # Clear Next.js cache
npm run fresh-start     # Clear cache & start dev
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables
4. Deploy!

Lihat [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) untuk detail lengkap.

### Deploy to cPanel

Lihat [DEPLOY_CPANEL.md](../DEPLOY_CPANEL.md) untuk tutorial lengkap.

## 🔐 Environment Variables

### Required Variables

```env
# API Backend URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# App URL (for PWA)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Database (Prisma)
DATABASE_URL="mysql://user:password@host:3306/database"
```

### Optional Variables

```env
# Node Environment
NODE_ENV=production

# Analytics (if using)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 📱 PWA Configuration

App sudah dikonfigurasi sebagai PWA dengan:
- Service Worker (`public/sw.js`)
- Web Manifest (`public/manifest.json`)
- Offline support
- Install prompt

### Testing PWA

1. Build production: `npm run build && npm start`
2. Buka di Chrome
3. Check DevTools > Application > Service Workers
4. Test install prompt

## 🔄 Real-time Features

Aplikasi menggunakan polling untuk real-time updates:
- Dashboard statistics
- Payment notifications
- Request updates

Lihat `app/lib/useRealtime.ts` dan `app/lib/useRealtimeDashboard.ts`

## 🎨 Styling

- **Tailwind CSS** untuk utility-first styling
- **@tailwindcss/forms** untuk form styling
- Responsive design (mobile-first)
- Dark mode ready (tinggal enable)

## 🐛 Troubleshooting

### Hydration Errors
Lihat [HYDRATION_FIX.md](./HYDRATION_FIX.md)

### Login Issues
Lihat [FIX_LOGIN_ERROR.md](./FIX_LOGIN_ERROR.md)

### Notification Issues
Lihat [NOTIFICATION_FIX.md](./NOTIFICATION_FIX.md)

### Cache Issues
```bash
npm run clear-cache
rm -rf .next node_modules
npm install
```

## 📄 License

Private project - All rights reserved

## 👥 Authors

- Your Name

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.
