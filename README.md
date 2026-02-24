# Heartfelt Management System

A full-stack web application built with **Laravel** (API & backend) and **React** (frontend), bundled with **Vite** and styled with **Tailwind CSS**.

---

## Requirements

Make sure you have the following installed before getting started:

- PHP >= 8.1
- Composer
- Node.js >= 18
- npm >= 9
- MySQL or any Laravel-supported database

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/heartfelt-management-system.git
cd heartfelt-management-system
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Set up your environment

```bash
cp .env.example .env
php artisan key:generate
```

Then open `.env` and update your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=heartfelt
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run database migrations

```bash
php artisan migrate
```

Optionally seed the database with sample data:

```bash
php artisan db:seed
```

---

## Running the App

You need **two terminal windows** running simultaneously — one for Laravel, one for Vite.

### Terminal 1 — Laravel backend

```bash
php artisan serve
```

The app will be available at `http://localhost:8000`.

### Terminal 2 — Vite dev server (React + Tailwind)

```bash
npm run dev
```

Vite runs at `http://localhost:5173` and hot-reloads your React components automatically.

> **Important:** Both servers must be running at the same time during development. Laravel serves the app, Vite handles the frontend assets.

---

## Building for Production

When you're ready to deploy, compile your frontend assets:

```bash
npm run build
```

This generates optimized files in `public/build/`. Laravel will automatically serve these instead of the Vite dev server.

---

## Project Structure

```
├── app/                  # Laravel application logic
├── resources/
│   ├── css/
│   │   └── app.css       # Tailwind CSS entry point
│   ├── js/
│   │   ├── app.jsx       # React entry point
│   │   └── components/   # React components
│   └── views/
│       └── welcome.blade.php  # Main blade template (loads React)
├── routes/
│   └── web.php           # Laravel web routes
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

---

## Key Technologies

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Laravel 10+                         |
| Frontend   | React 18 + React Router DOM 7       |
| Bundler    | Vite 7 + laravel-vite-plugin        |
| Styling    | Tailwind CSS 3                      |
| HTTP       | Axios                               |

---

## Common Issues

**Blank page / preamble error**
Make sure your `welcome.blade.php` includes `@viteReactRefresh` before `@vite`:
```blade
@viteReactRefresh
@vite(['resources/css/app.css', 'resources/js/app.jsx'])
```

**Styles not applying**
Ensure `resources/css/app.css` contains the Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Assets not updating**
Delete the stale build folder and restart Vite:
```bash
rm -rf public/build
npm run dev
```

---

## License

MIT