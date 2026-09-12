@echo off
title TERRA NOVA // Cinematic Orbital Observatory
echo ========================================================
echo   TERRA NOVA // CINEMATIC ORBITAL OBSERVATORY
echo ========================================================
echo Starting local WebGL server at http://localhost:5173/ ...
echo Opening default web browser...
start "" "http://localhost:5173/"
npm.cmd run preview -- --port 5173
pause
