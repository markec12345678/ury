#!/bin/bash
# URY Dashboard - GitHub Push Script
# 
# BEFORE RUNNING:
# 1. Create a new repo on GitHub: https://github.com/new
#    Name: ury-dashboard (or your preferred name)
#    Do NOT initialize with README/gitignore (we have our own)
#
# 2. Run this script with your repo URL:
#    bash scripts/push-to-github.sh https://github.com/your-username/ury-dashboard.git

REPO_URL="${1:-https://github.com/your-username/ury-dashboard.git}"

echo "🚀 Pushing URY Dashboard to GitHub..."
echo "   Remote: $REPO_URL"
echo ""

# Add remote
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# Ensure we're on main branch
git branch -M main

# Push
git push -u origin main

echo ""
echo "✅ Done! Your dashboard is now live at:"
echo "   $REPO_URL"
