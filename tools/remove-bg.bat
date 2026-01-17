@echo off
REM Remove background from game assets
REM Usage: remove-bg.bat [file.png | --all | --category=buttons]

cd /d "%~dp0"
node remove-background.mjs %*
pause
