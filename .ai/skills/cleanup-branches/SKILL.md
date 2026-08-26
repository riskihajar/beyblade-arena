---
name: cleanup-branches
description: "Hapus branch yang sudah di-merge di local dan remote. Aktivasi saat user meminta cleanup branch, hapus branch lama, prune branch, atau setelah merge PR."
---

# Cleanup Merged Branches

Skill untuk membersihkan branch yang sudah di-merge ke `main`, baik di local maupun remote.

## When to Apply

Aktivasi skill ini saat:

- User meminta cleanup/hapus branch lama
- Setelah merge beberapa PR
- Repository terasa penuh dengan branch stale

## Workflow

### 1. Pastikan di Branch Main

```bash
git checkout main
git pull origin main
```

### 2. Prune Remote References

Hapus referensi remote yang sudah tidak ada di server:

```bash
git remote prune origin
```

### 3. Hapus Local Branches yang Sudah Merged

```bash
# List branch lokal yang sudah merged ke main
git branch --merged main | grep -v '^\* main$' | grep -v '^  main$'

# Hapus semua yang sudah merged
git branch --merged main | grep -v '^\* main$' | grep -v '^  main$' | xargs -r git branch -d
```

### 4. Hapus Remote Branches yang Sudah Merged

```bash
# List remote branch yang sudah merged ke main
git branch -r --merged main | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///'

# Hapus satu per satu
git branch -r --merged main | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

### 5. Verifikasi

```bash
echo "=== LOCAL ===" && git branch
echo "=== REMOTE ===" && git branch -r
```

## Rules

- **Hanya hapus branch yang sudah merged** — gunakan `--merged`, jangan `--no-merged`
- **Jangan hapus `main`** — selalu exclude dari daftar delete
- **Prune dulu** — jalankan `git remote prune origin` sebelum cek remote branches
- **Branch belum merged = jangan hapus** — jika ragu, list dulu tanpa delete

## Quick Reference

```bash
git checkout main && git pull
git remote prune origin
git branch --merged main | grep -v 'main' | xargs -r git branch -d
git branch -r --merged main | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

## Common Pitfalls

- Menghapus branch yang belum di-merge — selalu gunakan `--merged`, bukan `-D`
- Lupa `git pull` sebelum cek merged — branch terlihat belum merged padahal remote sudah
- Tidak prune dulu — stale references muncul sebagai branch aktif
