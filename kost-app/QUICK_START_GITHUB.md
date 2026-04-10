# ⚡ Quick Start: Push ke GitHub

## 🎯 Yang Perlu Anda Lakukan

### 1️⃣ Buat Repository di GitHub (2 menit)

1. Buka https://github.com/new
2. Repository name: `kost-management-frontend`
3. Private atau Public (pilih sesuai kebutuhan)
4. ❌ JANGAN centang "Add README"
5. Create repository
6. **COPY URL** yang muncul

### 2️⃣ Setup Git Config (1 menit)

Buka terminal di folder `kost-app`:

```bash
git config --global user.email "email-github-anda@example.com"
git config --global user.name "Nama Anda"
```

### 3️⃣ Push ke GitHub (2 menit)

```bash
# Add & commit
git add .
git commit -m "Initial commit: Kost Management System"

# Rename branch
git branch -M main

# Add remote (ganti dengan URL Anda!)
git remote add origin https://github.com/username/kost-management-frontend.git

# Push
git push -u origin main
```

### 4️⃣ Authentication

Saat diminta password, gunakan **Personal Access Token**:

**Cara buat token:**
1. GitHub > Settings > Developer settings
2. Personal access tokens > Tokens (classic)
3. Generate new token
4. Centang scope: `repo`
5. Generate & copy token
6. Paste sebagai password

---

## ✅ Selesai!

Buka repository di GitHub untuk verifikasi.

**Next**: Deploy ke Vercel (lihat DEPLOY_VERCEL.md)

---

## 🚀 Alternatif: Gunakan Script Otomatis

### Windows:
Double-click: `setup-and-push.bat`

### Mac/Linux:
```bash
bash setup-and-push.sh
```

Script akan otomatis setup dan push!

---

## 📚 Dokumentasi Lengkap

- Detail lengkap: [LANGKAH_PUSH_GITHUB.md](./LANGKAH_PUSH_GITHUB.md)
- Push manual: [PUSH_TO_GITHUB.md](./PUSH_TO_GITHUB.md)
- Deploy Vercel: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
