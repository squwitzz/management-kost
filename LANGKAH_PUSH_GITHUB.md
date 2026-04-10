# 🚀 Langkah-Langkah Push ke GitHub

Ikuti langkah berikut untuk push project ke GitHub.

---

## ⚡ Cara Cepat (Otomatis)

### Windows:
1. Double-click file `setup-and-push.bat`
2. Ikuti instruksi yang muncul
3. Selesai!

### Mac/Linux:
```bash
bash setup-and-push.sh
```

---

## 📝 Cara Manual (Step by Step)

### Langkah 1: Setup Git Config

Buka terminal/command prompt di folder `kost-app`, lalu jalankan:

```bash
# Ganti dengan email GitHub Anda
git config --global user.email "email@example.com"

# Ganti dengan nama Anda
git config --global user.name "Nama Anda"
```

### Langkah 2: Buat Repository di GitHub

1. Buka [github.com](https://github.com) dan login
2. Klik tombol **"+"** di kanan atas
3. Pilih **"New repository"**
4. Isi form:
   - **Repository name**: `kost-management-frontend`
   - **Description**: "Aplikasi manajemen kost - Frontend Next.js"
   - **Visibility**: Private (atau Public)
   - ❌ **JANGAN centang** "Add a README file"
5. Klik **"Create repository"**
6. **COPY URL** yang muncul, contoh:
   ```
   https://github.com/username/kost-management-frontend.git
   ```

### Langkah 3: Add & Commit Files

Di terminal, jalankan:

```bash
# Pastikan Anda di folder kost-app
cd kost-app

# Add semua file
git add .

# Commit
git commit -m "Initial commit: Kost Management System Frontend"

# Rename branch ke main
git branch -M main
```

### Langkah 4: Add Remote & Push

```bash
# Add remote (ganti URL dengan URL repository Anda)
git remote add origin https://github.com/username/kost-management-frontend.git

# Push ke GitHub
git push -u origin main
```

### Langkah 5: Authentication

Saat push, Anda akan diminta login:

**Username**: username GitHub Anda

**Password**: JANGAN gunakan password biasa! Gunakan **Personal Access Token**

#### Cara Buat Personal Access Token:

1. Di GitHub, klik foto profil > **Settings**
2. Scroll ke bawah > **Developer settings**
3. **Personal access tokens** > **Tokens (classic)**
4. **Generate new token (classic)**
5. Isi form:
   - **Note**: "Kost App Deploy"
   - **Expiration**: 90 days (atau sesuai kebutuhan)
   - **Select scopes**: Centang **repo** (full control)
6. Klik **Generate token**
7. **COPY TOKEN** (tidak akan muncul lagi!)
8. Paste token sebagai password saat push

---

## ✅ Verifikasi

Setelah push berhasil:

1. Buka repository di GitHub
2. Refresh halaman
3. Pastikan semua file sudah ada
4. Check bahwa file `.env` **TIDAK ADA** (sudah di-ignore)

---

## 🎯 Next Steps

Setelah berhasil push ke GitHub:

### 1. Deploy ke Vercel

```bash
# Buka vercel.com dan login
# Klik "New Project"
# Import dari GitHub
# Pilih repository kost-management-frontend
# Set environment variables:
#   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Deploy!
```

Lihat detail lengkap di [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

### 2. Setup Auto-Deploy

Setiap kali Anda push ke GitHub, Vercel akan otomatis deploy:

```bash
# Buat perubahan
# ...

# Commit & push
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main

# Vercel akan otomatis deploy!
```

---

## 🐛 Troubleshooting

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/username/repo.git
```

### Error: "failed to push"

```bash
git pull origin main --rebase
git push origin main
```

### Error: "Permission denied"

- Pastikan menggunakan Personal Access Token, bukan password
- Check token masih valid (belum expired)
- Pastikan token punya scope `repo`

### Error: "Author identity unknown"

```bash
git config --global user.email "email@example.com"
git config --global user.name "Nama Anda"
```

---

## 📞 Butuh Bantuan?

Jika ada error atau masalah:

1. Copy error message lengkap
2. Check [GitHub Docs](https://docs.github.com)
3. Atau tanya di chat ini dengan detail error

---

## 🎉 Selesai!

Setelah berhasil push, project Anda sudah aman di GitHub dan siap untuk di-deploy ke Vercel!

**Repository URL**: https://github.com/username/kost-management-frontend

**Next**: Lihat [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) untuk deploy ke production!
