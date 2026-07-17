@echo off
title Copa Memoria - Servidor del juego
cd /d "%~dp0"
echo.
echo  ==========================================
echo    COPA MEMORIA - MUNDIAL 2026
echo  ==========================================
echo.
echo  Iniciando servidor del juego...
echo  El juego se abrira en tu navegador.
echo.
echo  IMPORTANTE: No cierres esta ventana negra
echo  mientras juegas. Para salir: cierra esta
echo  ventana o presiona Ctrl+C.
echo.
start "" "http://localhost:8000"
python -m http.server 8000
