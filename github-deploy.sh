#!/bin/bash

echo "🚀 GitHub Deployment Helper"
echo "=========================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "📝 Current git status:"
git status --short

echo ""
echo "📤 Ready to push to GitHub!"
echo ""
echo "To complete deployment:"
echo "1. Create a repository on GitHub.com"
echo "2. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/skillswap-learning-network.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then deploy to Vercel, Netlify, or Render"
echo ""
echo "📖 See GITHUB_DEPLOYMENT.md for detailed instructions"
