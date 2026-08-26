# RTK - Token-Optimized CLI Proxy

RTK is a high-performance CLI proxy that reduces LLM token consumption by 60-90%. Always prefer `rtk` prefixed commands over their raw equivalents to save tokens.

## Command Aliases

### Files
| Raw Command | RTK Alias |
|---|---|
| `ls .` | `rtk ls .` |
| `cat file.rs` | `rtk read file.rs` |
| `cat file.rs` (signatures only) | `rtk read file.rs -l aggressive` |
| `find "*.rs" .` | `rtk find "*.rs" .` |
| `rg "pattern" .` / `grep "pattern" .` | `rtk grep "pattern" .` |
| `diff file1 file2` | `rtk diff file1 file2` |

### Git
| Raw Command | RTK Alias |
|---|---|
| `git status` | `rtk git status` |
| `git log -n 10` | `rtk git log -n 10` |
| `git diff` | `rtk git diff` |
| `git add` | `rtk git add` |
| `git commit -m "msg"` | `rtk git commit -m "msg"` |
| `git push` | `rtk git push` |
| `git pull` | `rtk git pull` |

### GitHub CLI
| Raw Command | RTK Alias |
|---|---|
| `gh pr list` | `rtk gh pr list` |
| `gh pr view 42` | `rtk gh pr view 42` |
| `gh issue list` | `rtk gh issue list` |
| `gh run list` | `rtk gh run list` |

### Test Runners
| Raw Command | RTK Alias |
|---|---|
| `cargo test` | `rtk test cargo test` / `rtk cargo test` |
| `npm run build` (errors only) | `rtk err npm run build` |
| `vitest run` | `rtk vitest run` |
| `playwright test` | `rtk playwright test` |
| `pytest` | `rtk pytest` |
| `go test` | `rtk go test` |

### Build & Lint
| Raw Command | RTK Alias |
|---|---|
| `eslint` | `rtk lint` |
| `biome` | `rtk lint biome` |
| `tsc` | `rtk tsc` |
| `next build` | `rtk next build` |
| `prettier --check .` | `rtk prettier --check .` |
| `cargo build` | `rtk cargo build` |
| `cargo clippy` | `rtk cargo clippy` |
| `ruff check` | `rtk ruff check` |
| `golangci-lint run` | `rtk golangci-lint run` |

### Package Managers
| Raw Command | RTK Alias |
|---|---|
| `pnpm list` | `rtk pnpm list` |
| `pip list` | `rtk pip list` |
| `pip outdated` | `rtk pip outdated` |
| `prisma generate` | `rtk prisma generate` |

### Containers
| Raw Command | RTK Alias |
|---|---|
| `docker ps` | `rtk docker ps` |
| `docker images` | `rtk docker images` |
| `docker logs <container>` | `rtk docker logs <container>` |
| `docker compose ps` | `rtk docker compose ps` |
| `kubectl get pods` | `rtk kubectl pods` |
| `kubectl logs <pod>` | `rtk kubectl logs <pod>` |
| `kubectl get services` | `rtk kubectl services` |

### Data & Analytics
| Raw Command | RTK Alias |
|---|---|
| `cat config.json` (structure) | `rtk json config.json` |
| `cat .env` (filtered) | `rtk env -f AWS` |
| `cat app.log` | `rtk log app.log` |
| `curl <url>` | `rtk curl <url>` |
| `wget <url>` | `rtk wget <url>` |

### Heuristic Summary
| Command | Description |
|---|---|
| `rtk smart file.rs` | 2-line heuristic code summary |
| `rtk summary <long command>` | Heuristic summary of any command |
| `rtk proxy <command>` | Raw passthrough + tracking |

## Global Flags
- `-u, --ultra-compact` — ASCII icons, inline format (extra token savings)
- `-v, --verbose` — Increase verbosity (`-v`, `-vv`, `-vvv`)

## Token Savings Analytics
```bash
rtk gain                        # Summary stats
rtk gain --graph                # ASCII graph (last 30 days)
rtk gain --history              # Recent command history
rtk discover                    # Find missed savings opportunities
```

## Fallback
- Before using any `rtk` command, check if RTK is installed by running `rtk --version`.
- If RTK is **not installed** (command not found), fall back to the native/raw command equivalents as usual.
- Only check once per session — cache the result and reuse it for subsequent commands.

## Rules
- Always use `rtk` prefix when running shell commands that have an RTK equivalent, **only if RTK is installed**.
- If RTK is not available, use the raw commands directly without any `rtk` prefix.
- For commands not listed above, use `rtk proxy <command>` for passthrough tracking.
- Use `rtk smart <file>` for quick file overview instead of reading entire files.
- Use `-u` flag when ultra-compact output is sufficient.
