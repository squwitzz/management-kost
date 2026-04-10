#!/bin/bash

# Script untuk setup Git dan push ke GitHub
# Jalankan dengan: bash setup-and-push.sh

echo "==================================="
echo "Setup Git & Push ke GitHub"
echo "==================================="
echo ""

# 1. Setup Git Config
echo "📝 Step 1: Setup Git Configuration"
echo "Masukkan email GitHub Anda:"
read zonerixe24@gmail.com
echo "Masukkan nama Anda:"
read bakri

git config --global user.email "$git_email"
git config --global user.name "$git_name"

echo "✅ Git config berhasil!"
echo ""

# 2. Verify Git Status
echo "📋 Step 2: Checking Git Status"
git status
echo ""

# 3. Add all files
echo "➕ Step 3: Adding all files"
git add .
echo "✅ Files added!"
echo ""

# 4. Commit
echo "💾 Step 4: Creating commit"
git commit -m "Initial commit: Kost Management System Frontend"
echo "✅ Commit created!"
echo ""

# 5. Rename branch to main
echo "🌿 Step 5: Renaming branch to main"
git branch -M main
echo "✅ Branch renamed!"
echo ""

# 6. Add remote
echo "🔗 Step 6: Adding remote repository"
echo "Masukkan URL repository GitHub Anda:"
echo "Contoh: https://github.com/username/kost-management-frontend.git"
read repo_url

git remote add origin "$repo_url"
echo "✅ Remote added!"
echo ""

# 7. Push to GitHub
echo "🚀 Step 7: Pushing to GitHub"
echo "Anda akan diminta username dan password/token GitHub"
git push -u origin main

echo ""
echo "==================================="
echo "✅ SELESAI!"
echo "==================================="
echo ""
echo "Project berhasil di-push ke GitHub!"
echo "Buka repository Anda di: $repo_url"
echo ""
echo "Next steps:"
echo "1. Verifikasi di GitHub bahwa semua file sudah terupload"
echo "2. Deploy ke Vercel (lihat DEPLOY_VERCEL.md)"
echo ""
