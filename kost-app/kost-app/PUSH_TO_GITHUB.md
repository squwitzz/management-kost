# Push Project ke GitHub

Panduan step-by-step untuk push project Next.js ke GitHub.

## 📋 Persiapan

### 1. Pastikan Git Terinstall

```bash
git --version
```

Jika belum terinstall, download dari [git-scm.com](https://git-scm.com/)

### 2. Konfigurasi Git (Jika Belum)

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@example.com"
```

### 3. Buat Repository di GitHub

1. Login ke [github.com](https://github.com)
2. Klik tombol **"+"** di kanan atas > **"New repository"**
3. Isi form:
   - **Repository name**: `kost-management-frontend` (atau nama lain)
   - **Description**: "Aplikasi manajemen kost - Frontend Next.js"
   - **Visibility**: Private atau Public (pilih sesuai kebutuhan)
   - ❌ **JANGAN** centang "Initialize with README" (karena sudah ada)
4. Klik **"Create repository"**
5. **Simpan URL repository** yang muncul, contoh:
   ```
   https://github.com/username/kost-management-frontend.git
   ```

---

## 🚀 Push ke GitHub

### Opsi 1: Via Command Line (Recommended)

Jalankan command berikut di terminal/command prompt:

```bash
# 1. Masuk ke folder kost-app
cd kost-app

# 2. Initialize git repository
git init

# 3. Add semua file
git add .

# 4. Commit pertama
git commit -m "Initial commit: Kost Management System Frontend"

# 5. Rename branch ke main (jika perlu)
git branch -M main

# 6. Add remote repository (ganti dengan URL Anda)
git remote add origin https://github.com/username/kost-management-frontend.git

# 7. Push ke GitHub
git push -u origin main
```

### Opsi 2: Via GitHub Desktop

1. Download dan install [GitHub Desktop](https://desktop.github.com/)
2. Login dengan akun GitHub
3. File > Add Local Repository
4. Pilih folder `kost-app`
5. Klik "Publish repository"
6. Pilih nama dan visibility
7. Klik "Publish"

---

## 🔐 Authentication

### Jika Diminta Username & Password

GitHub tidak lagi support password authentication. Gunakan salah satu:

#### A. Personal Access Token (PAT)

1. Di GitHub, klik foto profil > Settings
2. Developer settings > Personal access tokens > Tokens (classic)
3. Generate new token (classic)
4. Beri nama: "Kost App Deploy"
5. Pilih scope: `repo` (full control)
6. Generate token
7. **COPY TOKEN** (tidak akan muncul lagi!)
8. Saat push, gunakan token sebagai password:
   - Username: `username-github-anda`
   - Password: `paste-token-disini`

#### B. SSH Key (Lebih Aman)

```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "email@example.com"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub

# 3. Di GitHub: Settings > SSH and GPG keys > New SSH key
# Paste public key

# 4. Test connection
ssh -T git@github.com

# 5. Change remote URL ke SSH
git remote set-url origin git@github.com:username/kost-management-frontend.git

# 6. Push
git push -u origin main
```

---

## ✅ Verifikasi

Setelah push berhasil:

1. Buka repository di GitHub
2. Pastikan semua file sudah terupload
3. Check file `.env` **TIDAK** ada (sudah di-ignore)
4. README.md terlihat di halaman utama

---

## 🔄 Update Selanjutnya

Setiap kali ada perubahan:

```bash
# 1. Check status
git status

# 2. Add perubahan
git add .

# 3. Commit dengan pesan yang jelas
git commit -m "Deskripsi perubahan"

# 4. Push ke GitHub
git push origin main
```

---

## 🌿 Branching Strategy (Optional)

Untuk development yang lebih terorganisir:

```bash
# Buat branch untuk fitur baru
git checkout -b feature/nama-fitur

# ... lakukan perubahan ...

# Commit perubahan
git add .
git commit -m "Add: nama fitur"

# Push branch
git push origin feature/nama-fitur

# Di GitHub, buat Pull Request
# Setelah review, merge ke main
```

---

## 📝 Commit Message Best Practices

Gunakan format yang jelas:

```bash
# Format: Type: Description

# Types:
git commit -m "Add: fitur baru X"
git commit -m "Fix: bug pada login"
git commit -m "Update: styling dashboard"
git commit -m "Remove: unused components"
git commit -m "Refactor: payment logic"
git commit -m "Docs: update README"
```

---

## 🚫 File yang Tidak Di-push

File berikut otomatis di-ignore (sudah ada di `.gitignore`):

- `node_modules/` - Dependencies
- `.next/` - Build output
- `.env*` - Environment variables (PENTING!)
- `*.log` - Log files
- `.DS_Store` - Mac system files

**PENTING**: Jangan pernah commit file `.env` yang berisi credentials!

---

## 🔗 Connect dengan Vercel

Setelah push ke GitHub:

1. Login ke [vercel.com](https://vercel.com)
2. New Project
3. Import dari GitHub
4. Pilih repository `kost-management-frontend`
5. Configure:
   - Framework: Next.js (auto-detect)
   - Root Directory: `./` (karena sudah di folder kost-app)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
7. Deploy!

Setiap push ke GitHub akan otomatis trigger deployment di Vercel.

---

## 🐛 Troubleshooting

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/username/repo.git
```

### Error: "failed to push some refs"

```bash
# Pull dulu, lalu push
git pull origin main --rebase
git push origin main
```

### Error: "Permission denied (publickey)"

Setup SSH key atau gunakan HTTPS dengan Personal Access Token.

### File Terlalu Besar

Jika ada file >100MB:

```bash
# Install Git LFS
git lfs install

# Track file besar
git lfs track "*.psd"
git lfs track "*.zip"

# Commit .gitattributes
git add .gitattributes
git commit -m "Add Git LFS"
```

---

## 📞 Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Vercel Docs](https://vercel.com/docs)

---

## ✅ Checklist

- [ ] Git terinstall dan terkonfigurasi
- [ ] Repository dibuat di GitHub
- [ ] File `.env` sudah di-ignore
- [ ] README.md sudah dibuat
- [ ] Git initialized di folder kost-app
- [ ] Remote origin sudah ditambahkan
- [ ] Push berhasil ke GitHub
- [ ] File terlihat di GitHub
- [ ] Ready untuk connect ke Vercel

Selamat! Project Anda sekarang sudah di GitHub! 🎉
