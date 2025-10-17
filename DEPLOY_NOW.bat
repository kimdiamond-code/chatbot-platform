cd /d "%~dp0"
echo Deploying critical fix to Vercel...
vercel --prod --yes
pause
