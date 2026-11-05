@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

REM ── Find PHP: PATH first, then the usual XAMPP locations ─────────────────────────────
set "PHP="
for /f "delims=" %%P in ('where php 2^>nul') do if not defined PHP set "PHP=%%P"
if not defined PHP if exist "%USERPROFILE%\Documents\xamp\php\php.exe" set "PHP=%USERPROFILE%\Documents\xamp\php\php.exe"
if not defined PHP if exist "%USERPROFILE%\Documents\xampp\php\php.exe" set "PHP=%USERPROFILE%\Documents\xampp\php\php.exe"
if not defined PHP if exist "C:\xampp\php\php.exe" set "PHP=C:\xampp\php\php.exe"
if not defined PHP (
    echo.
    echo  Could not find PHP. Install XAMPP or add its "php" folder to your PATH, then run this again.
    echo.
    pause
    exit /b 1
)
for %%D in ("%PHP%") do set "PHPDIR=%%~dpD"
set "PATH=%PHPDIR%;C:\Program Files\nodejs;%PATH%"

echo Using PHP: %PHP%
echo Make sure XAMPP MySQL is running first.
echo.

REM ── Everything the system needs, each in its own window ──────────────────────────────
echo [1/4] Web server      http://localhost:8000   (API + Master/Finance/Events portals, 4 PHP workers)
set "PHP_BIN=%PHP%"
start "HIM - Laravel server" node scripts\dev-server.mjs

echo [2/4] Scheduler       report reminders, greetings, online-payment reconciliation
start "HIM - Scheduler" "%PHP%" artisan schedule:work

echo [3/4] Queue worker    sends emails and other background jobs
start "HIM - Queue worker" "%PHP%" artisan queue:work --tries=3 --sleep=3 --max-time=3600

echo [4/4] Vite            http://localhost:5173   (React member/partner/pastor/HOD portals)
start "HIM - Vite" cmd /c "npm run dev"

echo.
echo  All four are starting. Close their windows to stop them.
echo  Open http://localhost:5173 for the member portals and http://localhost:8000/admin for staff.
echo.
pause
