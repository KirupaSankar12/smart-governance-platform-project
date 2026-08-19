@echo off
REM Start reporting-service with Gemini AI key
REM This reads GEMINI_API_KEY from Windows User environment variables

echo Starting reporting-service on port 8087 with AI Governance Intelligence...
cd /d "%~dp0reporting-service"
java -Xmx256m -jar "%~dp0reporting-service\target\reporting-service-1.0.0.jar"
