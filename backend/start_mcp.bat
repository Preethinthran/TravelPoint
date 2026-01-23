@echo off
TITLE TravelPoint Google Sheets MCP Server
cd /d "%~dp0"

echo ---------------------------------------------------
echo    STARTING GOOGLE SHEETS LOCAL MCP SERVER
echo ---------------------------------------------------

:: 1. Validate Credentials
:: 1. Validate Token
if not exist "sheets-token.json" (
    echo [ERROR] sheets-token.json not found!
    echo Please run the setup script first: npm run setup:sheets
    pause
    exit /b 1
)

:: 3. Run Server
echo.
echo [INFO] Launching Local Server (OAuth)...
echo [NOTE] The process will start below. It uses Standard Input/Output (stdio).
echo ---------------------------------------------------

call npx ts-node src/mcp-sheets/index.ts

:: Pause only if it crashes immediately
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server crashed with code %ERRORLEVEL%
    pause
)
