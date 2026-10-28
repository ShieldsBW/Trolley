@echo off
REM Serves the game at http://localhost:8000 so Firebase login works.
REM (Opening the HTML file directly via file:// is blocked by the API key's referrer restrictions.)
cd /d "%~dp0"
start "" http://localhost:8000/trolley_game.html
python -m http.server 8000
