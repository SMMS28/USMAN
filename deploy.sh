#!/bin/bash

echo "🚀 SkillSwap Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the USMAN directory"
    exit 1
fi

echo "📦 Building React client..."
cd client
npm run build
cd ..

echo "✅ Build complete!"
echo ""
echo "🌐 Your application is ready for deployment!"
echo ""
echo "Choose your deployment platform:"
echo "1. Render (Recommended - Free)"
echo "2. Railway (Best for SQLite)"
echo "3. Vercel"
echo "4. Netlify"
echo ""
echo "📁 Your project folder is ready to upload:"
echo "   Location: $(pwd)"
echo ""
echo "🔧 To test locally:"
echo "   npm start"
echo "   Then visit: http://localhost:5001"
echo ""
echo "📖 See DEPLOYMENT_READY.md for detailed instructions"
