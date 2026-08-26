# Laravel Inertia React Starter Kit

A modern Laravel 13 starter kit with Inertia.js v3, React 19, and TypeScript. This project provides a full-stack foundation for authentication, authorization, admin workflows, realtime notifications, AI chat, and a type-safe developer experience.

> Current documentation snapshot updated on 28 Apr 2026. See `PROGRESS.md` for the latest implementation status, blockers, and next focus.

## Tech Stack

### Backend

- **PHP 8.4** - The programming language
- **Laravel 13** - The PHP framework
- **Laravel Fortify 1** - Headless authentication backend
- **Laravel Reverb 1** - WebSocket server for real-time broadcasting
- **Laravel Wayfinder 0.1.x** - Type-safe route generation for frontend
- **Laravel Scout 10** - Full-text search with `collection` default driver and optional Typesense integration
- **Spatie Laravel Permission 6.24** - Role and permission management
- **Spatie Laravel Activitylog 4.10** - Activity logging and monitoring
- **Inertia.js 3** - Server-side rendering bridge
- **Pest 4** - Elegant testing framework
- **Laravel Pint 1** - Code style fixer

### Frontend

- **React 19** - UI library
- **TypeScript 6** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite 8** - Next-generation frontend tooling
- **ESLint 10** - JavaScript/TypeScript linter
- **Prettier 3** - Code formatter

### Additional Dependencies

- **Base UI** - Unstyled, accessible UI components
- **COSS UI** - Extended Base UI components with styling
- **Lucide React** - Beautiful icons
- **Laravel Echo React** - Real-time event broadcasting for React
- **Class Variance Authority** - Component variants
- **Tailwind Merge** - Tailwind class merging
- **Concurrently** - Run multiple commands in parallel
- **League Flysystem AWS S3 v3** - S3-compatible storage driver
- **Maatwebsite Excel** - Spreadsheet export (XLSX, CSV, JSON)

## Key Features

### Authentication & Security

✅ User registration flow with verification screens and routes
✅ Secure login with rate limiting (5 attempts/min)
✅ Two-factor authentication (2FA) with QR codes and recovery codes
✅ Password reset flow via email
✅ Password confirmation for sensitive actions
✅ Remember Me functionality
✅ Session management in database

### Real-time Notifications

✅ Database-driven notifications with `SystemNotification` class
✅ Real-time broadcasting via Laravel Reverb WebSocket server
✅ Notification center in user menu dropdown
✅ Mark as read/unread functionality
✅ Mark all as read / Clear all actions
✅ Toast notifications for new broadcasts
✅ Unread count badge on user avatar

### AI Workspace

✅ Database-driven AI providers and model registry
✅ Admin pages for AI provider and model management
✅ Native AWS Bedrock provider support with inference profile defaults
✅ Provider connection testing and remote model discovery
✅ Streaming chat interface with attachment upload support
✅ Chat title generation and model switching

### Authorization & Access Control

✅ **Role-based access control** using Spatie Permission
✅ Pre-configured roles: `admin`, `user`
✅ Granular permissions system: - `user.view`, `user.create`, `user.update`, `user.delete` - `role.view`, `role.create`, `role.update`, `role.delete` - `admin.access` for admin panel
✅ Custom permission middleware
✅ ULID primary keys for enhanced security

### Admin Panel

✅ **User Management** - List, create, edit, delete users - Bulk delete users - Assign roles to users - Verify/unverify email addresses - View user permissions - Sortable columns (name, roles, status, joined date) - Customizable pagination (10, 20, 50, 100 per page) - Advanced filtering and search - **Export to XLSX, CSV, or JSON**
✅ **Activity Log** - List all system activities with filtering - Filter by activity type (all, user, admin) - Filter by event type (created, updated, deleted, login, logout, export) - Filter by user and date range - Search by description - Dedicated detail view with changes diff - Sortable columns (description, log type, target, date) - Customizable pagination (10, 20, 50, 100 per page) - **Export to XLSX, CSV, or JSON**

### Dashboard

✅ **Statistics Cards** - Real-time metrics for total users, active sessions, and verified users
✅ **Data Visualization** - Interactive charts for user growth (6 months) and role distribution
✅ **Recent Activity** - Table displaying the latest 10 registered users

### Global Search (Command Palette)

✅ **Keyboard shortcut** - `⌘K` (Mac) or `Ctrl+K` (Windows) to open
✅ **Navigation search** - Quick access to all pages (Main, Settings, Admin)
✅ **Full-text search** - Search Users and Activities via Laravel Scout (default `collection`, optional Typesense)
✅ **Permission-aware** - Activity results are restricted for admin access
✅ **Debounced API** - Efficient search with 300ms debounce
✅ **Loading states** - Visual feedback during search

### UI Components (32 components)

✅ **Basic Components:** alert, avatar, badge, breadcrumb, button, card, checkbox, dialog
✅ **Form Components:** field (field, label, description, error, group, set, legend, item), input-group, input-otp, input, label, select, textarea
✅ **Navigation Components:** menu (dropdown), navigation-menu, pagination, pagination-links, scroll-area, separator
✅ **Layout Components:** frame, sidebar, sheet, tabs
✅ **Data Display Components:** table, table-column-header (sortable columns)
✅ **Feedback Components:** skeleton, spinner, toast, toggle-group, toggle, tooltip

### Inertia.js Features

✅ Server-side rendering (SSR) support
✅ Type-safe form handling with Wayfinder
✅ Deferred props for lazy loading
✅ Prefetching for instant navigation
✅ Polling for real-time updates
✅ Progressive enhancement

### Settings Pages

✅ Profile management (name, email update)
✅ Password change functionality
✅ Avatar upload with toast notifications
✅ Appearance (theme) settings with dark/light mode
✅ Two-factor authentication setup
✅ User management (admin only)
✅ Role management (admin only)

### UI/UX Features

✅ Dark/Light Mode with system preference detection
✅ **Responsive sidebar navigation** with: - Desktop sidebar - Mobile sheet/drawer - Mobile navigation hook
✅ Form validation with error handling
✅ Loading states with animations (skeleton, spinner)
✅ Toast notifications
✅ Logout confirmation dialog

### Auth Pages (7 pages)

✅ Login page with form validation
✅ Register page
✅ Forgot Password page
✅ Reset Password page
✅ Confirm Password page
✅ Verify Email page
✅ Two-Factor Challenge page

### Developer Experience

✅ Type-safe routes from Laravel controllers (Wayfinder)
✅ Hot module replacement during development (Vite HMR)
✅ Laravel Boost MCP server
✅ Pre-configured linting and formatting (ESLint, Prettier, Laravel Pint)
✅ Comprehensive test coverage with Pest 4
✅ Pest feature and unit test suite
✅ Shadcn/COSS UI for component management

---

## Current Status

- Core starter modules are implemented: auth, dashboard, settings, roles/users, activity log, global search, notifications, and AI workspace.
- Documentation and package versions are aligned with the current stack snapshot.
- Native AWS Bedrock is integrated into AI settings and chat defaults, with `us.anthropic.claude-sonnet-4-6` verified in app context.
- `npm run types` is green again after restoring frontend type safety.
- The main product follow-up is security hardening around search visibility, broadcast authorization, and AI provider secrets.

---

## Feature Roadmap

### ❌ Missing Features (Future Enhancements)

#### 📂 File Upload Management

- Image resizing & optimization

#### 📊 Reports & Analytics

- User activity history

#### 🔧 Advanced Operations

- Bulk operations (update)
- Bulk assign roles

#### 🌍 Localization (i18n)

- Multi-language support
- Language switcher
- Translation management

#### 🔌 API Layer

- REST API for mobile apps
- API documentation with Swagger/OpenAPI
- API authentication with Sanctum tokens

#### 🔗 Third-party Integrations

- Social login (Google, GitHub, etc.)
- OAuth integration
- Email service providers (Mailgun, SendGrid, etc.)

---

## What's Next? (Prioritized Suggestions)

### High Priority (Very Useful)

1. **📂 Image Optimization**
    - Image resizing & optimization for uploads

### Medium Priority (Nice to Have)

2. **📊 Activity History**
    - View user activity history

3. **🔧 Advanced Bulk Operations**
    - Bulk assign roles

### Low Priority (Future Enhancements)

4. **🌐 API Layer**
    - REST API for mobile apps
    - API documentation with Swagger/OpenAPI
    - API authentication (Sanctum tokens)

5. **🌍 Localization (i18n)**
    - Multi-language support
    - Language switcher
    - Translation management

6. **🔗 Advanced Features**
    - Social login (OAuth)
    - Email service providers integration
    - Advanced RBAC (permissions per resource)
    - Multi-tenant support

---

_Note: This is a starter kit. Feel free to implement these features based on your specific project requirements._

## Project Structure

```
inertia-react-starter/
├── app/
│   ├── Actions/               # Fortify action classes
│   │   └── Fortify/
│   │       ├── CreateNewUser.php
│   │       ├── ResetUserPassword.php
│   │       └── PasswordValidationRules.php
│   ├── Concerns/
│   │   └── HasUlids.php       # ULID trait for models
│   ├── Console/
│   │   └── Commands/          # Auto-registered commands
│   ├── Exports/               # Data export classes
│   │   ├── UsersExport.php    # Users export (XLSX, CSV, JSON)
│   │   ├── RolesExport.php    # Roles export (XLSX, CSV, JSON)
│   │   └── ActivityLogsExport.php # Activity logs export (XLSX, CSV, JSON)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php
│   │   │   ├── NotificationController.php  # Notification actions
│   │   │   └── Settings/      # Settings controllers
│   │   │       ├── ActivityLogController.php
│   │   │       ├── PasswordController.php
│   │   │       ├── ProfileController.php
│   │   │       ├── RoleController.php
│   │   │       ├── TwoFactorAuthenticationController.php
│   │   │       └── UserController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasPermission.php  # Permission middleware
│   │   │   ├── HandleAppearance.php         # Theme handling
│   │   │   └── HandleInertiaRequests.php    # Shared Inertia props
│   │   └── Requests/Settings/
│   │       ├── ProfileUpdateRequest.php
│   │       └── TwoFactorAuthenticationRequest.php
│   ├── Agents/                # AI chat agents
│   ├── Ai/                    # AI provider/model registry and integrations
│   ├── Models/
│   │   ├── AiModel.php        # AI model catalog
│   │   ├── AiProvider.php     # AI provider credentials/config
│   │   ├── Permission.php     # Spatie Permission with ULID
│   │   ├── Role.php           # Spatie Role with ULID
│   │   └── User.php           # User model with roles & 2FA
│   ├── Notifications/
│   │   └── SystemNotification.php  # Broadcast notification class
│   └── Providers/
│       ├── AppServiceProvider.php
│       └── FortifyServiceProvider.php
├── bootstrap/
│   ├── app.php                # Register middleware, exceptions, routes
│   └── providers.php          # Service providers registration
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── filesystems.php        # Storage config (includes RustFS S3 disk)
│   ├── fortify.php            # Fortify configuration
│   ├── inertia.php
│   ├── permission.php         # Spatie Permission config
│   └── ...
├── database/
│   ├── factories/
│   │   ├── UserFactory.php
│   │   └── ...
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2025_08_26_100418_add_two_factor_columns_to_users_table.php
│   │   └── 2026_01_06_041326_create_permission_tables.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── RolePermissionSeeder.php
├── resources/
│   ├── css/
│   │   └── app.css            # Tailwind CSS entry point
│   └── js/
│       ├── components/        # React components
│       │   ├── ui/            # 32+ reusable UI components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   ├── select.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── table.tsx
│   │   │   ├── table-column-header.tsx
│   │   │   └── ...
│       │   ├── app-sidebar.tsx
│       │   ├── nav-user.tsx
│       │   ├── notifications-sheet.tsx  # Notification center
│       │   ├── export/           # Export dropdown component
│       │   │   └── export-dropdown.tsx
│       │   └── ...
│       ├── hooks/             # Custom React hooks
│       │   ├── use-appearance.tsx
│       │   ├── use-clipboard.ts
│       │   ├── use-mobile.tsx
│       │   ├── use-mobile-navigation.ts
│       │   └── use-two-factor-auth.ts
│       ├── echo.ts             # Laravel Echo configuration
│       ├── layouts/           # Page layouts
│       │   ├── app-layout.tsx
│       │   ├── app/
│       │   │   ├── app-header-layout.tsx
│       │   │   └── app-sidebar-layout.tsx
│       │   ├── auth/
│       │   │   ├── auth-card-layout.tsx
│       │   │   ├── auth-layout.tsx
│       │   │   ├── auth-simple-layout.tsx
│       │   │   └── auth-split-layout.tsx
│       │   └── settings/
│       │       └── layout.tsx
│       ├── lib/
│       │   └── utils.ts       # Utility functions
│       ├── pages/             # Inertia pages (routes)
│       │   ├── auth/          # 7 auth pages
│       │   │   ├── confirm-password.tsx
│       │   │   ├── forgot-password.tsx
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   ├── reset-password.tsx
│       │   │   ├── two-factor-challenge.tsx
│       │   │   └── verify-email.tsx
│       │   ├── chat/          # AI chat workspace
│       │   ├── settings/      # Settings pages
│       │   │   ├── ai/        # Admin: AI provider & model pages
│       │   │   ├── appearance.tsx
│       │   │   ├── password.tsx
│       │   │   ├── profile.tsx
│       │   │   ├── two-factor.tsx
│       │   │   ├── users/     # Admin: User management
│       │   │   │   ├── index.tsx
│       │   │   │   ├── create.tsx
│       │   │   │   └── edit.tsx
│       │   │   └── roles/     # Admin: Role management
│       │   │       ├── index.tsx
│       │   │       ├── create.tsx
│       │   │       └── edit.tsx
│       │   ├── dashboard.tsx
│       │   └── welcome.tsx
│       ├── routes/            # Wayfinder generated types
│       ├── types/
│       │   └── index.d.ts     # TypeScript interfaces
│       ├── app.tsx            # Inertia app entry
│       └── ssr.tsx            # SSR entry point
├── routes/
│   ├── web.php                # Main web routes
│   ├── settings.php           # Settings routes (auth required)
│   └── console.php            # Console routes
├── tests/
│   ├── Feature/
│   │   ├── Auth/              # Authentication tests
│   │   │   ├── AuthenticationTest.php
│   │   │   ├── EmailVerificationTest.php
│   │   │   ├── PasswordConfirmationTest.php
│   │   │   ├── PasswordResetTest.php
│   │   │   ├── RegistrationTest.php
│   │   │   ├── TwoFactorChallengeTest.php
│   │   │   └── VerificationNotificationTest.php
│   │   ├── Settings/          # Settings tests
│   │   │   ├── PasswordUpdateTest.php
│   │   │   ├── ProfileUpdateTest.php
│   │   │   ├── RolesUsersTest.php  # Role & user management tests
│   │   │   └── TwoFactorAuthenticationTest.php
│   │   ├── DashboardTest.php
│   │   └── Filesystem/        # Storage tests
│   │       └── RustfsStorageTest.php  # RustFS S3 storage tests
│   ├── Unit/
│   │   ├── ChatAttachmentTest.php
│   │   └── ChatModelTest.php
│   ├── Pest.php
│   └── TestCase.php
├── composer.json              # PHP dependencies
├── package.json               # Node.js dependencies
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.config.js           # ESLint configuration
├── .prettierrc                # Prettier configuration
└── phpunit.xml                # PHPUnit configuration
```

## Laravel Boost MCP Tools

This project includes Laravel Boost MCP server, providing powerful tools for development assistance:

| Tool                    | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `application-info`      | Get comprehensive application info (versions, packages, models) |
| `browser-logs`          | Read browser console logs, errors, and exceptions               |
| `search-docs`           | Search version-specific Laravel ecosystem documentation         |
| `database-query`        | Execute read-only SQL queries                                   |
| `database-schema`       | Read database schema (tables, columns, indexes, FKs)            |
| `get-absolute-url`      | Generate absolute URLs for routes                               |
| `last-error`            | Get details of the last backend error/exception                 |
| `read-log-entries`      | Read Laravel log entries                                        |

These tools help with debugging, documentation lookup, and rapid development tasks.

## Available Commands

### Development

```bash
# Start all development services (server, queue, logs, vite)
composer run dev

# Start with SSR rendering
composer run dev:ssr

# Run Vite dev server only
npm run dev

# Build for production
npm run build

# Build with SSR
npm run build:ssr
```

### Artisan Make Commands

```bash
# Create generic PHP class
php artisan make:class Xxx

# Create controller
php artisan make:controller XxxController

# Create model with factory and seeder
php artisan make:model Xxx -fs

# Create form request validation
php artisan make:request XxxRequest

# Create migration
php artisan make:migration create_xxx_table

# Create Pest test
php artisan make:test Xxx --pest

# Create other Laravel components
php artisan make:model        # Eloquent model
php artisan make:factory      # Model factory
php artisan make:seeder       # Database seeder
php artisan make:middleware   # HTTP middleware
php artisan make:policy       # Authorization policy
php artisan make:event        # Event class
php artisan make:listener     # Event listener
php artisan make:job          # Queueable job
php artisan make:mail         # Mailable class
php artisan make:notification # Notification class
php artisan make:command      # Artisan command
```

### Testing

```bash
# Run all tests
composer run test
php artisan test

# Run tests with filter
php artisan test --filter=AuthenticationTest

# Run specific test file
php artisan test tests/Feature/Auth/AuthenticationTest.php

# Run with coverage
php artisan test --coverage
```

### Code Quality

```bash
# Format PHP code (fixes issues automatically)
vendor/bin/pint --dirty

# Format JavaScript/TypeScript
npm run format

# Check formatting without modifying
npm run format:check

# Lint JavaScript/TypeScript
npm run lint

# Type checking
npm run types
```

### Database

```bash
# Run migrations
php artisan migrate

# Run migrations in production
php artisan migrate --force

# Seed database
php artisan db:seed

# Fresh migration and seed
php artisan migrate:fresh --seed
```

### Console

```bash
# List available Artisan commands
php artisan list

# Clear caches
php artisan optimize:clear

# Generate Wayfinder types
php artisan wayfinder:generate
```

### Herd (macOS)

If using Laravel Herd, use the full paths:

```bash
~/Library/Application\ Support/Herd/bin/php ./vendor/bin/pint --dirty
~/Library/Application\ Support/Herd/bin/php artisan migrate --force
~/Library/Application\ Support/Herd/bin/composer install
~/Library/Application\ Support/Herd/bin/php artisan wayfinder:generate

# For npm build with Wayfinder (requires PHP in PATH)
PATH="$HOME/Library/Application Support/Herd/bin:$PATH" npm run build
PATH="$HOME/Library/Application Support/Herd/bin:$PATH" npm run build:ssr
```

## Getting Started

### Prerequisites

- PHP 8.4+
- Composer 2+
- Node.js 20+
- SQLite (default) or other database
- Laravel Herd (optional, for macOS)

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd inertia-react-starter
```

2. **Install PHP dependencies:**

```bash
composer install
```

3. **Install Node dependencies:**

```bash
npm install
```

4. **Set up environment:**

```bash
cp .env.example .env
php artisan key:generate
```

5. **Set up database:**

```bash
touch database/database.sqlite
php artisan migrate --seed
```

This will create:

- Default admin user: `admin@example.com` / `password`
- Default regular user: `user@example.com` / `password`
- Roles: `admin`, `user`
- Permissions: user._, role._, admin.access

6. **Build assets:**

```bash
npm run build
```

7. **Start development server:**

```bash
composer run dev
```

Visit `http://localhost:8000` to see your application.

### Default Credentials

After seeding, you can login with:

**Admin Account:**

- Email: `admin@example.com`
- Password: `password`
- Access: Full admin panel access

**User Account:**

- Email: `user@example.com`
- Password: `password`
- Access: Basic user features

## Laravel 13 Structure

This project uses Laravel 13's streamlined file structure:

- **No Console Kernel** - Console commands are configured in `routes/console.php`
- **Auto-registered Commands** - Files in `app/Console/Commands/` are automatically available
- **Middleware Bootstrap Registration** - Web middleware and aliases are registered in `bootstrap/app.php`
- **Service Providers** - Located in `bootstrap/providers.php`

### Bootstrap Configuration

The `bootstrap/app.php` file registers:

- Application middleware (appearance, Inertia, permission)
- Exception handling
- Route files (web, settings, console, health)

```php
return Application::configure()
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleAppearance::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'permission' => \App\Http\Middleware\EnsureUserHasPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle exceptions here
    })->create();
```

## Code Style Guidelines

### PHP (Laravel/Pint)

- Use PHP 8 constructor property promotion
- Explicit return type declarations for all methods
- PHPDoc blocks for complex methods and array shapes
- TitleCase for enum keys (e.g., `FavoritePerson`, `Monthly`)
- Curly braces for all control structures (even single-line)
- No empty `__construct()` methods with zero parameters
- Use appropriate PHP type hints for method parameters

```php
// Good example
class User extends Authenticatable
{
    public function __construct(public string $name) {}

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    protected function isAccessible(User $user, ?string $path = null): bool
    {
        // Implementation
        return true;
    }
}
```

### Eloquent Models

- Table name: snake_case, plural (users, blog_posts)
- Primary key: Use ULIDs via `HasUlids` trait (not auto-incrementing)
- Define casts in a `casts()` method, not `$casts` property
- Use `$fillable` for mass assignment
- Use camelCase for relationship methods (hasMany, belongsTo)

```php
use App\Concerns\HasUlids;

class Post extends Model
{
    use HasUlids; // Uses ULID instead of auto-incrementing ID

    protected $fillable = ['title', 'content', 'author_id'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

### Database Migrations

When modifying columns, always include ALL existing column attributes:

```php
// Good - includes all existing attributes
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 255)->nullable()->change();
});

// Always use useCurrent() for timestamps
$table->timestamp('created_at')->useCurrent();
```

### TypeScript/React

- Use TypeScript for all new files
- Prefer named imports for tree-shaking
- Use the `<Form>` component for Inertia forms
- Component props interfaces at the top of files
- Use `Link` from `@inertiajs/react` for navigation
- Use Wayfinder for type-safe routing

```tsx
import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes';

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}

export default function Button({ variant = 'primary' }: ButtonProps) {
    return (
        <>
            <button className={buttonVariants({ variant })} />
            <Link href={dashboard().url}>Dashboard</Link>
        </>
    );
}
```

### Tailwind CSS v4

- CSS-first configuration with `@theme` directive
- No `tailwind.config.js` needed (use `@theme` in CSS)
- Import Tailwind with `@import "tailwindcss";` (not `@tailwind` directives)
- Use `cn()` utility for conditional classes
- Use `gap-*` utilities for spacing in flex/grid layouts

```css
/* app.css */
@import 'tailwindcss';

@theme {
    --color-brand: oklch(0.72 0.11 178);
    --font-display: 'Inter', sans-serif;
}
```

#### Deprecated Utilities

Tailwind v4 removed these utilities. Use the replacements:

| Deprecated          | Replacement            |
| ------------------- | ---------------------- |
| `bg-opacity-50`     | `bg-black/50`          |
| `text-opacity-50`   | `text-black/50`        |
| `border-opacity-50` | `border-black/50`      |
| `ring-opacity-50`   | `ring-black/50`        |
| `flex-shrink-0`     | `shrink-0`             |
| `flex-grow-0`       | `grow-0`               |
| `overflow-ellipsis` | `text-ellipsis`        |
| `decoration-slice`  | `box-decoration-slice` |
| `decoration-clone`  | `box-decoration-clone` |

### Component Organization

- Place reusable components in `resources/js/components/`
- Place page-specific components in `resources/js/pages/`
- Use layouts in `resources/js/layouts/` for consistent page structure
- Follow the Base UI pattern for UI components via COSS UI

### Sortable Table Columns

The starter includes a reusable `TableColumnHeader` component for sortable columns with visual feedback:

**Features:**

- Click to toggle sort direction (asc → desc → none)
- Visual indicators with chevron icons (↑ asc, ↓ desc, faded ↑ none)
- Highlighted column when sorted (bg-muted)
- URL-based sort state (preserves sort across navigation)
- Type-safe with proper null/function checks

**Backend Implementation:**

```php
// Controller example (UserController.php)
if ($request->filled('sort')) {
    $sort = $request->input('sort');
    $direction = $request->input('direction', 'asc');
    $allowedSorts = ['name', 'email', 'created_at'];

    if (in_array($sort, $allowedSorts)) {
        $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
    }
}

// Use appends() instead of withQueryString() for controlled pagination params
$queryParams = [];
if ($request->filled('sort')) {
    $queryParams['sort'] = $request->input('sort');
    $queryParams['direction'] = $request->input('direction', 'asc');
}

$users = $query->paginate($perPage)->appends($queryParams);

return Inertia::render('settings/users/index', [
    'users' => $users,
    'filters' => [
        'sort' => $request->input('sort'),
        'direction' => $request->input('direction'),
    ],
]);
```

**Frontend Implementation:**

```tsx
// Example usage in table header
import { TableColumnHeader } from '@/components/ui/table-column-header';

const columns = useMemo<ColumnDef<User>[]>(
    () => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <TableColumnHeader
                    column={column}
                    title="User"
                    sort={filters.sort ?? null}
                    direction={filters.direction ?? null}
                />
            ),
        },
        // For virtual columns (computed values), use accessorFn
        {
            id: 'roles_count',
            accessorFn: (row) => row.roles?.length ?? 0,
            header: ({ column }) => (
                <TableColumnHeader
                    column={column}
                    title="Roles"
                    sort={filters.sort ?? null}
                    direction={filters.direction ?? null}
                />
            ),
        },
    ],
    [filters.sort, filters.direction],
);

// Handle sort state from URL params
useEffect(() => {
    const sortValue = filters.sort;
    const directionValue = filters.direction;

    if (sortValue && typeof sortValue === 'string') {
        const direction = directionValue === 'desc' ? 'desc' : 'asc';
        setSorting([{ id: sortValue, desc: direction === 'desc' }]);
    } else {
        setSorting([]);
    }
}, [filters.sort, filters.direction]);
```

**Key Implementation Notes:**

1. **Type Safety**: Always check `typeof === 'string'` to prevent JavaScript's native `sort()` function from being passed to TanStack Table
2. **URL State**: Sort state lives in URL params (`?sort=name&direction=asc`), not component state
3. **Pagination**: Use `appends()` instead of `withQueryString()` to control which params are included in pagination links
4. **Virtual Columns**: Use `accessorFn` for computed/virtual columns to enable sorting
5. **Null Coalescing**: Use `?? null` when passing filters to components to ensure proper null values

## Data Export

The starter includes a complete data export feature for Users, Roles, and Activity Logs management pages.

### Supported Export Formats

| Format | Description                                     | File Extension |
| ------ | ----------------------------------------------- | -------------- |
| Excel  | Spreadsheet with headers and auto-sized columns | `.xlsx`        |
| CSV    | Comma-separated values, Excel-compatible        | `.csv`         |
| JSON   | Structured data with metadata                   | `.json`        |

### Export Features

- **Filter-aware**: Export respects current filters
- **Activity logs**: Supports log/event/user/date filters and sorting
- **Responsive UI**: Mobile-friendly dropdown with filter and export actions
- **Format selection**: Choose XLSX, CSV, or JSON from dropdown menu
- **Progress indicators**: Loading states during export

### Backend Implementation

**Export Classes:**

```php
// app/Exports/UsersExport.php
class UsersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $query = User::with('roles')->latest();

        if (isset($this->filters['search'])) {
            $query->where(function ($q) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['status'])) {
            // Filter by email verification status
        }

        return $query;
    }
}
```

**Controller Export Method:**

```php
public function export(Request $request)
{
    $this->authorize('user.view');

    $filters = $request->only(['search', 'status']);
    $format = $request->input('format', 'xlsx');

    $filename = 'users-export-'.now()->format('Y-m-d-His');

    if ($format === 'json') {
        $users = User::with('roles')
            ->when(isset($filters['search']), ...)
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'email_verified' => (bool) $user->email_verified_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'data' => $users,
            'exported_at' => now()->format('Y-m-d H:i:s'),
            'total_count' => $users->count(),
        ])->header('Content-Disposition', "attachment; filename=\"{$filename}.json\"");
    }

    if ($format === 'csv') {
        return Excel::download(new UsersExport($filters), "{$filename}.csv", Excel::CSV);
    }

    return Excel::download(new UsersExport($filters), "{$filename}.xlsx");
}
```

**Routes:**

```php
// routes/settings.php
Route::middleware(['auth', 'permission:user.view'])
    ->get('users/export', [UserController::class, 'export'])
    ->name('users.export');

Route::middleware(['auth', 'permission:role.view'])
    ->get('roles/export', [RoleController::class, 'export'])
    ->name('roles.export');

Route::middleware(['auth', 'permission:admin.access'])
    ->get('activities/export', [ActivityLogController::class, 'export'])
    ->name('activities.export');
```

### Frontend Implementation

**ExportDropdown Component:**

```tsx
// resources/js/components/export/export-dropdown.tsx
interface ExportDropdownProps {
    getExportUrl: (format: 'xlsx' | 'csv' | 'json') => string;
    label?: string;
}

export function ExportDropdown({
    getExportUrl,
    label = 'Export',
}: ExportDropdownProps) {
    const formats = [
        { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
        { id: 'csv', label: 'CSV (.csv)', icon: FileText },
        { id: 'json', label: 'JSON (.json)', icon: FileJson },
    ];

    return (
        <Menu>
            <MenuTrigger
                render={
                    <Button variant="outline">
                        <Download className="mr-2 size-4" />
                        {label}
                    </Button>
                }
            />
            <MenuPopup align="end">
                <MenuGroup>
                    {formats.map((format) => (
                        <MenuItem
                            key={format.id}
                            onClick={() => handleExport(format.id)}
                        >
                            <format.icon className="mr-2 size-4" />
                            {format.label}
                        </MenuItem>
                    ))}
                </MenuGroup>
            </MenuPopup>
        </Menu>
    );
}
```

**Usage in Pages:**

```tsx
<ExportDropdown
    getExportUrl={(format) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter && statusFilter !== 'all') {
            params.set('status', statusFilter);
        }
        params.set('format', format);
        return `${usersRoutes.export().url}?${params.toString()}`;
    }}
    label="Export"
/>
```

### Responsive Mobile Header

On mobile devices, the header transforms to show:

```
[Header Text] ------------------- [Filter] [Export] [+]
```

- **Filter button**: Opens dropdown with search input and status filter
- **Export button**: Opens dropdown with format options (XLSX, CSV, JSON)
- **Add button**: Navigates to create page

On desktop (`lg` and above), all controls are visible inline with proper spacing.

## RustFS S3-Compatible Storage

This starter supports **RustFS** as an S3-compatible storage backend for file uploads and management.

### Package Installation

```bash
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

### Environment Configuration

Add the following to your `.env` file:

```env
# RustFS S3-Compatible Storage
RUSTFS_ACCESS_KEY=your-access-key
RUSTFS_SECRET_KEY=your-secret-key
RUSTFS_BUCKET=your-bucket-name
RUSTFS_DEFAULT_REGION=us-east-1
RUSTFS_ENDPOINT=http://localhost:9000
RUSTFS_URL=http://localhost:9000/your-bucket-name
RUSTFS_USE_PATH_STYLE_ENDPOINT=true

# Set as default filesystem disk (optional)
FILESYSTEM_DISK=rustfs
```

### Filesystem Configuration

The `rustfs` disk is configured in `config/filesystems.php`:

```php
'rustfs' => [
    'driver' => 's3',
    'key' => env('RUSTFS_ACCESS_KEY'),
    'secret' => env('RUSTFS_SECRET_KEY'),
    'region' => env('RUSTFS_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('RUSTFS_BUCKET'),
    'endpoint' => env('RUSTFS_ENDPOINT'),
    'url' => env('RUSTFS_URL'),
    'use_path_style_endpoint' => env('RUSTFS_USE_PATH_STYLE_ENDPOINT', true),
    'throw' => false,
    'report' => false,
],
```

### Usage Examples

**Upload a file:**

```php
use Illuminate\Support\Facades\Storage;

$content = 'File content here';
Storage::disk('rustfs')->put('avatars/user-id.jpg', $content);
```

**Read a file:**

```php
$content = Storage::disk('rustfs')->get('avatars/user-id.jpg');
```

**Delete a file:**

```php
Storage::disk('rustfs')->delete('avatars/user-id.jpg');
```

**Generate public URL:**

```php
$url = Storage::disk('rustfs')->url('avatars/user-id.jpg');
// Returns: http://localhost:9000/your-bucket-name/avatars/user-id.jpg
```

**List files:**

```php
$files = Storage::disk('rustfs')->files('avatars');
$directories = Storage::disk('rustfs')->directories('uploads');
```

### Integration Tests

The starter includes comprehensive integration tests for RustFS storage operations:

```bash
php artisan test --filter=RustfsStorageTest
```

**Test Coverage:**

| Test                                       | Description      |
| ------------------------------------------ | ---------------- |
| `can upload a text file`                   | PUT operation    |
| `can read uploaded file content`           | GET operation    |
| `can check if file exists`                 | EXISTS check     |
| `can list files in directory`              | LIST operation   |
| `can delete a file`                        | DELETE operation |
| `can get file size`                        | SIZE operation   |
| `can copy file to another location`        | COPY operation   |
| `can move/rename file`                     | MOVE operation   |
| `can generate public URL with bucket path` | URL generation   |

### Switching Between Storage Backends

The application supports multiple storage disks. You can switch between them:

```php
// Use RustFS
Storage::disk('rustfs')->put('file.txt', $content);

// Use local storage
Storage::disk('local')->put('file.txt', $content);

// Use the default disk (configured in FILESYSTEM_DISK)
Storage::put('file.txt', $content);
```

## Global Search (Laravel Scout + Typesense)

This starter includes a full-text search feature using Laravel Scout with Typesense driver, integrated into a command palette UI.

### Features

- **Command Palette UI** - Accessible via `⌘K` (Mac) or `Ctrl+K` (Windows)
- **Navigation Search** - Quick access to all pages (Main, Settings, Admin groups)
- **Full-text Search** - Search Users and Activities via Typesense
- **Permission-aware** - Activities only visible to users with `admin.access` permission
- **Debounced API** - Efficient search with 300ms debounce
- **Real-time Indexing** - New records automatically indexed on create/update

### Prerequisites

1. **Typesense Server** - Self-hosted or cloud instance

    ```bash
    # Docker (self-hosted)
    docker run -p 8108:8108 -v /tmp/typesense-data:/data typesense/typesense:latest \
      --data-dir /data --api-key=your-api-key
    ```

2. **Environment Variables** - Add to `.env`:

    ```env
    SCOUT_DRIVER=typesense
    TYPESENSE_API_KEY=your-api-key
    TYPESENSE_NODE_HOST=localhost
    TYPESENSE_NODE_PORT=8108
    TYPESENSE_NODE_PROTOCOL=http
    ```

### Importing Existing Data

After setting up Typesense, import existing records:

```bash
php artisan scout:import "App\Models\User"
php artisan scout:import "App\Models\Activity"
```

### Searchable Models

| Model      | Searchable Fields                  | Index Name   |
| ---------- | ---------------------------------- | ------------ |
| `User`     | `name`, `email`                    | `users`      |
| `Activity` | `description`, `event`, `log_name` | `activities` |

### Adding New Searchable Models

1. **Add Searchable trait to model:**

    ```php
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        public function toSearchableArray(): array
        {
            return [
                'id' => $this->id,
                'title' => $this->title,
                'content' => $this->content,
                'created_at' => $this->created_at?->timestamp,
            ];
        }
    }
    ```

2. **Configure schema in `config/scout.php`:**

    ```php
    'model-settings' => [
        Post::class => [
            'collection-schema' => [
                'fields' => [
                    ['name' => 'id', 'type' => 'string'],
                    ['name' => 'title', 'type' => 'string'],
                    ['name' => 'content', 'type' => 'string'],
                    ['name' => 'created_at', 'type' => 'int64'],
                ],
                'default_sorting_field' => 'created_at',
            ],
            'search-parameters' => [
                'query_by' => 'title,content',
            ],
        ],
    ],
    ```

3. **Add to GlobalSearchController:**

    ```php
    $posts = Post::search($query)->take(5)->get();

    if ($posts->isNotEmpty()) {
        $results[] = [
            'type' => 'posts',
            'label' => 'Posts',
            'items' => $posts->map(fn (Post $post) => [
                'id' => $post->id,
                'label' => $post->title,
                'description' => Str::limit($post->content, 50),
                'href' => route('posts.show', $post),
            ])->all(),
        ];
    }
    ```

4. **Import existing data:**

    ```bash
    php artisan scout:import "App\Models\Post"
    ```

### Search API Endpoint

| Method | Endpoint         | Parameters | Description                     |
| ------ | ---------------- | ---------- | ------------------------------- |
| GET    | `/global-search` | `q`        | Search query (min 2 characters) |

**Response Format:**

```json
{
    "results": [
        {
            "type": "users",
            "label": "Users",
            "items": [
                {
                    "id": "01ABC...",
                    "label": "John Doe",
                    "description": "john@example.com",
                    "href": "/settings/users/01ABC..."
                }
            ]
        }
    ]
}
```

## Routing

### Backend Routes

Routes are defined in `routes/web.php` and `routes/settings.php`:

```php
// routes/web.php
Route::get('/', fn() => Inertia::render('welcome'))->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
});

// routes/settings.php
Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function () {
    // Profile
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');

    // Admin routes (require admin.access permission)
    Route::middleware(['permission:admin.access'])->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
    });
});
```

### Frontend Routes (Wayfinder)

Generate type-safe route functions:

```bash
php artisan wayfinder:generate
# Or automatically generated during: npm run build
```

Usage in React components:

```tsx
import { dashboard } from '@/routes';
import settings from '@/routes/settings';
import { Form } from '@inertiajs/react';

// Get URL string
dashboard().url // "/dashboard"

// Form action with automatic method
<Form {...settings.users.store.form()}>
    <input name="name" />
</Form>

// Link with type-safe route
<Link href={settings.users.index().url}>Users</Link>

// With query parameters
settings.users.index({ query: { page: 2 } }).url // "/settings/users?page=2"

// Parameter binding
settings.users.edit({ user: userId }).url // "/settings/users/{userId}/edit"
```

## Laravel Fortify Features

This starter includes all Laravel Fortify authentication features. Configure features in `config/fortify.php`:

```php
'features' => [
    Features::registration(),
    Features::emailVerification(),
    Features::twoFactorAuthentication([
        'confirmPassword' => true,
        'confirm' => true, // Require OTP confirmation before enabling
    ]),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::resetPasswords(),
],
```

### Available Features

| Feature                                | Description              | Routes                                |
| -------------------------------------- | ------------------------ | ------------------------------------- |
| `Features::registration()`             | User registration        | `/register`                           |
| `Features::emailVerification()`        | Email verification flow  | `/email/verify`                       |
| `Features::twoFactorAuthentication()`  | 2FA with QR codes        | `/two-factor-challenge`               |
| `Features::updateProfileInformation()` | Update name, email       | `/user/profile-information`           |
| `Features::updatePasswords()`          | Change password          | `/user/password`                      |
| `Features::resetPasswords()`           | Password reset via email | `/forgot-password`, `/reset-password` |

Customize authentication logic in `app/Actions/Fortify/` directory.

## Real-time Notifications

This starter includes a complete notification system with database storage and real-time broadcasting via Laravel Reverb.

### Notification Components

| Component                 | Location                   | Description                                                  |
| ------------------------- | -------------------------- | ------------------------------------------------------------ |
| `SystemNotification`      | `app/Notifications/`       | Base notification class with broadcast and database channels |
| `NotificationController`  | `app/Http/Controllers/`    | API endpoints for mark read/unread/clear actions             |
| `notifications-sheet.tsx` | `resources/js/components/` | Notification center sheet/drawer UI                          |
| `echo.ts`                 | `resources/js/`            | Laravel Echo configuration for WebSocket                     |
| `routes/notifications/`   | `resources/js/routes/`     | Wayfinder types for notification routes                      |

### Notification Features

- **Database Storage**: All notifications stored in `notifications` table
- **Real-time Broadcasting**: WebSocket events via Laravel Reverb
- **Visual Feedback**: Toast notifications appear when broadcasts received
- **Unread Badge**: Red badge on user avatar showing unread count
- **Actions**: Mark single/all as read, clear all notifications

### Using Notifications

**Send a notification from backend:**

```php
use App\Notifications\SystemNotification;

$user->notify(new SystemNotification(
    message: 'Your account was created successfully',
    type: 'success' // 'info', 'warning', 'error', 'success'
));
```

**Broadcast channel (routes/channels.php):**

```php
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->id === (int) $id;
});
```

**Frontend - Listen for broadcasts:**

```tsx
import { useEcho } from '@/hooks/use-echo';

function NotificationsComponent() {
    useEcho<BroadcastNotification>(
        `App.Models.User.${auth.user.id}`,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (notification) => {
            // Show toast or update UI
        },
    );
}
```

### Environment Variables for Reverb

```env
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="localhost"
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME="http"
```

Start Reverb server:

```bash
php artisan reverb:start
```

## Spatie Laravel Permission

- **Spatie Laravel Activitylog 4.10** - Activity logging and monitoring
  This starter includes role and permission management using Spatie Laravel Permission.
- **Spatie Laravel Activitylog 4.10** - Activity logging and monitoring

### Pre-configured Roles

| Role    | Description   | Default Permissions |
| ------- | ------------- | ------------------- |
| `admin` | Administrator | All permissions     |
| `user`  | Regular user  | Basic access        |

### Available Permissions

| Permission     | Description           |
| -------------- | --------------------- |
| `admin.access` | Access to admin panel |
| `user.view`    | View users            |
| `user.create`  | Create users          |
| `user.update`  | Update users          |
| `user.delete`  | Delete users          |
| `role.view`    | View roles            |
| `role.create`  | Create roles          |
| `role.update`  | Update roles          |
| `role.delete`  | Delete roles          |

### Using Permissions

**Backend (Routes):**

```php
// Require permission for route group
Route::middleware(['permission:admin.access'])->group(function () {
    // Admin routes
});

// Check permission in controller
public function index()
{
    $this->authorize('user.view');
    // ...
}

// Check if user has permission
if ($user->hasPermissionTo('user.create')) {
    // ...
}
```

**Frontend (React):**

```tsx
import { usePage } from '@inertiajs/react';

const { auth } = usePage<{ auth: Auth }>().props;

// Check if user has permission
const canManageUsers = auth.permissions?.includes('user.view');

// Conditional rendering
{
    canManageUsers && (
        <Link href={settings.users.index().url}>Manage Users</Link>
    );
}
```

### ULID Primary Keys

All models use ULIDs instead of auto-incrementing integers for enhanced security:

```php
use App\Concerns\HasUlids;

class User extends Authenticatable
{
    use HasUlids;

    // id will be a ULID string (e.g., "01HQRZ9...")
    // - URL-safe
    // - Time-sortable
    // - No sequential ID exposure
}
```

## Database Schema

### Users Table

- `id` - ULID primary key
- `name` - User's full name
- `email` - Unique email address
- `email_verified_at` - Email verification timestamp
- `password` - Hashed password
- `two_factor_secret` - 2FA secret (encrypted)
- `two_factor_recovery_codes` - Recovery codes (encrypted)
- `two_factor_confirmed_at` - 2FA enablement timestamp
- `remember_token` - Remember me token
- `timestamps` - Created/updated timestamps

### Roles & Permissions Tables (Spatie)

- `roles` - Roles table with ULID
- `permissions` - Permissions table with ULID
- `model_has_permissions` - Pivot table (user ↔ permission)
- `model_has_roles` - Pivot table (user ↔ role)
- `role_has_permissions` - Pivot table (role ↔ permission)

### Additional Tables

- `password_reset_tokens` - Password reset tokens
- `sessions` - User session data
- `jobs` - Queue jobs
- `job_batches` - Job batches
- `failed_jobs` - Failed jobs
- `cache` - Cache data
- `cache_locks` - Cache locks
- `notifications` - User notifications with read/unread status

### Notifications Table

- `id` - ULID primary key
- `type` - Notification class name (e.g., 'SystemNotification')
- `data` - JSON payload (message, type, etc.)
- `read_at` - Timestamp when read (nullable)
- `notifiable_type` - Model type ('user')
- `notifiable_id` - User ULID
- `timestamps` - Created/updated timestamps

## Testing

### Writing Tests

Tests are written using Pest in `tests/Feature/`, `tests/Unit/`, and `tests/Browser/`:

```php
// Feature test example
test('users can authenticate using the login screen', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

// Test with permission checks
test('admin can access user management', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('settings.users.index'));

    $response->assertSuccessful();
});

// Pest dataset example
it('validates emails', function (string $email) {
    expect($email)->toContain('@');
})->with([
    'james' => 'james@example.com',
    'taylor' => 'taylor@example.com',
]);
```

### Pest v4 Browser Testing

Pest v4 supports browser testing for full-stack verification:

```php
// tests/Browser/ExampleTest.php
it('admin can manage users in browser', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);

    $page = visit('/settings/users');

    $page->assertSee('Users')
        ->assertNoJavascriptErrors()
        ->click('Create User')
        ->fill('name', 'John Doe')
        ->fill('email', 'john@example.com')
        ->click('Save')
        ->assertSee('User created successfully');
});

// Smoke testing multiple pages
it('public pages load without errors', function () {
    $pages = visit(['/', '/login', '/register']);

    $pages->assertNoJavascriptErrors()->assertNoConsoleLogs();
});
```

Browser tests can:

- Interact with pages (click, type, scroll, select, submit)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test different devices and viewports
- Switch color schemes (light/dark mode)
- Take screenshots for debugging

### Running Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter=AuthenticationTest

# Run browser tests
php artisan test tests/Browser/

# Run tests for specific feature
php artisan test tests/Feature/Settings/RolesUsersTest.php
```

### Testing Best Practices

- Test happy paths, failure paths, and edge cases
- Use datasets for repeated test data
- Mock external services with `mock()` or `$this->mock()`
- Use `RefreshDatabase` for feature tests requiring database state
- Use specific assertions: `assertForbidden()`, `assertNotFound()`, etc.
- Test permission checks for protected routes

## SSR (Server-Side Rendering)

The application supports server-side rendering for improved performance and SEO:

1. **Enable SSR** in `vite.config.ts`:

```ts
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            // ...
        }),
    ],
});
```

2. **Run SSR server:**

```bash
composer run dev:ssr
# Or
npm run build:ssr && php artisan inertia:start-ssr
```

3. **Benefits:**

- Faster initial page load
- Better SEO
- Improved perceived performance
- Progressive enhancement

## Configuration Files

| File                    | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `composer.json`         | PHP dependencies and scripts              |
| `package.json`          | Node.js dependencies and scripts          |
| `vite.config.ts`        | Vite bundler configuration with Wayfinder |
| `tsconfig.json`         | TypeScript compiler options               |
| `eslint.config.js`      | ESLint rules                              |
| `.prettierrc`           | Prettier formatting rules                 |
| `phpunit.xml`           | PHPUnit configuration                     |
| `bootstrap/app.php`     | Laravel application bootstrap             |
| `config/fortify.php`    | Authentication features                   |
| `config/permission.php` | Spatie Permission config                  |

## Environment Variables

Key environment variables in `.env`:

```env
APP_NAME=Laravel
APP_ENV=local
APP_URL=http://localhost

DB_CONNECTION=sqlite
# Or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120

VITE_APP_NAME="${APP_NAME}"

# Reverb WebSocket Configuration
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="localhost"
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME="http"
```

## Commit Message Convention

Follow Conventional Commits specification for clear commit history:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type Reference

| Type       | Description              | Example                             |
| ---------- | ------------------------ | ----------------------------------- |
| `feat`     | New feature              | `feat: add user profile page`       |
| `fix`      | Bug fix                  | `fix: resolve login redirect issue` |
| `docs`     | Documentation changes    | `docs: update README`               |
| `style`    | Code style (formatting)  | `style: format code with Pint`      |
| `refactor` | Code refactoring         | `refactor: extract form validation` |
| `perf`     | Performance improvements | `perf: optimize database query`     |
| `test`     | Adding/updating tests    | `test: add password reset test`     |
| `chore`    | Maintenance tasks        | `chore: update dependencies`        |
| `build`    | Build system changes     | `build: configure Vite SSR`         |
| `ci`       | CI/CD changes            | `ci: add GitHub Actions workflow`   |
| `revert`   | Revert commits           | `revert: undo auth changes`         |

### Rules

- Use lowercase for type and description
- Use imperative mood ("add" not "added")
- Max 72 characters for subject line
- Reference issues in footer: `Closes #123`
- Separate sections with blank lines

### Example Commit

```
feat(admin): add role management interface

Implement CRUD operations for roles with permission assignment.
Includes comprehensive tests and proper authorization checks.

Closes #45
```

## Chat Agent (AI Assistant)

This starter includes a Chat Agent feature powered by Laravel AI SDK with conversation memory.

### Features

- **Multiple AI Providers** - OpenAI, Anthropic, Bedrock Gateway, and more
- **Model Selection** - Choose from GPT-4o, GPT-5.2, Claude Sonnet, Claude Opus, Llama, etc.
- **Conversation Memory** - Chats are stored in database with full history
- **CLI Interface** - Interactive chat via Artisan command

### Configuration

Add your API keys to `.env`:

```env
# OpenAI (default)
OPENAI_API_KEY=sk-...

# OpenRouter / Bedrock Gateway
OPENROUTER_API_KEY=your-api-key
OPENROUTER_URL=https://bedrock-gateway.samarinda.ai/v1
```

### Chat Agent Class

The agent is defined in `app/Agents/ChatAgent.php`:

```php
use App\Agents\ChatAgent;

$agent = ChatAgent::make();
$response = $agent->prompt('Hello!');
echo $response->text;
```

### CLI Usage

```bash
# Single prompt
php artisan chat "Hello"
php artisan chat "What is Laravel?" --model=gpt-4o

# Interactive mode
php artisan chat

# Continue last conversation
php artisan chat --continue

# With specific provider and model
php artisan chat --provider=openrouter --model=us.anthropic.claude-sonnet-4-20250514-v1:0
```

### Available Options

| Option       | Description                | Default |
| ------------ | -------------------------- | ------- |
| `--model`    | AI model to use            | gpt-5.2 |
| `--provider` | AI provider                | openai  |
| `--continue` | Continue last conversation | -       |

### Supported Models

**OpenAI:**

- `gpt-4o`
- `gpt-5.2`

**OpenRouter / Bedrock Gateway:**

- `us.anthropic.claude-sonnet-4-20250514-v1:0`
- `us.anthropic.claude-opus-4-6-v1`
- `meta.llama3-1-70b-instruct-v1:0`
- And many more from the Bedrock catalog

### Database Tables

Conversations are stored in:

- `chats` - Conversation metadata (title, provider, model)
- `chat_messages` - Individual messages with role, content, usage

### Tests

```bash
# Run ChatAgent tests
php artisan test --filter=ChatAgentTest
```

## Contributing

This is a starter kit. Feel free to customize it according to your needs:

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
