@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\shiel\OneDrive\Documents\Trolley\tools"
if exist node_modules rmdir /s /q node_modules
call npm install
