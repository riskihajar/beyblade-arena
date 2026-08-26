---
name: github-issue
description: "Membuat issue di GitHub menggunakan gh CLI. Aktivasi saat user meminta buat issue, report bug, feature request, task tracking, atau saat user mention issue, bug report, feature request, enhancement, gh issue, github issue."
---

# GitHub Issue via `gh` CLI

Skill untuk membuat issue di GitHub repository menggunakan `gh` CLI. Semua issue dibuat langsung dari terminal tanpa perlu buka browser.

## When to Apply

Aktivasi skill ini saat:

- User meminta pembuatan issue (bug, feature, task, improvement)
- Perlu tracking pekerjaan di GitHub Issues
- User menyebut "buat issue", "bug report", "feature request", "gh issue"

## Prerequisite

- `gh` CLI sudah ter-install dan authenticated (`gh auth status`)
- Repository sudah terhubung dengan remote GitHub

## Workflow

### 1. Tentukan Tipe Issue

| Tipe | Label | Prefix Title |
|------|-------|-------------|
| Bug | `bug` | `fix:` atau `bug:` |
| Feature | `enhancement` | `feat:` |
| Improvement | `improvement` | `refactor:` atau `chore:` |
| Task | `task` | `task:` |

### 2. Tulis Issue Body

Format body menggunakan Markdown. Sesuaikan template berdasarkan tipe:

#### Bug Report

```markdown
## Deskripsi

Penjelasan singkat bug yang terjadi.

## Langkah Reproduksi

1. Buka halaman X
2. Klik tombol Y
3. Error muncul

## Expected Behavior

Apa yang seharusnya terjadi.

## Actual Behavior

Apa yang terjadi saat ini.

## Konteks Teknis

- **File terkait:** `app/Services/FooService.php`, `app/Models/Bar.php`
- **Error:** `ErrorClass: pesan error`
- **Kondisi:** Terjadi saat X bernilai Y

## Solusi yang Diusulkan

Langkah teknis untuk menyelesaikan bug ini (jika sudah diketahui).
```

#### Feature Request

```markdown
## Deskripsi

Penjelasan singkat fitur yang dibutuhkan dan alasannya.

## Acceptance Criteria

- [ ] Kriteria 1
- [ ] Kriteria 2
- [ ] Kriteria 3

## Scope Teknis

- **Model:** Model baru atau perubahan pada model existing
- **Migration:** Field baru yang dibutuhkan
- **Service:** Logic bisnis yang perlu diimplementasi
- **UI:** Halaman atau komponen yang terpengaruh
- **Test:** Test case yang perlu ditulis

## Catatan

Informasi tambahan, referensi, atau constraint yang perlu diperhatikan.
```

#### Task / Improvement

```markdown
## Deskripsi

Penjelasan teknis pekerjaan yang perlu dilakukan.

## Scope

- [ ] Item 1
- [ ] Item 2

## File Terdampak

- `path/to/file.php`
- `path/to/other.php`

## Catatan

Konteks tambahan atau dependensi.
```

### 3. Buat Issue via `gh`

> **PENTING:** Untuk body multiline (lebih dari 1 baris), **selalu** tulis body ke file terlebih dahulu lalu gunakan `--body-file`. Jangan gunakan `--body` dengan heredoc atau string multiline karena menyebabkan masalah shell quoting dan command hang.

```bash
# Step 1: Tulis body ke temp file
# (gunakan write_to_file tool ke /tmp/gh-issue-body.md)

# Step 2: Buat issue dengan --body-file
gh issue create \
  --title "fix: deskripsi singkat bug" \
  --body-file /tmp/gh-issue-body.md \
  --label "bug"

# Feature request
gh issue create \
  --title "feat: deskripsi singkat fitur" \
  --body-file /tmp/gh-issue-body.md \
  --label "enhancement"

# Untuk body pendek (1 baris), boleh pakai --body langsung
gh issue create \
  --title "fix: typo di halaman login" \
  --body "Typo pada label tombol submit" \
  --label "bug"

# Dengan multiple labels
gh issue create \
  --title "feat: deskripsi" \
  --body-file /tmp/gh-issue-body.md \
  --label "enhancement" \
  --label "priority:high"

# Dengan assignee
gh issue create \
  --title "fix: deskripsi" \
  --body-file /tmp/gh-issue-body.md \
  --label "bug" \
  --assignee "@me"

# Dengan milestone
gh issue create \
  --title "feat: deskripsi" \
  --body-file /tmp/gh-issue-body.md \
  --label "enhancement" \
  --milestone "v1.0"
```

### 4. Verifikasi

Setelah issue dibuat, `gh` akan menampilkan URL issue. Sampaikan URL tersebut ke user.

```bash
# List issue terbaru untuk verifikasi
gh issue list --limit 5
```

## Rules

- **Bahasa title:** Gunakan Bahasa Inggris untuk title (konsisten dengan git commit convention)
- **Bahasa body:** Gunakan Bahasa Indonesia untuk body (kecuali user minta bahasa lain)
- **Title harus ringkas:** Maksimal 72 karakter, deskriptif, menggunakan prefix tipe (`fix:`, `feat:`, `refactor:`, `chore:`)
- **Body harus actionable:** Setiap issue harus jelas apa yang perlu dikerjakan, bukan hanya keluhan
- **Satu issue, satu concern:** Jangan gabungkan beberapa masalah tidak terkait dalam satu issue
- **Label wajib:** Setiap issue minimal punya 1 label tipe
- **Referensi file:** Jika sudah tahu file mana yang terdampak, cantumkan di body
- **Jangan duplikat:** Cek issue existing sebelum buat baru (`gh issue list --search "keyword"`)

## Opsi `gh issue create` yang Tersedia

| Flag | Fungsi |
|------|--------|
| `--title` | Judul issue (wajib) |
| `--body` | Isi issue inline — **hanya untuk body 1 baris** |
| `--body-file` | Isi issue dari file — **wajib untuk body multiline** |
| `--label` | Label (bisa multiple) |
| `--assignee` | Assign ke user (`@me` untuk self-assign) |
| `--milestone` | Milestone target |
| `--project` | GitHub Project board |

## Common Pitfalls

- **Menggunakan `--body` untuk multiline** — shell quoting menyebabkan command hang. Selalu pakai `--body-file` untuk body lebih dari 1 baris
- Title terlalu panjang atau tidak deskriptif — harus bisa dipahami tanpa buka detail
- Body tanpa langkah reproduksi untuk bug — reviewer tidak bisa memahami konteksnya
- Lupa cek issue existing — menghasilkan duplikat
- Mencampur beberapa concern dalam satu issue — sulit di-track dan di-close
- Tidak menyertakan label — issue sulit dikategorikan dan diprioritaskan
