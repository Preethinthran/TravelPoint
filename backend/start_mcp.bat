@echo off
cd /d E:\Intern\Bus_Reservation\backend
set DOTENV_CONFIG_SILENT=true
call npx -y ts-node src/mcp/travelServer.ts