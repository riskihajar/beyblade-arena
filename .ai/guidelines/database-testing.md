# Database Testing Safety

- Never run `migrate:fresh`, `migrate:refresh`, `migrate:reset`, `migrate:rollback`, or `db:wipe` against the application's local or default database.
- Feature tests use the named `testing` connection and may use `LazilyRefreshDatabase`; any refresh must be limited to that connection.
- Test database configuration uses `TEST_DB_*` variables. If they are unset, the safe default is SQLite `:memory:`; never fall back to `DB_CONNECTION` or `DB_DATABASE` for tests.
- For MySQL, MariaDB, PostgreSQL, or SQL Server, use the same driver as the target environment with a dedicated test database or schema.
- Never run tests against a shared dataset that contains important data. Use a disposable database, clone, replica, or read-only connection for dataset-based checks.
- Before changing test database behavior, inspect `config/database.php`, `phpunit.xml`, `tests/TestCase.php`, and `app/Testing/TestingDatabaseGuard.php`.
- Run `php artisan test --compact` after test database changes and confirm the application database remains untouched.
