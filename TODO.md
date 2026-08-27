# TODO Implementasi — Beyblade Arena
# Rencana Eksekusi & Engineering Backlog

> **Tagline:** *"Putar, tanding, jadi juara."*  
> **Repository:** `beyblade-arena`  
> **Target Rilis:** MVP Komunitas Beyblade Samarinda  
> **Zona Waktu:** Asia/Makassar (WITA, UTC+8)  
> **Dokumen Terkait:** [`PRD.md`](./PRD.md), [`PROGRESS.md`](./PROGRESS.md), [`README.md`](./README.md)  
> **Standar Verifikasi:** `rtk proxy php artisan test --compact`, `npm run types`, `npm run lint`, `npm run format:check`, `npm run build`

---

## Ringkasan Fase Implementasi

```
Phase 0 ──> Phase 1 ──> Phase 2 ──> Phase 3 ──> Phase 4 ──> Phase 5 ──> Phase 6 ──> Phase 7 ──> Phase 8 ──> Phase 9
(Setup)    (Models)     (RBAC)      (Events)    (Reg/Deck)  (Engine)    (Judge)     (Public)    (Ranking)   (Release)
```

| Fase | Fokus Utama | Target Deliverable | Estimasi Task |
| --- | --- | --- | :---: |
| **Phase 0** | Repository alignment & security quick fixes | Saluran channel ULID, sanitasi search, setup seeders | 5 Task |
| **Phase 1** | Foundation & Domain Models | Migration tabel turnamen, Enums, Traits, & Factories | 8 Task |
| **Phase 2** | Auth, Role, & Policy Matrix | Permission Spatie, Authorization Policies, Proteksi PII | 6 Task |
| **Phase 3** | Event, Kategori, & Dynamic Ruleset | CRUD Event/Kategori, Config Finish Types & Target Points | 7 Task |
| **Phase 4** | Pendaftaran, Deck Lock, & Check-in | Form Publik, Consent, Wali Junior, Fast Check-in | 8 Task |
| **Phase 5** | Competition Engine | Single Elimination (Bye & Seed), Round Robin (Berger) | 7 Task |
| **Phase 6** | Stadium, Match Calling, & Judge Console | Panggilan Match, Pencegahan Bentrok, Konsol Juri Touch | 8 Task |
| **Phase 7** | Halaman Publik, Realtime, & Live Hub | Live Bracket, Standings, Call Board, Reverb Broadcast | 7 Task |
| **Phase 8** | Ranking Komunitas, Audit Log, & Ekspor | Musim Liga, Formula Berversi, Ekspor CSV/XLSX | 6 Task |
| **Phase 9** | QA, Hardening, Observability, & Release | Pest Test Suite, Pail/Audit Check, Alpha/Beta Dry Run | 6 Task |
| **Post-MVP**| Backlog Pengembangan Masa Depan | Swiss Pairing, QR Scan, OBS Overlay, WhatsApp Bot | 7 Task |

---

## Phase 0 — Repository Alignment dan Keputusan Dasar

- [ ] `TODO-001` `[Backend/Security]` Perbaiki perbandingan ULID pada channel broadcasting `routes/channels.php` dari casting `(int)` ke perbandingan string `(string) $user->id === (string) $id` agar otorisasi WebSocket Reverb berjalan aman. (FR-001, FR-042)
  - *Area:* `routes/channels.php`, `tests/Feature/BroadcastingChannelTest.php`
  - *Acceptance:* Private channel user berhasil diautentikasi dengan ID ULID 26-karakter string; test channel lulus.
- [ ] `TODO-002` `[Backend/Security]` Perketat `app/Http/Controllers/GlobalSearchController.php` agar tidak membocorkan data pengguna sembarangan dan batasi hasil pencarian user hanya untuk pengguna dengan permission `user.view`. (FR-002, FR-041)
  - *Area:* `app/Http/Controllers/GlobalSearchController.php`, `tests/Feature/GlobalSearchTest.php`
  - *Acceptance:* Request pencarian dari user non-admin tidak mengembalikan daftar email/user publik.
- [ ] `TODO-003` `[Backend/Config]` Verifikasi konfigurasi Timezone aplikasi di `config/app.php` dan buat helper format waktu standar Samarinda `Asia/Makassar` (WITA, UTC+8) untuk seluruh tampilan. (FR-006)
  - *Area:* `config/app.php`, `app/Support/TimezoneHelper.php` (usulan baru)
  - *Acceptance:* Waktu tersimpan UTC di database tetapi selalu terformat WITA (+08:00) pada representasi Inertia.
- [ ] `TODO-004` `[Docs/Config]` Perbarui `.env.example` dengan variabel konfigurasi default Beyblade Arena (nama aplikasi, default timezone, Reverb keys, disk storage). (FR-001)
  - *Area:* `.env.example`
  - *Acceptance:* File `.env.example` mencerminkan konfigurasi aplikasi turnamen.
- [ ] `TODO-005` `[Seed/Fixture]` Update `database/seeders/RolePermissionSeeder.php` dengan permission spesifik domain turnamen (`event.*`, `category.*`, `registration.*`, `bracket.*`, `match.*`, `stadium.*`, `deck.*`, `season.*`, `ranking.*`). (FR-002)
  - *Area:* `database/seeders/RolePermissionSeeder.php`
  - *Acceptance:* `php artisan db:seed --class=RolePermissionSeeder` berhasil mendaftarkan role `admin`, `organizer`, `judge`, dan permission terkait.

---

## Phase 1 — Foundation & Domain Models

- [ ] `TODO-006` `[Schema/Migration]` Buat migrasi tabel `community_profiles` dan model `app/Models/CommunityProfile.php` dengan trait `HasUlids`, `LogsActivity`. (FR-003)
  - *Area:* `database/migrations/*_create_community_profiles_table.php`, `app/Models/CommunityProfile.php`
  - *Acceptance:* Schema mendukung nama, deskripsi, sosial media, kontak, aturan umum, kode etik, dan disclaimer legal.
- [ ] `TODO-007` `[Schema/Migration]` Buat migrasi tabel `seasons` dan model `app/Models/Season.php` untuk menampung musim kompetisi komunitas. (FR-044, FR-045)
  - *Area:* `database/migrations/*_create_seasons_table.php`, `app/Models/Season.php`, `app/Enums/SeasonStatus.php`
  - *Acceptance:* Schema mendukung `id` ULID, `formula_version`, `formula_config` (JSON), dan status musim (`draft`, `active`, `concluded`, `archived`).
- [ ] `TODO-008` `[Schema/Migration]` Buat migrasi tabel `events` dan `tournament_categories` beserta model `app/Models/Event.php` dan `app/Models/TournamentCategory.php`. (FR-005, FR-007, FR-009)
  - *Area:* `database/migrations/*_create_events_table.php`, `database/migrations/*_create_tournament_categories_table.php`, `app/Models/Event.php`, `app/Models/TournamentCategory.php`, `app/Enums/EventStatus.php`, `app/Enums/TournamentFormat.php`, `app/Enums/MatchFormat.php`
  - *Acceptance:* Event dan Kategori terhubung via `foreignUlid()`; kategori menampung `ruleset_snapshot` JSON, `target_points`, `deck_slots_count`, dan `bracket_locked`.
- [ ] `TODO-009` `[Schema/Migration]` Buat migrasi tabel `community_bladers` dan `registrations` beserta model `app/Models/CommunityBlader.php` dan `app/Models/Registration.php`. (FR-013, FR-016)
  - *Area:* `database/migrations/*_create_community_bladers_table.php`, `database/migrations/*_create_registrations_table.php`, `app/Models/CommunityBlader.php`, `app/Models/Registration.php`, `app/Enums/RegistrationStatus.php`
  - *Acceptance:* Relasi Blader $\leftrightarrow$ Registration; status pendaftaran mendukung `pending`, `approved`, `waitlisted`, `rejected`, `withdrawn`, `checked_in`, `no_show`.
- [ ] `TODO-010` `[Schema/Migration]` Buat migrasi tabel privat `guardian_details` khusus data wali peserta junior dengan relasi 1:1 ke `registrations`. (FR-014)
  - *Area:* `database/migrations/*_create_guardian_details_table.php`, `app/Models/GuardianDetail.php`
  - *Acceptance:* Kolom nama wali, kontak, dan hubungan keluarga tersimpan terpisah dengan proteksi data pribadi.
- [ ] `TODO-011` `[Schema/Migration]` Buat migrasi tabel `decks` dan `deck_items` beserta model `app/Models/Deck.php` dan `app/Models/DeckItem.php`. (FR-017, FR-019)
  - *Area:* `database/migrations/*_create_decks_and_items_tables.php`, `app/Models/Deck.php`, `app/Models/DeckItem.php`
  - *Acceptance:* Mendukung multi-slot combo (Blade, Ratchet, Bit, berat, catatan), status `is_locked`, `locked_at`, dan `override_reason`.
- [ ] `TODO-012` `[Schema/Migration]` Buat migrasi tabel `stadiums`, `tournament_matches`, dan `match_battles`. (FR-030, FR-032, FR-035)
  - *Area:* `database/migrations/*_create_stadiums_matches_battles_tables.php`, `app/Models/Stadium.php`, `app/Models/TournamentMatch.php`, `app/Models/MatchBattle.php`, `app/Enums/MatchStatus.php`, `app/Enums/StadiumStatus.php`
  - *Acceptance:* Struktur match menampung relasi 2 blader, status panggilan, juri, skor agregat, ruleset snapshot, bracket pointer (`next_match_id`), dan catatan battle per ronde.
- [ ] `TODO-013` `[Schema/Migration]` Buat migrasi tabel `blader_season_points` dan model `app/Models/BladerSeasonPoint.php`. (FR-044, FR-046)
  - *Area:* `database/migrations/*_create_blader_season_points_table.php`, `app/Models/BladerSeasonPoint.php`
  - *Acceptance:* Menampung total poin, jumlah match menang/kalah, rank position, dan breakdown JSON.

---

## Phase 2 — Auth, Role, dan Privasi

- [ ] `TODO-014` `[Backend/RBAC]` Definisikan Role dan Permission resmi komunitas di `Database\Seeders\RolePermissionSeeder`:
  - `admin`: memiliki seluruh hak akses (`admin.access`, `community.*`, `season.*`, `event.*`, `category.*`, `registration.*`, `bracket.*`, `match.*`, `stadium.*`, `deck.*`, `ranking.*`, `audit.*`).
  - `organizer`: memiliki hak operasional event (`event.*`, `category.*`, `registration.*`, `bracket.*`, `match.*`, `stadium.*`, `deck.*`, `data.export`).
  - `judge`: memiliki hak akses lapangan (`match.score_input`, `deck.verify`, `match.view_assigned`). (FR-001, FR-002)
  - *Area:* `database/seeders/RolePermissionSeeder.php`
  - *Acceptance:* Seeder berhasil dijalankan dan diverifikasi melalui test `tests/Feature/RolePermissionTest.php`.
- [ ] `TODO-015` `[Backend/Policy]` Buat Policy authorization berbasis Laravel untuk seluruh model domain:
  - `app/Policies/EventPolicy.php`
  - `app/Policies/TournamentCategoryPolicy.php`
  - `app/Policies/RegistrationPolicy.php`
  - `app/Policies/TournamentMatchPolicy.php`
  - `app/Policies/DeckPolicy.php`
  - `app/Policies/SeasonPolicy.php` (FR-002)
  - *Area:* `app/Policies/*`
  - *Acceptance:* Setiap request aksi pada controller tervalidasi via `$this->authorize(...)` atau middleware `can:`.
- [ ] `TODO-016` `[Backend/Privacy]` Implementasikan sanitasi PII pada model `CommunityBlader`, `Registration`, dan `GuardianDetail` menggunakan properti `$hidden` dan Eloquent API resource khusus untuk memutus kebocoran data anak ke frontend. (FR-014, FR-041)
  - *Area:* `app/Models/CommunityBlader.php`, `app/Http/Resources/PublicBladerResource.php` (usulan baru)
  - *Acceptance:* Field `full_name`, `phone`, `birth_date`, dan `guardian_details` tidak pernah ada dalam JSON serialization untuk rute publik.
- [ ] `TODO-017` `[UI/Frontend]` Tambahkan navigasi menu khusus Admin/Organizer/Judge pada sidebar `resources/js/components/app-sidebar.tsx` berdasarkan `auth.permissions`. (FR-002)
  - *Area:* `resources/js/components/app-sidebar.tsx`
  - *Acceptance:* Juri hanya melihat menu "Judge Console"; Organizer melihat menu "Event Operations"; Admin melihat menu lengkap.
- [ ] `TODO-018` `[Tests]` Tulis Pest tests untuk memastikan otorisasi endpoint dan proteksi privasi data junior berjalan mutlak di sisi backend. (FR-002, FR-014)
  - *Area:* `tests/Feature/Tournament/AuthorizationAndPrivacyTest.php` (usulan baru)
  - *Acceptance:* Non-authorized user ditolak HTTP 403 saat mencoba mengakses data privat atau rute admin.
- [ ] `TODO-019` `[Docs]` Buat seeder akun default pengembangan: `admin@samarinda-beyblade.test`, `organizer@samarinda-beyblade.test`, dan `judge@samarinda-beyblade.test` di `database/seeders/UserSeeder.php`. (FR-001)
  - *Area:* `database/seeders/UserSeeder.php`
  - *Acceptance:* Panitia dev lokal dapat langsung login menggunakan akun pengujian yang terisolasi.

---

## Phase 3 — Event, Kategori, dan Ruleset

- [ ] `TODO-020` `[Backend/Domain]` Buat Controller dan Form Request untuk CRUD Event di area Admin/Organizer:
  - Controller: `app/Http/Controllers/Admin/EventController.php`
  - Requests: `StoreEventRequest.php`, `UpdateEventRequest.php` (FR-005, FR-006)
  - *Area:* `app/Http/Controllers/Admin/EventController.php`, `app/Http/Requests/Admin/Event/*`
  - *Acceptance:* Admin/Organizer dapat membuat, memperbarui metadata, mengunggah banner poster, dan mengubah status event.
- [ ] `TODO-021` `[Backend/Domain]` Buat Controller dan Form Request untuk CRUD Kategori Turnamen:
  - Controller: `app/Http/Controllers/Admin/TournamentCategoryController.php`
  - Requests: `StoreTournamentCategoryRequest.php`, `UpdateTournamentCategoryRequest.php` (FR-007, FR-009, FR-010, FR-017, FR-019)
  - *Area:* `app/Http/Controllers/Admin/TournamentCategoryController.php`, `app/Http/Requests/Admin/TournamentCategory/*`
  - *Acceptance:* Mendukung pemilihan format Single Elimination / Round Robin, target points, slot deck (1-3 slot), kebijakan `deck_lock_policy` (`until_checkin` [default], `until_top_cut`, `free_between_matches`), dan finish scoring ruleset dinamis.
- [ ] `TODO-022` `[Backend/Domain]` Implementasikan validasi *Ruleset Immutability*: Kategori menolak modifikasi ruleset skor jika sudah ada match yang berstatus bukan `Scheduled`. (FR-012)
  - *Area:* `app/Actions/Tournament/ValidateRulesetModificationAction.php` (usulan baru), `app/Http/Controllers/Admin/TournamentCategoryController.php`
  - *Acceptance:* Upaya mengubah poin finish saat turnamen berjalan mengembalikan HTTP 422 dengan pesan edukatif.
- [ ] `TODO-023` `[Backend/Seed]` Buat template ruleset standar default komunitas di `database/seeders/TournamentRulesetSeeder.php` (misal template Beyblade X: Spin 1, Over 2, Burst 2, Xtreme 3; dan template Burst: Spin 1, Over 1, Burst 2). (FR-009)
  - *Area:* `database/seeders/TournamentRulesetSeeder.php`
  - *Acceptance:* Admin dapat memilih template default atau menyesuaikan nilai poin saat membuat kategori baru.
- [ ] `TODO-024` `[UI/Frontend]` Buat halaman manajemen Event:
  - `resources/js/pages/admin/events/index.tsx` (List event dengan Frame, Filter, Badge status, Pagination)
  - `resources/js/pages/admin/events/create.tsx` (Inertia `<Form>`, InputGroup, DatePicker WITA, Tier Multiplier preset)
  - `resources/js/pages/admin/events/edit.tsx`
  - `resources/js/pages/admin/events/show.tsx` (Dashboard status event & ringkasan kategori) (FR-005, FR-006)
  - *Area:* `resources/js/pages/admin/events/*`
  - *Acceptance:* Mengikuti pola page structure repository (`Frame`, `Table`, `Inertia Form` render props).
- [ ] `TODO-025` `[UI/Frontend]` Buat modal/form konfigurasi Kategori Turnamen & Dynamic Ruleset Editor:
  - Editor daftar finish type dinamis (tambah, hapus, ubah label, ubah poin)
  - Pengaturan target poin, slot combo deck, deck lock policy (`until_checkin` / `until_top_cut` / `free_between_matches`), dan toggle juara 3. (FR-007, FR-009, FR-010)
  - *Area:* `resources/js/pages/admin/categories/create.tsx`, `resources/js/pages/admin/categories/edit.tsx`
  - *Acceptance:* Input dinamis jenis finish terkelola dengan state React dan dikirim via `transform` prop `<Form>`.
- [ ] `TODO-026` `[Tests]` Tulis Pest tests untuk lifecycle event, snapshot ruleset kategori, dan pencegahan edit ruleset saat turnamen aktif. (FR-005, FR-011, FR-012)
  - *Area:* `tests/Feature/Tournament/EventAndCategoryTest.php` (usulan baru)
  - *Acceptance:* 100% test scenario status transitions dan snapshot ruleset lulus.

---

## Phase 4 — Pendaftaran, Deck, dan Check-in

- [ ] `TODO-027` `[Backend/Domain]` Buat Controller dan Action pendaftaran publik untuk Blader/Guardian:
  - Action: `app/Actions/Tournament/RegisterBladerAction.php`
  - Controller: `app/Http/Controllers/Public/RegistrationPublicController.php` (FR-013, FR-014, FR-015, FR-016)
  - *Area:* `app/Actions/Tournament/RegisterBladerAction.php`, `app/Http/Controllers/Public/RegistrationPublicController.php`, `app/Http/Requests/Public/StoreRegistrationRequest.php`
  - *Acceptance:* Menerima pendaftaran guest, membuat/menghubungkan `CommunityBlader`, mengisi data wali jika usia < 13 tahun, mencatat persetujuan aturan/privasi/media, dan mengembalikan nomor registrasi unik.
- [ ] `TODO-028` `[Backend/Domain]` Implementasikan logika otomatisasi Kuota & Waitlist pada pendaftaran kategori turnamen. (FR-016)
  - *Area:* `app/Actions/Tournament/ProcessRegistrationQuotaAction.php`
  - *Acceptance:* Jika pendaftar melebihi `max_participants`, status otomatis diset `Waitlisted`; jika kuota tersedia, status diset `Approved`.
- [ ] `TODO-029` `[Backend/Domain]` Buat Controller manajemen pendaftaran untuk panitia (List, Filter, Manual Add On-site, Approve, Reject, Promote Waitlist):
  - Controller: `app/Http/Controllers/Admin/RegistrationManagementController.php` (FR-016, FR-022)
  - *Area:* `app/Http/Controllers/Admin/RegistrationManagementController.php`
  - *Acceptance:* Panitia dapat mengelola antrean pendaftar dan mempromosikan waitlist saat terjadi pembatalan.
- [ ] `TODO-030` `[Backend/Domain]` Buat Action & Controller Fast Check-in di Venue:
  - Action: `app/Actions/Tournament/PerformCheckinAction.php`
  - Controller: `app/Http/Controllers/Admin/CheckinController.php` (FR-020, FR-021, FR-019)
  - *Area:* `app/Actions/Tournament/PerformCheckinAction.php`, `app/Http/Controllers/Admin/CheckinController.php`
  - *Acceptance:* Menandai status `Checked-in` atau `No-show`, memicu penguncian deck (`is_deck_locked = true` sesuai kebijakan kategori), dan mencatat timestamp check-in.
- [ ] `TODO-031` `[Backend/Domain]` Implementasikan mekanisme *Override Deck Lock*: Mengizinkan Admin/Organizer mengubah part deck setelah terkunci hanya dengan alasan tertulis resmi dan mencatat ke `activity_log`. (FR-019)
  - *Area:* `app/Actions/Tournament/OverrideLockedDeckAction.php`, `app/Http/Controllers/Admin/DeckOverrideController.php` (usulan baru)
  - *Acceptance:* Percobaan edit tanpa otorisasi/alasan ditolak; perubahan part berhasil tercatat di audit log.
- [ ] `TODO-032` `[UI/Frontend]` Buat Form Pendaftaran Publik Mobile-First:
  - Form multi-step/accordion: Data Blader $\to$ Data Wali (kondisional) $\to$ Combo Deck $\to$ Checkbox Persetujuan Legal.
  - Tiket pendaftaran sukses dengan nomor registrasi dan instruksi check-in venue. (FR-013, FR-014, FR-015)
  - *Area:* `resources/js/pages/public/events/register.tsx`, `resources/js/pages/public/events/registration-success.tsx`
  - *Acceptance:* Responsif di layar smartphone, validasi inline error jelas, data wali wajib muncul jika usia junior.
- [ ] `TODO-033` `[UI/Frontend]` Buat Layar Meja Registrasi & Fast Check-in Venue:
  - Search bar instan (nama/nickname/nomor regis), filter kategori, quick buttons: `[Hadir / Check-in]`, `[No-Show]`, `[Promote Waitlist]`.
  - Dialog verifikasi fisik combo deck di meja registrasi. (FR-020, FR-021)
  - *Area:* `resources/js/pages/admin/checkin/index.tsx`, `resources/js/components/tournament/checkin-search-bar.tsx`
  - *Acceptance:* Pencarian instan < 100ms, transisi status visual mulus dengan feedback toast.
- [ ] `TODO-034` `[Tests]` Tulis Pest tests untuk pendaftaran publik, validasi wali anak, alur waitlist promotion, dan penegakan deck lock. (FR-013, FR-014, FR-019, FR-022)
  - *Area:* `tests/Feature/Tournament/RegistrationAndCheckinTest.php` (usulan baru)
  - *Acceptance:* Seluruh skenario happy path, failure path, dan edge case usia junior teruji.

---

## Phase 5 — Competition Engine

- [ ] `TODO-035` `[Backend/Domain]` Implementasikan Generator Bracket Single Elimination:
  - File: `app/Actions/Tournament/GenerateSingleEliminationBracketAction.php`
  - Fitur: Filter peserta `Checked-in` mutlak, kalkulasi jumlah $2^k$ slot bracket, penempatan otomatis Byes pada unggulan/posisi standar, dukungan random seed dan manual seed. (FR-023, FR-024)
  - *Area:* `app/Actions/Tournament/GenerateSingleEliminationBracketAction.php`
  - *Acceptance:* Menghasilkan relasi pohon match lengkap dengan `round_number`, `match_number`, `bracket_position`, dan pointer `next_match_id`.
- [ ] `TODO-036` `[Backend/Domain]` Implementasikan Generator Perebutan Juara 3 (Third-Place Play-off):
  - Menghubungkan loser dari kedua match semifinal ke match perebutan tempat ketiga jika `has_third_place_match = true`. (FR-026)
  - *Area:* `app/Actions/Tournament/GenerateSingleEliminationBracketAction.php`
  - *Acceptance:* Match perebutan juara 3 otomatis terbuat dan menampung loser semifinal.
- [ ] `TODO-037` `[Backend/Domain]` Implementasikan Progresi Pemenang Otomatis (Winner Progression):
  - File: `app/Actions/Tournament/ProgressBracketWinnerAction.php`
  - Fitur: Saat match berstatus `Completed`, pemenang otomatis diisi ke slot `blader_1_id` atau `blader_2_id` pada `next_match_id`. (FR-025)
  - *Area:* `app/Actions/Tournament/ProgressBracketWinnerAction.php`
  - *Acceptance:* Progresi otomatis mengisi babak berikutnya hingga babak Final.
- [ ] `TODO-038` `[Backend/Domain]` Implementasikan Generator Jadwal & Klasemen Round Robin (Satu Putaran):
  - Action Jadwal: `app/Actions/Tournament/GenerateRoundRobinScheduleAction.php` (menggunakan algoritma putaran Berger / Circle method).
  - Action Klasemen: `app/Actions/Tournament/CalculateRoundRobinStandingsAction.php` (menghitung MP, W, D, L, Pts, BP+, BP-, $\Delta BP$).
  - Tie-breaker: Memproses 5-level hierarki tie-break standar (1. Match Points > 2. Head-to-Head > 3. $\Delta BP$ > 4. $BP+$ > 5. Fewest Penalties > 6. Sudden Death Playoff/Toss). (FR-027, FR-028, FR-029)
  - *Area:* `app/Actions/Tournament/GenerateRoundRobinScheduleAction.php`, `app/Actions/Tournament/CalculateRoundRobinStandingsAction.php`
  - *Acceptance:* Jadwal adil tanpa ada peserta tanding ganda di putaran yang sama; klasemen terhitung deterministik.
- [ ] `TODO-039` `[Backend/Domain]` Implementasikan Kebijakan Penguncian & Regenerasi Aman Bagan (Bracket Lock & Safe Regeneration):
  - Kunci bracket saat turnamen dimulai (`bracket_locked = true`).
  - Regenerasi bracket terkunci hanya boleh via konfirmasi eksplisit Admin dengan alasan wajib dan log audit. (FR-024)
  - *Area:* `app/Actions/Tournament/RegenerateBracketAction.php`, `app/Http/Controllers/Admin/BracketController.php`
  - *Acceptance:* Proteksi dari reset tidak sengaja di tengah turnamen.
- [ ] `TODO-040` `[UI/Frontend]` Buat Komponen Visualizer Bracket Interaktif:
  - Komponen: `resources/js/components/tournament/bracket-viewer.tsx`
  - Halaman Admin: `resources/js/pages/admin/bracket/view.tsx`
  - Fitur: Zoom & pan interaktif, visualisasi node match, penanda Bye, status match (`Scheduled`, `Live`, `Completed`), sorotan pemenang, dan tombol Lock/Regenerate. (FR-024, FR-025)
  - *Area:* `resources/js/components/tournament/bracket-viewer.tsx`, `resources/js/pages/admin/bracket/view.tsx`
  - *Acceptance:* Render cepat dan mulus di desktop maupun tablet; node match dapat diklik untuk detail.
- [ ] `TODO-041` `[Tests]` Tulis Pest tests komprehensif untuk Single Elimination (berbagai jumlah peserta: 7, 8, 12, 16, 32, dsb.), Byes placement, Round Robin Berger algorithm, dan tie-breaker logic. (FR-023, FR-025, FR-027, FR-028)
  - *Area:* `tests/Feature/Tournament/BracketEngineTest.php`, `tests/Feature/Tournament/RoundRobinEngineTest.php` (usulan baru)
  - *Acceptance:* 100% assertions algoritma eliminasi dan round robin terverifikasi benar.

---

## Phase 6 — Judge Console dan Scoring

- [ ] `TODO-042` `[Backend/Domain]` Buat Controller dan Registry Manajemen Stadium:
  - Controller: `app/Http/Controllers/Admin/StadiumController.php`
  - Status: `available`, `in_use`, `maintenance`. (FR-030)
  - *Area:* `app/Http/Controllers/Admin/StadiumController.php`
  - *Acceptance:* CRUD stadium dan filter ketersediaan stadium untuk venue turnamen.
- [ ] `TODO-043` `[Backend/Domain]` Buat Service & Action Pemanggilan Match (Match Calling Queue) dengan Deteksi Bentrok:
  - Action: `app/Actions/Tournament/CallMatchToStadiumAction.php`
  - Service: `app/Services/MatchSchedulingConflictService.php` (FR-031, FR-032, FR-033)
  - *Area:* `app/Actions/Tournament/CallMatchToStadiumAction.php`, `app/Services/MatchSchedulingConflictService.php`
  - *Acceptance:* Menetapkan stadium dan juri ke match; mengaktifkan countdown call timeout 3 menit (180s); melempar exception/validasi jika salah satu blader sedang aktif tanding di stadium lain.
- [ ] `TODO-044` `[Backend/Domain]` Buat Action Pencatatan Battle Dinamis & Deteksi Target Poin Kemenangan:
  - Action: `app/Actions/Tournament/RecordMatchBattleAction.php`
  - Controller: `app/Http/Controllers/Judge/JudgeConsoleController.php` (FR-035, FR-036, FR-039)
  - *Area:* `app/Actions/Tournament/RecordMatchBattleAction.php`, `app/Http/Controllers/Judge/JudgeConsoleController.php`, `app/Http/Requests/Judge/StoreBattleRequest.php`
  - *Acceptance:* Menambah record `MatchBattle`, mengakumulasi skor match berdasarkan snapshot ruleset, mendeteksi pencapaian `target_points`, idempotent dengan `client_request_id`.
- [ ] `TODO-045` `[Backend/Domain]` Buat Action Penanganan Walkover (WO), Penalti, Draw/Rematch, dan Flagging Dispute:
  - Action: `app/Actions/Tournament/HandleWalkoverAction.php`
  - Action: `app/Actions/Tournament/HandleMatchDisputeAction.php` (FR-037, FR-038)
  - *Area:* `app/Actions/Tournament/HandleWalkoverAction.php`, `app/Actions/Tournament/HandleMatchDisputeAction.php`
  - *Acceptance:* Walkover dapat dieksekusi setelah batas waktu panggilan 3 menit (3x tahapan panggilan: 0:00, 1:30, 2:30) terlampaui; memberikan skor standar ke pemenang; dispute mengunci kelanjutan cabang bracket untuk peninjauan Head Judge.
- [ ] `TODO-046` `[Backend/Domain]` Implementasikan Logika Resolusi Koreksi Skor & Downstream Safety:
  - Action: `app/Actions/Tournament/CorrectMatchScoreAction.php` (FR-038, Aturan Bisnis 5)
  - *Area:* `app/Actions/Tournament/CorrectMatchScoreAction.php`
  - *Acceptance:* Koreksi skor aman: jika match berikutnya belum mulai, winner di-update otomatis; jika sudah berjalan, sistem menahan dan memunculkan dispute modal.
- [ ] `TODO-047` `[UI/Frontend]` Buat Antarmuka Judge Console Mobile-First:
  - Halaman: `resources/js/pages/judge/console.tsx`
  - Komponen: `resources/js/components/tournament/judge-score-pad.tsx`, `resources/js/components/tournament/sync-status-badge.tsx`
  - Fitur: Papan skor besar, nama blader & nickname, tombol sentuh finish types (Spin, Over, Burst, Xtreme, Penalti), tombol Draw/Rematch, tombol Walkover, tombol Dispute, notifikasi Match Point Reached, dan konfirmasi hasil akhir. (FR-034, FR-035, FR-036)
  - *Area:* `resources/js/pages/judge/console.tsx`, `resources/js/components/tournament/judge-score-pad.tsx`
  - *Acceptance:* Touch targets minimum $48\times 48\text{ px}$, kontras tinggi, navigasi satu tangan mudah di smartphone juri.
- [ ] `TODO-048` `[UI/Frontend]` Buat Layar Kontrol Panggilan Match (Match Call Board Admin):
  - Halaman: `resources/js/pages/admin/stadiums/index.tsx`
  - Fitur: Antrean match siap panggil, status stadium live, dropdown juri bertugas, tombol "Panggil ke Stadium", deteksi bentrok visual. (FR-030, FR-032, FR-033)
  - *Area:* `resources/js/pages/admin/stadiums/index.tsx`
  - *Acceptance:* Memudahkan petugas meja pertandingan mengatur alur stadium di venue.
- [ ] `TODO-049` `[Tests]` Tulis Pest tests untuk penghitungan skor battle, deteksi match point kemenangan, pencegahan bentrok blader, walkover, dan resolusi dispute. (FR-033, FR-035, FR-036, FR-037, FR-038)
  - *Area:* `tests/Feature/Tournament/JudgeScoringTest.php`, `tests/Feature/Tournament/MatchConflictTest.php` (usulan baru)
  - *Acceptance:* 100% skenario penilaian, draw battle, dan penanganan dispute tervalidasi.

---

## Phase 7 — Halaman Publik, Realtime, & Live Hub

- [ ] `TODO-050` `[Backend/Realtime]` Buat Event Broadcasting Laravel Reverb untuk pembaruan turnamen:
  - `app/Events/MatchCalledEvent.php` (Channel publik: `tournament.{eventId}.calls`)
  - `app/Events/BattleRecordedEvent.php` (Channel publik: `match.{matchId}.score`)
  - `app/Events/BracketUpdatedEvent.php` (Channel publik: `category.{categoryId}.bracket`)
  - `app/Events/EventStatusChangedEvent.php` (Channel publik: `tournament.{eventId}.status`) (FR-042)
  - *Area:* `app/Events/Tournament/*`
  - *Acceptance:* Broadcast terkirim otomatis saat status match, skor, atau bagan berubah.
- [ ] `TODO-051` `[UI/Frontend]` Buat Landing Page Publik Komunitas & Event:
  - Halaman Beranda: `resources/js/pages/welcome.tsx` (Showcase profil Komunitas Beyblade Samarinda, tagline, event mendatang, peraturan, link medsos, dan disclaimer non-afiliasi)
  - Halaman Detail Event: `resources/js/pages/public/events/show.tsx` (Info venue, maps, kategori, kuota, tombol pendaftaran). (FR-003, FR-006, FR-040)
  - *Area:* `resources/js/pages/welcome.tsx`, `resources/js/pages/public/events/show.tsx`
  - *Acceptance:* Tampilan modern, responsif, informatif, dan aman tanpa mengekspos data pribadi.
- [ ] `TODO-052` `[UI/Frontend]` Buat Layar Live Hub Turnamen Publik:
  - Halaman: `resources/js/pages/public/events/live-hub.tsx`
  - Tab:
    1. **Papan Panggilan Stadium (Live Call Board):** Menampilkan match aktif di Stadium A, B, C dan match berikutnya.
    2. **Live Bracket:** Bagan Single Elimination interaktif yang ter-update otomatis.
    3. **Live Standings:** Klasemen Round Robin grup.
    4. **Jadwal & Hasil:** Daftar seluruh match dengan skor publik. (FR-040, FR-041, FR-042)
  - *Area:* `resources/js/pages/public/events/live-hub.tsx`, `resources/js/components/tournament/stadium-call-board.tsx`
  - *Acceptance:* Penonton dapat melihat jalannya turnamen secara live tanpa perlu login akun.
- [ ] `TODO-053` `[Frontend/Echo]` Pasang hook Laravel Echo di React (`useEcho`, `useEchoPublic` via `@laravel/echo-react`) pada Live Hub publik untuk menerima update real-time Reverb dengan fallback graceful HTTP polling jika websocket offline. (FR-042)
  - *Area:* `resources/js/hooks/useTournamentRealtime.ts` (usulan baru)
  - *Acceptance:* Skor dan bracket ter-update seketika saat juri menginput hasil di stadium.
- [ ] `TODO-054` `[UI/Frontend]` Buat Halaman Podium Juara & Ringkasan Event:
  - Halaman: `resources/js/pages/public/events/podium.tsx`
  - Menampilkan Juara 1 (Emas), Juara 2 (Perak), Juara 3 (Perunggu), Top 4/Top 8, ringkasan jumlah battle, dan statistik finish type komunitas. (FR-043)
  - *Area:* `resources/js/pages/public/events/podium.tsx`
  - *Acceptance:* Desain visual menarik untuk dokumentasi dan apresiasi prestasi pemenang.
- [ ] `TODO-055` `[UI/Frontend]` Buat Halaman Profil Komunitas, Aturan Umum, & Kode Etik:
  - Halaman: `resources/js/pages/public/community.tsx` (Aturan main, panduan sportivitas, etika bertanding, dan disclaimer legalitas). (FR-003)
  - *Area:* `resources/js/pages/public/community.tsx`
  - *Acceptance:* Mengedukasi anggota baru dan menjaga sportivitas turnamen.
- [ ] `TODO-056` `[Tests]` Tulis Pest tests untuk endpoint publik guna memastikan respon HTTP 200, payload bersih dari PII, dan penanganan fallback status event. (FR-040, FR-041)
  - *Area:* `tests/Feature/Tournament/PublicLiveHubTest.php` (usulan baru)
  - *Acceptance:* Sanitasi data publik 100% terbukti pada response test assertion.

---

## Phase 8 — Ranking, Audit, dan Export

- [ ] `TODO-057` `[Backend/Domain]` Implementasikan Service Engine Perhitungan Ranking Musim Komunitas:
  - Service: `app/Services/SeasonRankingCalculatorService.php`
  - Command: `app/Console/Commands/RecalculateSeasonRankingsCommand.php`
  - Fitur: Membaca parameter `formula_config` berversi, menghitung tier multiplier (Major: 1.5x, Regular: 1.0x, Mini Gathering: 0.5x), poin partisipasi, poin penempatan juara (1st, 2nd, 3rd, Top 8), bonus kemenangan match, dan mengurutkan peringkat secara deterministik. (FR-044, FR-045, FR-046)
  - *Area:* `app/Services/SeasonRankingCalculatorService.php`, `app/Console/Commands/RecalculateSeasonRankingsCommand.php`
  - *Acceptance:* Eksekusi perhitungan menghasilkan total poin yang tepat dan idempotent saat diulang.
- [ ] `TODO-058` `[Backend/Domain]` Hubungkan Finalisasi Event ke Perhitungan Ranking Otomatis:
  - Listener: `app/Listeners/UpdateSeasonRankingsOnEventCompletion.php`
  - Memicu kalkulasi poin ranking segera setelah event `is_ranking_eligible` diubah statusnya menjadi `Completed`. (FR-008, FR-046)
  - *Area:* `app/Listeners/UpdateSeasonRankingsOnEventCompletion.php`
  - *Acceptance:* Ranking musim ter-update otomatis tanpa perlu intervensi manual tambahan.
- [ ] `TODO-059` `[Backend/Export]` Buat Class Export Data Menggunakan Maatwebsite Excel:
  - `app/Exports/RegistrationsExport.php` (Ekspor pendaftar & data kontak privat untuk panitia)
  - `app/Exports/TournamentResultsExport.php` (Ekspor hasil match & battle lengkap)
  - `app/Exports/SeasonLeaderboardExport.php` (Ekspor klasemen ranking komunitas) (FR-049)
  - *Area:* `app/Exports/RegistrationsExport.php`, `app/Exports/TournamentResultsExport.php`, `app/Exports/SeasonLeaderboardExport.php`
  - *Acceptance:* Tombol ekspor pada UI menghasilkan file CSV/XLSX yang terformat rapi.
- [ ] `TODO-060` `[UI/Frontend]` Buat Halaman Leaderboard Musim Komunitas Publik:
  - Halaman: `resources/js/pages/public/seasons/leaderboard.tsx`
  - Filter per musim, pencarian blader, badge rank #1..#3, statistik tanding (Menang/Kalah/Win Rate), dan modal rincian perolehan poin per event. (FR-044, FR-045)
  - *Area:* `resources/js/pages/public/seasons/leaderboard.tsx`
  - *Acceptance:* Tampilan leaderboard kompetitif yang memotivasi keaktifan anggota komunitas.
- [ ] `TODO-061` `[UI/Frontend]` Buat Halaman Manajemen Musim & Penyesuaian Poin Admin:
  - Halaman: `resources/js/pages/admin/seasons/index.tsx`, `edit.tsx`
  - Fitur: Buat musim baru, konfigurasi formula poin, tombol "Kalkulasi Ulang Musim", dan dialog penyesuaian poin manual dengan input alasan wajib. (FR-044, FR-046, FR-047)
  - *Area:* `resources/js/pages/admin/seasons/*`
  - *Acceptance:* Setiap penyesuaian manual tercatat di audit log Spatie.
- [ ] `TODO-062` `[Tests]` Tulis Pest tests untuk formula ranking berversi, kalkulasi ulang deterministik, export CSV, dan audit log tracking. (FR-045, FR-046, FR-049, FR-050)
  - *Area:* `tests/Feature/Tournament/SeasonRankingCalculationTest.php`, `tests/Feature/Tournament/DataExportTest.php` (usulan baru)
  - *Acceptance:* Poin ranking terbukti konsisten dan hasil ekspor CSV tervalidasi.

---

## Phase 9 — QA, Security, Accessibility, Observability, dan Release

- [ ] `TODO-063` `[Tests/Suite]` Jalankan seluruh test suite fitur turnamen dengan standard command `rtk proxy php artisan test --compact` dan pastikan seluruh test (unit & feature) berstatus passed hijau tanpa peringatan.
  - *Target:* $\ge 250$ tests passed, zero regressions.
  - *Acceptance:* Test suite lulus 100% pada SQLite memory testing database.
- [ ] `TODO-064` `[Security/Audit]` Jalankan security audit pada seluruh endpoint baru:
  - Verifikasi tidak ada Mass Assignment vulnerability pada model baru.
  - Verifikasi tidak ada secret yang bocor ke frontend.
  - Verifikasi otorisasi Policy di semua controller.
  - Verifikasi data wali/anak tidak muncul di inspect network payload publik.
  - *Acceptance:* Lulus security review mandiri.
- [ ] `TODO-065` `[Frontend/Lint]` Jalankan verifikasi statis frontend:
  - `npm run types` (TypeScript compiler)
  - `npm run lint` (ESLint)
  - `npm run format:check` (Prettier)
  - `npm run build` (Vite production build)
  - *Acceptance:* Zero type errors, zero lint errors, bundle Vite berhasil di-compile.
- [ ] `TODO-066` `[Backend/Style]` Jalankan Laravel Pint untuk memastikan gaya penulisan kode PHP konsisten:
  - Command: `rtk proxy ./vendor/bin/pint --test`
  - *Acceptance:* 100% kode PHP mematuhi PSR-12 / Laravel standards.
- [ ] `TODO-067` `[Observability]` Konfigurasikan pemantauan log runtime dan tracing error via Laravel Pail (`php artisan pail`) dan periksa integrasi `ActivityLog` untuk seluruh aksi krusial panitia. (FR-050)
  - *Area:* `config/activitylog.php`, `app/Models/Activity.php`
  - *Acceptance:* Log operasional tercatat akurat dan mudah dipantau saat live event.
- [ ] `TODO-068` `[Release/DryRun]` Lakukan simulasi operasional turnamen end-to-end (Dry Run):
  - Buat event $\to$ Daftarkan 16 peserta $\to$ Check-in 14 peserta (2 no-show) $\to$ Kunci deck $\to$ Generate & Lock Bracket $\to$ Panggil match ke Stadium A & B $\to$ Catat skor di Judge Console $\to$ Final $\to$ Podium $\to$ Cek Ranking Musim.
  - *Acceptance:* Seluruh alur berjalan lancar tanpa kendala teknis.

---

## Post-MVP Backlog (Rencana Pengembangan Lanjutan)

- [ ] `TODO-POST-001` `[Format]` Dukungan sistem turnamen **Swiss-System Pairing** dan format bertingkat **Multi-Stage** (Penyisihan Grup Round Robin dilanjutkan Top Cut Single Elimination).
- [ ] `TODO-POST-002` `[Check-in]` Sistem **QR Code Check-in Mandiri**: Blader menunjukkan QR tiket dari smartphone di meja registrasi untuk auto check-in via kamera panitia.
- [ ] `TODO-POST-003` `[Blader Pass]` **Digital Blader Card & E-Sertifikat Juara**: Generator kartu identitas blader komunitas (PNG) dan sertifikat digital bertanda tangan panitia (PDF).
- [ ] `TODO-POST-004` `[Broadcast]` **OBS Live Stream Overlay**: Halaman overlay browser source khusus untuk siaran langsung (live streaming) YouTube yang menampilkan papan skor real-time dan animasi jenis finish.
- [ ] `TODO-POST-005` `[Integrasi]` **WhatsApp Gateway Bot**: Pengiriman pesan otomatis ke nomor WhatsApp peserta/wali saat match dipanggil ke stadium ("Giliran Anda bertanding di Stadium 1!").
- [ ] `TODO-POST-006` `[Monetisasi/Bayar]` **Integrasi Payment Gateway (QRIS/Midtrans)**: Pembayaran otomatis biaya pendaftaran turnamen via scan QRIS nasional.
- [ ] `TODO-POST-007` `[Multi-Tenant]` **Arsitektur Multi-Community SaaS**: Membuka platform untuk digunakan oleh komunitas Beyblade di kota lain (Balikpapan, Banjarmasin, Surabaya, Jakarta, dll.) dengan isolasi data per komunitas.

---

## Definition of Done (DoD)

Sebuah item tugas / feature dinyatakan **SELESAI (Done)** jika memenuhi kriteria berikut:
1. **Schema & Migration:** Skema database memiliki kolom lengkap, tipe data tepat, index yang dibutuhkan, relasi `foreignUlid()`, dan rollback migration berjalan bersih (`down()`).
2. **Business Logic & Policy:** Logika domain terisolasi dalam Action/Service class, terbebas dari hardcode ruleset, dan dilindungi oleh Server-Side Policy.
3. **Frontend & UX:** Mengikuti pola page structure repository (`Frame`, `Table`, `Pagination`, Inertia `<Form>` render props, `@inertiajs/react`), mobile-friendly, dan memiliki touch target yang memadai.
4. **Data Privacy:** Tidak ada PII (nama lengkap, tanggal lahir, kontak, data wali) yang diekspos ke publik atau endpoint publik.
5. **Testing:** Dilengkapi dengan unit/feature test berbasis Pest 4 yang menguji *happy path*, *failure path*, dan *edge cases*.
6. **Code Quality:** Lulus `npm run types`, `npm run lint`, `npm run format:check`, dan `./vendor/bin/pint`.
7. **Audit Trail:** Aksi mutasi penting menghasilkan entri `ActivityLog`.

---

## Traceability Matrix (FR $\to$ TODO)

| Functional Requirement | Deskripsi Kebutuhan | TODO Items Terkait |
| --- | --- | --- |
| **`FR-001`** | Autentikasi & Akun Panitia | `TODO-001`, `TODO-004`, `TODO-014`, `TODO-019` |
| **`FR-002`** | Role-Based Access Control (RBAC) | `TODO-002`, `TODO-005`, `TODO-014`, `TODO-015`, `TODO-017`, `TODO-018` |
| **`FR-003`** | Profil Komunitas & Kode Etik | `TODO-006`, `TODO-051`, `TODO-055` |
| **`FR-004`** | Audit Logging Perubahan Kritis | `TODO-006`, `TODO-031`, `TODO-061`, `TODO-067` |
| **`FR-005`** | Siklus Hidup Event (Lifecycle) | `TODO-008`, `TODO-020`, `TODO-024`, `TODO-026` |
| **`FR-006`** | Metadata & Informasi Event | `TODO-003`, `TODO-008`, `TODO-020`, `TODO-024`, `TODO-051` |
| **`FR-007`** | Multi-Kategori Turnamen | `TODO-008`, `TODO-021`, `TODO-025` |
| **`FR-008`** | Ranking Eligibility Event | `TODO-008`, `TODO-021`, `TODO-058` |
| **`FR-009`** | Konfigurasi Finish Types Dinamis | `TODO-008`, `TODO-021`, `TODO-023`, `TODO-025` |
| **`FR-010`** | Format Match & Target Poin | `TODO-008`, `TODO-021`, `TODO-025` |
| **`FR-011`** | Snapshot Ruleset pada Match | `TODO-008`, `TODO-012`, `TODO-026`, `TODO-044` |
| **`FR-012`** | Immutability Ruleset Kategori Aktif | `TODO-022`, `TODO-026` |
| **`FR-013`** | Form Pendaftaran Publik (Guest) | `TODO-009`, `TODO-027`, `TODO-032`, `TODO-034` |
| **`FR-014`** | Perlindungan Wali & Junior | `TODO-010`, `TODO-016`, `TODO-018`, `TODO-027`, `TODO-032`, `TODO-034` |
| **`FR-015`** | Persetujuan Terpisah (Consent) | `TODO-009`, `TODO-027`, `TODO-032` |
| **`FR-016`** | Status Pendaftaran & Input Manual | `TODO-009`, `TODO-027`, `TODO-028`, `TODO-029` |
| **`FR-017`** | Konfigurasi Slot Deck Combo | `TODO-011`, `TODO-025`, `TODO-032` |
| **`FR-018`** | Kebijakan Visibilitas Deck | `TODO-008`, `TODO-011`, `TODO-016` |
| **`FR-019`** | Deck Lock & Exception Override | `TODO-011`, `TODO-030`, `TODO-031`, `TODO-034` |
| **`FR-020`** | Fast-Search Check-in Venue | `TODO-030`, `TODO-033` |
| **`FR-021`** | Status Check-in & No-Show | `TODO-030`, `TODO-033` |
| **`FR-022`** | Promosi Waitlist Otomatis/Manual | `TODO-028`, `TODO-029`, `TODO-030`, `TODO-034` |
| **`FR-023`** | Generator Single Elimination (Byes) | `TODO-035`, `TODO-041` |
| **`FR-024`** | Seeding Mode & Bracket Lock | `TODO-035`, `TODO-039`, `TODO-040` |
| **`FR-025`** | Progresi Pemenang Otomatis | `TODO-037`, `TODO-040`, `TODO-041` |
| **`FR-026`** | Perebutan Juara 3 (Playoff) | `TODO-036`, `TODO-040` |
| **`FR-027`** | Generator Jadwal Round Robin | `TODO-038`, `TODO-041` |
| **`FR-028`** | Klasemen Dinamis (Standings) | `TODO-038`, `TODO-041` |
| **`FR-029`** | Konfigurasi Aturan Tie-Breaker | `TODO-038`, `TODO-041` |
| **`FR-030`** | Registry Stadium Komunitas | `TODO-012`, `TODO-042`, `TODO-048` |
| **`FR-031`** | Penugasan Juri ke Match/Stadium | `TODO-012`, `TODO-043`, `TODO-048` |
| **`FR-032`** | Antrean Panggilan (Match Queue) | `TODO-012`, `TODO-043`, `TODO-048`, `TODO-050` |
| **`FR-033`** | Pencegahan Bentrok Jadwal Blader | `TODO-043`, `TODO-048`, `TODO-049` |
| **`FR-034`** | Antarmuka Juri Mobile-First | `TODO-047` |
| **`FR-035`** | Pencatatan Battle & Finish Poin | `TODO-012`, `TODO-044`, `TODO-047`, `TODO-049` |
| **`FR-036`** | Deteksi Kemenangan Match Otomatis | `TODO-044`, `TODO-047`, `TODO-049` |
| **`FR-037`** | Walkover & Penalti | `TODO-045`, `TODO-047`, `TODO-049` |
| **`FR-038`** | Alur Dispute & Resolusi Koreksi | `TODO-045`, `TODO-046`, `TODO-049` |
| **`FR-039`** | Idempotency & Ketahanan Jaringan | `TODO-044`, `TODO-047` |
| **`FR-040`** | Live Bracket & Standings Publik | `TODO-051`, `TODO-052`, `TODO-056` |
| **`FR-041`** | Sanitasi Data Publik (No PII) | `TODO-002`, `TODO-016`, `TODO-051`, `TODO-052`, `TODO-056` |
| **`FR-042`** | Realtime WebSockets & Fallback Polling | `TODO-001`, `TODO-050`, `TODO-052`, `TODO-053` |
| **`FR-043`** | Podium & Pengumuman Juara | `TODO-054` |
| **`FR-044`** | Manajemen Musim Komunitas | `TODO-007`, `TODO-013`, `TODO-057`, `TODO-060`, `TODO-061` |
| **`FR-045`** | Formula Poin Berversi | `TODO-007`, `TODO-057`, `TODO-061`, `TODO-062` |
| **`FR-046`** | Kalkulasi Ulang Deterministik | `TODO-057`, `TODO-058`, `TODO-061`, `TODO-062` |
| **`FR-047`** | Penyesuaian Poin Manual Berbasis Audit | `TODO-061`, `TODO-062` |
| **`FR-048`** | Dashboard Operasional Panitia | `TODO-024`, `TODO-048` |
| **`FR-049`** | Ekspor Data CSV/XLSX | `TODO-059`, `TODO-062` |
| **`FR-050`** | Viewer Audit Log & Tracing | `TODO-006`, `TODO-031`, `TODO-061`, `TODO-067` |

---

## Risiko dan Hambatan Implementasi (Risks & Blockers)

1. **Kompleksitas Koreksi Skor Downstream:** Jika panitia mengoreksi match babak 1 padahal match babak 2 sudah berjalan, terjadi potensi inkonsistensi bagan.
   - *Mitigasi:* Mengunci cabang bagan terkait dan memaksa resolusi manual via peran Head Judge (`TODO-046`).
2. **Koneksi Seluler Venue Mall Tidak Stabil:** Sinyal WebSocket terputus saat juri menginput skor.
   - *Mitigasi:* Optimistic UI + Idempotent request identifier + Fallback interval polling HTTP 10 detik (`TODO-044`, `TODO-047`, `TODO-053`).
3. **Penyusupan Data Pribadi Anak ke Halaman Publik:**
   - *Mitigasi:* Penerapan strict resource transformer dan pemisahan tabel privat `guardian_details` (`TODO-010`, `TODO-016`).

---

## Panduan Validasi Komunitas Manual (Venue Validation Checklist)

Gunakan checklist ini saat melakukan simulasi basah bersama panitia Komunitas Beyblade Samarinda di venue:

- [ ] **Checklist Pendaftaran & Kuota:**
  - [ ] Daftarkan 1 peserta dewasa via form publik $\to$ Cek status pendaftaran `Approved`.
  - [ ] Daftarkan 1 peserta anak usia 8 tahun $\to$ Pastikan form meminta data wali dan menolak submit jika data wali kosong.
  - [ ] Penuhi kuota kategori $\to$ Daftarkan peserta berikutnya dan pastikan masuk antrean `Waitlisted`.
- [ ] **Checklist Meja Check-in:**
  - [ ] Cari nama peserta di layar fast-search check-in $\to$ Klik `Checked-in` $\to$ Cek apakah deck otomatis terkunci.
  - [ ] Tandai 1 peserta sebagai `Withdrawn` $\to$ Verifikasi tombol promosi waitlist berfungsi menaikkan peserta tunggu.
- [ ] **Checklist Bagan & Pemanggilan:**
  - [ ] Kunci check-in dan buat bagan Single Elimination 14 peserta $\to$ Hitung ada tepat 2 Bye.
  - [ ] Kunci bagan $\to$ Panggil Match 1 ke Stadium A $\to$ Buka layar TV / HP penonton dan lihat nama match muncul di papan panggil.
  - [ ] Coba panggil Match 2 yang melibatkan pemain yang sama $\to$ Pastikan sistem menolak dengan peringatan bentrok.
- [ ] **Checklist Juri Lapangan:**
  - [ ] Buka match di smartphone juri $\to$ Input Spin Finish (1 pt), Over Finish (2 pt), Xtreme Finish (3 pt) $\to$ Pastikan akumulasi skor benar.
  - [ ] Capai target 4 poin $\to$ Verifikasi muncul banner kemenangan dan pemenang otomatis maju ke bagan putaran 2.
- [ ] **Checklist Ranking & Publik:**
  - [ ] Selesaikan turnamen $\to$ Buka halaman podium $\to$ Cek Juara 1, 2, 3 sesuai hasil match.
  - [ ] Buka halaman Leaderboard Musim $\to$ Pastikan poin seluruh peserta bertambah sesuai formula.
  - [ ] Buka inspect network browser publik $\to$ Pastikan tidak ada nomor HP atau nama asli yang bocor.

---

## Release Checklist

Sebelum merilis ke production venue Komunitas Beyblade Samarinda:

- [ ] **1. Migration Check:** Jalankan `php artisan migrate --force` dan pastikan semua tabel ULID terbuat tanpa konflik.
- [ ] **2. Seeder Check:** Jalankan `php artisan db:seed --class=RolePermissionSeeder` dan `TournamentRulesetSeeder`.
- [ ] **3. Environment Variables:** Pastikan `.env` memiliki `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_DRIVER=database`, `BROADCAST_CONNECTION=reverb`, `VITE_REVERB_*` terpasang valid.
- [ ] **4. Build Frontend:** Jalankan `npm run build` dan verifikasi seluruh asset Vite ter-bundle tanpa chunk error.
- [ ] **5. Reverb WebSocket Server:** Pastikan service Reverb berjalan di supervisor/systemd (`php artisan reverb:start`).
- [ ] **6. Queue Worker:** Pastikan queue worker berjalan untuk background processing dan event broadcasting (`php artisan queue:work`).
- [ ] **7. Privacy Audit:** Jalankan automated test `tests/Feature/Tournament/JuniorPrivacyTest.php` untuk verifikasi nol kebocoran PII.
- [ ] **8. Backup & Restore Routine:** Uji coba backup database SQLite/MySQL dan validasi file backup dapat di-restore dengan mulus.
- [ ] **9. Rollback Plan:** Siapkan snapshot database sebelum turnamen dimulai untuk mengantisipasi kegagalan total sistem di venue.
