@echo off
setlocal enabledelayedexpansion

if exist "dist\" (
    echo Removing existing dist folder...
    rmdir /s /q dist >nul
)

echo Building project...
call npm run build
if errorlevel 1 exit /b 1

echo Creating .tmp\OneStroke...
mkdir ".tmp\OneStroke" 2>nul

echo Copying dist contents...
xcopy "dist\*" ".tmp\OneStroke\" /e /i /q /y >nul

echo Copying README.md...
copy /y "README.md" ".tmp\OneStroke\" >nul

where 7z.exe >nul 2>&1
if not errorlevel 1 (
    echo Creating OneStroke.zip with 7z...
    cd /d ".tmp"
    7z a -tzip "OneStroke.zip" "OneStroke" >nul
    cd ..
    move /y ".tmp\OneStroke.zip" "OneStroke.zip" >nul
) else (
  echo ERROR: Neither 7z is available.
)

rmdir /s /q ".tmp"

echo Packaging complete.