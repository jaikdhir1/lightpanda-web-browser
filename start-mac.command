#!/bin/bash
# Double-click this file to launch the FULL Chrome browser (with sound + video).
# Requires Docker Desktop to be installed and running first: https://www.docker.com/products/docker-desktop/
cd "$(dirname "$0")"
echo "Starting your full Chrome browser (neko)..."
echo "(First run downloads the image - this can take a few minutes.)"
docker compose -f docker-compose.neko.yml up -d
sleep 4
open "http://localhost:8080" 2>/dev/null || true
echo ""
echo "Open http://localhost:8080 in your browser."
echo "Log in with username: neko   password: neko   (admin password: admin)"
echo ""
echo "To stop it later, run:  docker compose -f docker-compose.neko.yml down"
