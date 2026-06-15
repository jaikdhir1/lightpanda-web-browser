@echo off
REM Double-click this file to launch the FULL Chrome browser (with sound + video).
REM Requires Docker Desktop installed and running: https://www.docker.com/products/docker-desktop/
cd /d "%~dp0"
echo Starting your full Chrome browser (neko)...
echo (First run downloads the image - this can take a few minutes.)
docker compose -f docker-compose.neko.yml up -d
timeout /t 4 >nul
start "" "http://localhost:8080"
echo.
echo Open http://localhost:8080 in your browser.
echo Log in with username: neko   password: neko   (admin password: admin)
echo.
echo To stop it later, run:  docker compose -f docker-compose.neko.yml down
pause
