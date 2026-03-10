@echo off
REM MongoDB startup script for Windows

echo Checking if MongoDB is installed...

REM Try to start MongoDB
net start MongoDB

if %ERRORLEVEL% EQU 0 (
    echo MongoDB started successfully!
    pause
) else (
    echo MongoDB is not installed or failed to start
    echo.
    echo To install MongoDB:
    echo 1. Download from https://www.mongodb.com/try/download/community
    echo 2. Run the installer and follow the instructions
    echo 3. During installation, make sure to install MongoDB as a Windows Service
    echo 4. Then run this script again
    echo.
    pause
)
