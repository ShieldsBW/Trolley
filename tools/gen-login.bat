@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\shiel\OneDrive\Documents\Trolley\tools"
node asset-pipeline.js --budget=5 generate --id=login_bg
