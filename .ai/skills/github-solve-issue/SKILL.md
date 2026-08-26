---
name: github-solve-issue
description: "Pick issue dari GitHub, implementasi solusi sampai selesai, commit, push, dan buat Pull Request. Aktivasi saat user meminta solve issue, pick issue, fix issue, implement issue, kerjakan issue, PR, pull request, atau saat user mention solve, pick, implement, kerjakan, selesaikan issue."
---

# Solve GitHub Issue End-to-End

Skill untuk mengambil issue dari GitHub, mengimplementasikan solusi, dan membuat Pull Request — satu siklus penuh dari issue sampai PR.

## Aturan Sesi

- **Satu issue per sesi.** Dalam satu sesi percakapan, hanya boleh mengerjakan **1 issue**. Setelah PR dibuat, stop dan laporkan hasilnya ke user.
- **Loop hanya jika diminta.** Jika user secara eksplisit meminta "kerjakan semua" atau "lanjut ke issue berikutnya", baru boleh pick issue berikutnya dalam sesi yang sama. Ulangi workflow dari Step 1.
- **Jangan auto-lanjut.** Setelah 1 issue selesai, selalu tunggu instruksi user sebelum pick issue berikutnya.

## When to Apply

Aktivasi skill ini saat:

- User meminta untuk mengerjakan/solve issue tertentu
- User memberikan nomor issue atau URL issue
- User meminta pick issue dari backlog dan selesaikan

## Workflow

### 1. Ambil Detail Issue

**Jika user menyebutkan nomor issue spesifik:**

```bash
gh issue view <nomor_issue>
```

**Jika user tidak spesifik ("pick issue" / "kerjakan issue"):**

Ambil daftar issue terbuka lalu pilih satu berdasarkan strategi berikut:

```bash
gh issue list --limit 20 --state open --json number,title,labels,body
```

**Strategi auto-pick (urutan prioritas):**

1. **Priority label** — `priority:critical` > `priority:high` > `priority:medium` > `priority:low` > tanpa label prioritas
2. **Scope terkecil** — Jika prioritas sama, pilih issue dengan scope paling kecil (paling sedikit file terdampak, paling jelas requirement-nya). Ukur dari:
   - Jumlah acceptance criteria / checklist items
   - Apakah scope sudah jelas atau masih ambigu
   - Apakah bisa diselesaikan tanpa klarifikasi tambahan
3. **Bug sebelum feature** — Jika priority dan scope setara, bug fix didahulukan

> **Jika semua issue terlihat besar/ambigu**, sampaikan daftar ke user dan minta dipilih. Jangan memaksakan pick issue yang requirement-nya tidak jelas.

Setelah issue terpilih, baca secara menyeluruh:
- **Title** — Pahami scope pekerjaan
- **Body** — Pahami requirement, acceptance criteria, dan konteks teknis
- **Labels** — Identifikasi tipe (bug/feature/refactor) dan prioritas
- **Comments** — Cek diskusi tambahan atau klarifikasi

**Evaluasi scope sebelum mulai implementasi:**

Jika issue terlalu besar (banyak acceptance criteria, melibatkan banyak file/domain, atau estimasi lebih dari 1 sesi), **jangan langsung implementasi**. Pecah menjadi beberapa issue kecil yang bisa dikerjakan berurutan:

1. Gunakan skill `/github-issue` untuk membuat sub-issue yang lebih kecil dan fokus
2. Setiap sub-issue harus bisa di-implementasi, di-test, dan di-merge secara independen
3. Urutkan sub-issue berdasarkan dependensi (fondasi dulu, lalu yang bergantung padanya)
4. Referensikan issue induk di body setiap sub-issue (contoh: "Part of #42")
5. Sampaikan daftar sub-issue ke user, lalu kerjakan satu per satu

> **PENTING:** Lebih baik menyelesaikan 1 issue kecil secara tuntas daripada mengerjakan 1 issue besar setengah-setengah. Implementasi yang tidak lengkap lebih berbahaya daripada belum mulai sama sekali.

### 2. Buat Branch

Naming convention branch berdasarkan tipe issue:

| Tipe | Format Branch |
|------|--------------|
| Bug | `fix/<nomor>-<deskripsi-singkat>` |
| Feature | `feature/<nomor>-<deskripsi-singkat>` |
| Refactor | `refactor/<nomor>-<deskripsi-singkat>` |
| Chore | `chore/<nomor>-<deskripsi-singkat>` |

```bash
# Pastikan di branch terbaru
git checkout main
git pull origin main

# Buat branch baru
git checkout -b feature/<nomor>-<deskripsi-singkat>
```

> **Deskripsi singkat** menggunakan kebab-case, max 4-5 kata. Contoh: `feature/42-add-export-csv`, `fix/57-billing-race-condition`.

### 3. Implementasi

Kerjakan solusi sesuai requirement di issue. Ikuti aturan berikut:

- **Pahami konteks** — Baca file terkait sebelum mulai coding
- **Ikuti konvensi** — Cek sibling files untuk pattern yang sudah ada
- **Satu concern per commit** — Jangan campur perubahan tidak terkait
- **Test wajib** — Setiap perubahan harus punya test (lihat skill `pest-testing`)
- **Lint** — Jalankan `vendor/bin/pint --dirty --format agent` sebelum commit
- **Aktivasi skill terkait** — Gunakan skill lain sesuai domain (livewire, fluxui, tailwindcss, fortify, pest-testing)

### 4. Commit

Gunakan conventional commit format. Sertakan referensi issue di body atau footer.

```bash
# Format commit message
git commit -m "feat: deskripsi perubahan (#<nomor_issue>)"

# Contoh
git commit -m "feat: add CSV export for billing records (#42)"
git commit -m "fix: prevent race condition on billing charge (#57)"

# Untuk perubahan besar, gunakan body
git commit -m "feat: implement webhook retry mechanism (#31)

- Add RetryWebhookJob with exponential backoff
- Track retry count di webhook_logs
- Max 3 retries, interval 10s/30s/60s
- 12 tests"
```

**Aturan commit:**
- Title max 72 karakter
- Gunakan prefix: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`
- Referensi issue number di title atau body
- Body menjelaskan **apa dan kenapa**, bukan **bagaimana**

### 5. Push

```bash
git push -u origin <nama-branch>
```

### 6. Buat Pull Request

> **PENTING:** Selalu tulis PR body ke file terlebih dahulu lalu gunakan `--body-file`. Jangan gunakan `--body` dengan heredoc atau string multiline karena menyebabkan masalah shell quoting dan command hang.

```bash
# Step 1: Tulis PR body ke temp file (gunakan write_to_file tool ke /tmp/gh-pr-body.md)
# Isi template:
#
# ## Summary
# Penjelasan singkat apa yang dikerjakan dan kenapa.
# Closes #<nomor_issue>
#
# ## Changes
# - Perubahan 1
# - Perubahan 2
#
# ## Testing
# - [ ] Test baru ditambahkan
# - [ ] Test existing tetap pass
#
# ## Checklist
# - [ ] Code mengikuti konvensi project
# - [ ] `vendor/bin/pint` sudah dijalankan
# - [ ] Tidak ada perubahan yang tidak terkait

# Step 2: Buat PR dengan --body-file
gh pr create \
  --title "feat: deskripsi perubahan (#<nomor_issue>)" \
  --body-file /tmp/gh-pr-body.md \
  --base main
```

**Opsi tambahan yang berguna:**

```bash
# Assign reviewer
--reviewer username

# Assign ke diri sendiri
--assignee @me

# Label
--label "enhancement"

# Draft PR (belum siap review)
--draft

# Link ke issue (auto-close saat merge)
# Gunakan "Closes #XX" di body
```

> **PENTING:** Gunakan keyword `Closes #<nomor>` di body PR agar issue otomatis ter-close saat PR di-merge.

### 7. Monitor CI

Setelah PR dibuat, pantau status CI checks sampai selesai:

```bash
# Cek status CI checks
gh pr checks <nomor_pr> --watch
```

- Jika **semua checks green** ✅ → lanjut ke step 8 (Merge)
- Jika **ada yang fail** ❌ → baca log error, fix, commit, push. CI akan re-run otomatis. Ulangi monitoring.

> **Jangan merge jika ada CI yang masih running atau fail.** Tunggu sampai semua green.

### 8. Merge PR

Setelah semua CI checks green, merge PR:

```bash
# Merge dengan squash (default)
gh pr merge <nomor_pr> --squash --delete-branch

# Atau merge biasa jika commit history penting
gh pr merge <nomor_pr> --merge --delete-branch
```

> `--delete-branch` akan otomatis menghapus branch di remote setelah merge.

### 9. Cleanup Branch Lokal

Setelah merge, bersihkan branch lokal:

```bash
# Kembali ke main dan pull changes terbaru
git checkout main
git pull origin main

# Hapus branch lokal yang sudah di-merge
git branch -d <nama-branch>

# Prune remote tracking branches yang sudah dihapus
git fetch --prune
```

### 10. Sampaikan ke User

Setelah PR merged, sampaikan:
- URL Pull Request (sudah merged)
- Rangkuman perubahan yang dilakukan
- Jumlah test yang ditambahkan/dimodifikasi
- File-file utama yang berubah
- Status CI: all green ✅

## Quick Reference

```bash
# Siklus lengkap
gh issue view 42
git checkout main && git pull
git checkout -b feature/42-add-export-csv

# ... implementasi + test ...

vendor/bin/pint --dirty --format agent
php artisan test --compact --filter=ExportTest
git add -A
git commit -m "feat: add CSV export for billing records (#42)"
git push -u origin feature/42-add-export-csv
# Tulis PR body ke /tmp/gh-pr-body.md, lalu:
gh pr create --title "feat: add CSV export (#42)" --body-file /tmp/gh-pr-body.md --base main
# Monitor CI → Merge → Cleanup
gh pr checks <nomor_pr> --watch
gh pr merge <nomor_pr> --squash --delete-branch
git checkout main && git pull origin main
git branch -d feature/42-add-export-csv
git fetch --prune
```

## Common Pitfalls

- **Menggunakan `--body` untuk multiline** — shell quoting menyebabkan command hang. Selalu pakai `--body-file` untuk body lebih dari 1 baris
- **Merge saat CI masih running atau fail** — selalu tunggu semua checks green sebelum merge
- **Lupa cleanup branch** — branch menumpuk di local dan remote, sulit di-maintain
- Tidak baca issue secara menyeluruh — menghasilkan implementasi yang tidak sesuai requirement
- Branch dibuat dari branch lain (bukan `main`) — merge conflict yang tidak perlu
- Commit tanpa referensi issue — sulit di-track
- PR tanpa `Closes #XX` — issue tidak otomatis ter-close
- Lupa jalankan test dan pint sebelum push — CI gagal
- Mencampur fix/feature yang tidak terkait dalam satu PR — sulit di-review
- Push langsung ke `main` — selalu gunakan feature branch + PR
- Mengerjakan lebih dari 1 issue dalam satu sesi tanpa instruksi eksplisit — context window habis, kualitas turun
- Memaksakan pick issue yang requirement-nya ambigu — tanya user dulu
