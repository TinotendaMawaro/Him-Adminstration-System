@echo off
REM Add Node.js directory to PATH for this session
set PATH=C:\Program Files\nodejs;%PATH%

echo Starting Laravel development server...
start "Laravel" php artisan serve

echo Starting Vite development server...
start "Vite" cmd /c "npm run dev"

echo.
echo Both servers should be running now!
echo - Laravel: http://localhost:8000
echo - Vite: http://localhost:5173
pause
