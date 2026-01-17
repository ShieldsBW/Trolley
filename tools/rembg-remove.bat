@echo off
REM AI Background Removal using rembg
REM Usage: rembg-remove.bat <input.png> [output.png]

py -3.11 "%~dp0rembg-remove.py" %*
