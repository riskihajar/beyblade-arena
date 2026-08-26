## Commit Message Convention

Follow Conventional Commits specification:

| Type       | Description              | Example                             |
| ---------- | ------------------------ | ----------------------------------- |
| `feat`     | New feature              | `feat: add user profile page`       |
| `fix`      | Bug fix                  | `fix: resolve login redirect issue` |
| `docs`     | Documentation changes    | `docs: update API endpoints`        |
| `style`    | Code style (formatting)  | `style: format code with Pint`      |
| `refactor` | Code refactoring         | `refactor: extract form validation` |
| `perf`     | Performance improvements | `perf: optimize database query`     |
| `test`     | Adding/updating tests    | `test: add password reset test`     |
| `chore`    | Maintenance tasks        | `chore: update dependencies`        |
| `build`    | Build system changes     | `build: configure Vite SSR`         |
| `ci`       | CI/CD changes            | `ci: add GitHub Actions workflow`   |
| `revert`   | Revert commits           | `revert: undo auth changes`         |

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Rules

- Use lowercase for type and description
- Use imperative mood ("add" not "added")
- Max 72 characters for subject line
- Reference issues in footer: `Closes #123`
- Separate sections with blank lines
