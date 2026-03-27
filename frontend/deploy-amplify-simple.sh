#!/bin/bash

# Simple AWS Amplify Deployment Script
# This creates an Amplify app and connects it to your GitHub repo

set -e

echo "🚀 Setting up AWS Amplify deployment..."

# Configuration
APP_NAME="nexus-frontend"
BRANCH_NAME="main"
REGION="ap-south-1"
GITHUB_REPO="https://github.com/swayamkanoje52/Nexus"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if app already exists
echo "📱 Checking if Amplify app exists..."
APP_ID=$(aws amplify list-apps --region $REGION --query "apps[?name=='$APP_NAME'].appId" --output text 2>/dev/null || echo "")

if [ -z "$APP_ID" ]; then
    echo "📱 Creating new Amplify app..."
    
    # Create the app with GitHub repository
    APP_RESULT=$(aws amplify create-app \
        --name "$APP_NAME" \
        --description "Nexus - AI-powered incident response platform" \
        --repository "$GITHUB_REPO" \
        --platform "WEB_COMPUTE" \
        --build-spec "version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
      - frontend/.pnpm-store/**/*" \
        --environment-variables \
            NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.nexus.app}" \
            POSTGRES_URL="${POSTGRES_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}" \
            _LIVE_UPDATES='[{"pkg":"next","type":"npm","version":"latest"}]' \
        --region $REGION \
        --output json)
    
    APP_ID=$(echo $APP_RESULT | jq -r '.app.appId')
    echo "✅ Created Amplify app with ID: $APP_ID"
else
    echo "✅ Found existing app with ID: $APP_ID"
fi

# Get app details
APP_URL=$(aws amplify get-app \
    --app-id $APP_ID \
    --region $REGION \
    --query 'app.defaultDomain' \
    --output text)

echo ""
echo "🎉 Amplify app is ready!"
echo "📱 App ID: $APP_ID"
echo "🌐 App will be available at: https://${BRANCH_NAME}.${APP_URL}"
echo ""
echo "📋 Next steps:"
echo "1. Go to Amplify Console: https://${REGION}.console.aws.amazon.com/amplify/home?region=${REGION}#/${APP_ID}"
echo "2. Click 'Connect GitHub' to authorize Amplify to access your repository"
echo "3. Select the repository: swayamkanoje52/Nexus"
echo "4. Select branch: main"
echo "5. Keep the default build settings or modify as needed"
echo "6. Click 'Save and deploy'"
echo ""
echo "The app will automatically build and deploy when you connect the GitHub repository!"