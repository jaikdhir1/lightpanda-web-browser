@echo off
echo Starting Lightpanda Browser...
docker compose up -d --build
echo.
echo Open http://localhost:3000 in your browser.
pause
