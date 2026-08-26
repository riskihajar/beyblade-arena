---
name: docs-update
description: "Update dokumentasi proyek (PRD.md, PROGRESS.md, README.md, QA.md, docs/*.md) berdasarkan perubahan Git terbaru. Aktivasi saat user meminta update docs, changelog, progress, atau setelah selesai implementasi fitur/bug fix yang signifikan; atau saat user mention update PRD, update PROGRESS, update README, update QA, update docs, changelog, release notes, dokumentasi."
---

# Documentation Update

Skill untuk mengupdate dokumentasi proyek berdasarkan perubahan kode terbaru yang tercatat di Git history.

## When to Apply

Aktivasi skill ini saat:

- User meminta update dokumentasi (PRD, PROGRESS, README, docs/)
- Setelah selesai implementasi fitur baru atau bug fix signifikan
- Sebelum release atau merge ke branch utama
- User menyebut "update docs", "update progress", "changelog", "release notes"

## File Dokumentasi

| File | Fungsi |
|------|--------|
| `PROGRESS.md` | Tracking implementasi per module, ringkasan progress, Git history |
| `PRD.md` | Product Requirements Document — arsitektur, model, flow, spec |
| `README.md` | Overview proyek, tech stack, instalasi, struktur, konvensi |
| `QA.md` | QA Checklist — test case per fitur, flowchart alur utama, status testing |
| `docs/*.md` | Dokumentasi teknis spesifik (coolify.md, easypanel.md, ui-color-guidelines.md) |

## Step-by-Step Workflow

### Step 1: Identify Changes (Identifikasi Perubahan)

1. Baca `PROGRESS.md` → cari section `## Git History`
2. Ambil **commit hash pertama** (paling atas) di daftar Git History — ini adalah commit terakhir yang sudah didokumentasikan
3. Jalankan command untuk mendapatkan commit baru:

```bash
git log --oneline <last_documented_hash>..HEAD
```

4. Jika tidak ada commit baru → tidak perlu update, selesai
5. Jika ada commit baru → lanjut ke Step 2

### Step 2: Analyze Changes (Analisis Perubahan)

1. Dari daftar commit baru, identifikasi:
   - **Fitur baru** (commit `feat:`)
   - **Bug fix** (commit `fix:`)
   - **Refactor** (commit `refactor:`)
   - **Perubahan docs** (commit `docs:`)
   - **Perubahan breaking** (perubahan model, migration, enum, contract)

2. Lihat file yang berubah untuk konteks lebih detail:

```bash
git diff --stat <last_documented_hash>..HEAD
```

3. Untuk perubahan yang complex, lihat diff spesifik:

```bash
git diff <last_documented_hash>..HEAD -- <file_path>
```

### Step 3: Update PROGRESS.md

Urutan update:

1. **Header** — Update tanggal di baris `> Tracking berdasarkan [PRD.md](./PRD.md) — terakhir diperbarui: DD MMM YYYY`
2. **Test count** — Jalankan `php artisan test --compact` dan update angka di header (`**Test suite:** X passed (Y assertions)`)
3. **Next focus** — Update jika fokus berikutnya sudah berubah
4. **Module tables** — Tambahkan baris baru untuk task baru, atau update status (`⬜` → `🔧` → `✅`)
5. **Cross-cutting & Non-Functional** — Tambahkan item baru jika ada
6. **Phase sections** — Update status item di Phase 2/3 jika relevan
7. **Ringkasan Progress** — Update tabel ringkasan (hitung ulang Selesai/In Progress/Belum/Total per kategori)
8. **MVP completion** — Update persentase dan deskripsi di bagian bawah ringkasan
9. **Git History** — Replace seluruh blok dengan 30 commit terbaru:

```bash
git log --oneline -30
```

> **PENTING:** Git History menampilkan max 30 commit terakhir. Format: `hash  message` (7-char hash, double space, message).

### Step 4: Update PRD.md (Jika Diperlukan)

Update PRD.md **hanya jika** ada perubahan pada:

- Model baru atau field baru pada model existing
- Flow baru (billing flow, deployment flow, dll.)
- Arsitektur berubah (komponen baru, integrasi baru)
- Enum baru atau enum case baru
- Contract/interface berubah
- Konvensi teknis berubah

**Aturan:**
- Jangan ubah section yang tidak terpengaruh perubahan
- Tambahkan field baru ke tabel model yang relevan
- Update status checklist (`[ ]` → `[x]`) di section MVP Features jika fitur selesai
- Update diagram ASCII jika arsitektur berubah

### Step 5: Update README.md (Jika Diperlukan)

Update README.md **hanya jika** ada perubahan pada:

- Tech stack (versi baru, library baru)
- Struktur project (folder baru, file penting baru)
- Environment variables baru
- Konvensi teknis baru
- Cara instalasi atau development workflow berubah

### Step 5b: Update QA.md (Jika Diperlukan)

Update QA.md **hanya jika** ada perubahan pada:

- Fitur baru yang perlu test case (tambah section atau checklist item baru)
- Route/endpoint baru atau berubah
- Flow/alur user berubah (update flowchart Mermaid)
- Field form baru atau validasi baru
- Precondition berubah untuk fitur existing

**Aturan:**
- Tambahkan test case baru di section yang relevan (jangan buat section baru kecuali ada fitur/halaman baru)
- Gunakan nomor berurutan (e.g. jika section terakhir `12.29`, tambahkan `12.30`)
- Status default `[ ]` (belum diuji)
- Update flowchart Mermaid jika ada perubahan alur
- Update tanggal di header QA.md

### Step 6: Update docs/*.md (Jika Diperlukan)

Update file di `docs/` **hanya jika** ada perubahan pada:

- `docs/coolify.md` — Perubahan CoolifyClient methods, flow provisioning, API endpoint baru
- `docs/easypanel.md` — Perubahan EasypanelProvider, mapping baru
- `docs/ui-color-guidelines.md` — Perubahan pada color system atau guidelines baru
- File baru — Jika ada integrasi/topik baru yang butuh dokumentasi teknis terpisah

### Step 7: Verify (Verifikasi)

1. Review semua file yang diubah — pastikan konsisten antar dokumen
2. Pastikan tidak ada informasi yang kontradiktif antar file
3. Pastikan format markdown valid (tabel, list, code block)
4. Pastikan link antar dokumen masih valid

## Rules

- **Bahasa:** Tulis dalam Bahasa Indonesia (mengikuti konvensi existing docs)
- **Append-only:** Jangan hapus item existing di PROGRESS.md — hanya update status atau tambah item baru
- **Akurasi:** Pastikan test count di-update dari output `php artisan test` yang sebenarnya
- **Tanggal:** Format tanggal: `DD MMM YYYY` (contoh: `07 Mar 2026`)
- **Konsistensi:** Gunakan emoji status yang sama: ✅ (selesai), 🔧 (in progress), ⬜ (belum), 🔒 (deferred)
- **Git History:** Max 30 commit, format `hash  message`, urutan terbaru di atas

## Common Pitfalls

- Lupa update tanggal di header PROGRESS.md
- Lupa update test count (mengandalkan angka lama)
- Menghapus item existing di progress table — selalu append, jangan delete
- Update PRD.md untuk perubahan kecil yang tidak mempengaruhi spec
- Inkonsistensi antara status di PROGRESS.md dan checklist di PRD.md
- Git History tidak di-update dengan commit terbaru
- Salah mengidentifikasi commit hash terakhir yang sudah didokumentasikan
