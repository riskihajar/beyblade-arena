---
name: build-assets
description: "Build frontend assets (CSS/JS) dan commit ke branch main. Aktivasi saat user meminta build assets, compile CSS, compile JS, npm run build, bun run build, atau saat ada perubahan frontend yang perlu di-compile dan di-commit."
---

# Build & Commit Assets

Skill untuk build frontend assets, commit hasil build, dan push ke branch `main`.

## When to Apply

Aktivasi skill ini saat:

- User meminta build dan commit assets
- Ada perubahan CSS/JS yang perlu di-compile
- Deployment membutuhkan assets terbaru yang sudah di-build

## Workflow

### 1. Pastikan Branch

```bash
# Pastikan di branch main dan up-to-date
git checkout main
git pull origin main
```

### 2. Build Assets

Deteksi package manager dan jalankan build:

```bash
# Cek lockfile yang ada
# bun.lockb     → bun run build
# package-lock  → npm run build
# pnpm-lock     → pnpm run build
# yarn.lock     → yarn build
```

Jalankan build sesuai lockfile yang terdeteksi:

```bash
npm run build
# atau
bun run build
```

Pastikan build sukses tanpa error. Jika ada error, fix dulu sebelum lanjut.

### 3. Cek Perubahan

```bash
git status --short
```

Pastikan hanya file di `public/build/` yang berubah. Jika ada file lain yang berubah (misalnya source file), **jangan dicampur** — commit terpisah.

### 4. Commit & Push

```bash
git add public/build/
git commit -m "chore: rebuild frontend assets"
git push origin main
```

## Rules

- **Hanya commit build output** — `public/build/` saja, jangan campur dengan perubahan source code
- **Commit message konsisten** — Gunakan `chore: rebuild frontend assets`
- **Build harus sukses** — Jangan commit jika ada build error
- **Branch main** — Assets di-commit langsung ke main (bukan feature branch)

## Common Pitfalls

- Mencampur file build dengan perubahan source — harus commit terpisah
- Build gagal tapi tetap commit — selalu pastikan exit code 0
- Lupa `git pull` sebelum build — bisa conflict
