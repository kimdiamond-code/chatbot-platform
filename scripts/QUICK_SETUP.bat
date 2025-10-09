@echo off
echo 🚀 ChatBot Platform Quick Setup
echo ================================

echo.
echo 📦 Installing main dependencies...
call npm install

echo.
echo 🔧 Setting up CORS proxy...
cd cors-proxy
call npm install
cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 🎯 Next Steps:
echo 1. Update .env file with your Supabase credentials
echo 2. Run: npm run dev (for main app)
echo 3. Run: npm run proxy (for CORS proxy)
echo 4. Open: http://localhost:3000
echo.
echo 📖 See FIXED_SETUP_GUIDE.md for detailed instructions
echo.
pause