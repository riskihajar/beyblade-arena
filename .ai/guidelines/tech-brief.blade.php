## Tech Brief

| Category      | Technology              | Purpose                     |
| ------------- | ----------------------- | --------------------------- |
| **Backend**   | PHP {{ PHP_VERSION }}   | Server-side language        |
| **Framework** | Laravel {{ app(\Laravel\Roster\Roster::class)->packages()['laravel/framework'] ?? '12' }} | Application framework       |
| **Auth**      | Laravel Fortify 1       | Headless authentication     |
| **Routing**   | Laravel Wayfinder       | Type-safe frontend routes   |
| **Bridge**    | Inertia.js 2            | SSR between Laravel & React |
| **Testing**   | Pest 4                  | PHP testing framework       |
| **Formatter** | Laravel Pint 1          | PHP code style              |
| **Frontend**      | React 19                | UI library                  |
| **Language**      | TypeScript 5.7          | Type-safe JavaScript        |
| **Styling**       | Tailwind CSS 4          | Utility-first CSS           |
| **UI Components** | Base UI 1              | Unstyled, accessible components |
|                  | COSS UI                | Extended Base UI with styling |
|                  | Shadcn                 | Component management system |
| **Build**         | Vite 7                  | Frontend bundler            |
| **Linter**        | ESLint 9                | JS/TS linting               |
| **Formatter**     | Prettier 3              | Code formatting             |
