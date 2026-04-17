@echo off
cd /d "c:\Users\tmawa\Documents\GitHub\HIM-Administration-System"
set "PHP=C:\xampp\php\php.exe"
set "COMPOSER=C:\composer\composer.bat"

echo Starting Laravel setup...

echo Copying .env...
copy .env.example .env >nul

echo Installing Composer dependencies...
%COMPOSER% install

echo Generating app key...
%PHP% artisan key:generate

echo Running migrations and seeding...
%PHP% artisan migrate:fresh --seed

echo Setup complete! Start XAMPP Apache/MySQL first, then run:
echo npm run dev
echo %PHP% artisan serve
pause
