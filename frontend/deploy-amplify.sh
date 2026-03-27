#!/bin/bash

# AWS Amplify Deployment Script
# This script deploys the frontend directly to AWS Amplify

set -e

echo "🚀 Starting AWS Amplify deployment..."

# Configuration
APP_NAME="nexus-frontend"
BRANCH_NAME="main"
REGION="ap-south-1"
STAGE="PRODUCTION"

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
    
    # Create the app
    APP_ID=$(aws amplify create-app \
        --name "$APP_NAME" \
        --description "Nexus - AI-powered incident response platform" \
        --platform "WEB" \
        --region $REGION \
        --query 'app.appId' \
        --output text)
    
    echo "✅ Created Amplify app with ID: $APP_ID"
    
    # Create branch
    echo "🌿 Creating branch..."
    aws amplify create-branch \
        --app-id $APP_ID \
        --branch-name $BRANCH_NAME \
        --stage $STAGE \
        --region $REGION
    
    echo "✅ Created branch: $BRANCH_NAME"
else
    echo "✅ Found existing app with ID: $APP_ID"
fi

# Update build settings
echo "🔧 Updating build settings..."
cat > amplify-build-spec.json << 'EOF'
{
  "version": 1,
  "frontend": {
    "phases": {
      "preBuild": {
        "commands": [
          "npm install -g pnpm",
          "pnpm install"
        ]
      },
      "build": {
        "commands": [
          "pnpm run build"
        ]
      }
    },
    "artifacts": {
      "baseDirectory": ".next",
      "files": [
        "**/*"
      ]
    },
    "cache": {
      "paths": [
        "node_modules/**/*",
        ".pnpm-store/**/*"
      ]
    }
  }
}
EOF

# Update app with build settings
aws amplify update-app \
    --app-id $APP_ID \
    --build-spec file://amplify-build-spec.json \
    --region $REGION

# Set environment variables
echo "🔐 Setting environment variables..."
aws amplify update-branch \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --environment-variables \
        NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}" \
        POSTGRES_URL="${POSTGRES_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}" \
        AMPLIFY_DIFF_DEPLOY=false \
        AMPLIFY_SKIP_BACKEND_BUILD=true \
    --region $REGION

# Create deployment
echo "📦 Creating deployment..."

# Create a zip file of the current directory
echo "📦 Creating deployment archive..."
zip -r deployment.zip . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".git/*" \
    -x "*.log" \
    -x "deployment.zip"

# Upload to S3 (Amplify needs a source URL)
BUCKET_NAME="amplify-deployments-${APP_ID}-${RANDOM}"
echo "📤 Creating S3 bucket for deployment..."

aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || true
aws s3 cp deployment.zip s3://$BUCKET_NAME/deployment.zip --region $REGION

# Get presigned URL
SOURCE_URL=$(aws s3 presign s3://$BUCKET_NAME/deployment.zip --expires-in 3600 --region $REGION)

# Start deployment
echo "🚀 Starting deployment..."
JOB_ID=$(aws amplify start-deployment \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --source-url "$SOURCE_URL" \
    --region $REGION \
    --query 'jobSummary.jobId' \
    --output text)

echo "✅ Deployment started with Job ID: $JOB_ID"

# Monitor deployment
echo "📊 Monitoring deployment progress..."
while true; do
    STATUS=$(aws amplify get-job \
        --app-id $APP_ID \
        --branch-name $BRANCH_NAME \
        --job-id $JOB_ID \
        --region $REGION \
        --query 'job.summary.status' \
        --output text)
    
    echo "   Status: $STATUS"
    
    if [ "$STATUS" = "SUCCEED" ]; then
        echo "✅ Deployment successful!"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
        echo "❌ Deployment failed with status: $STATUS"
        
        # Get error details
        aws amplify get-job \
            --app-id $APP_ID \
            --branch-name $BRANCH_NAME \
            --job-id $JOB_ID \
            --region $REGION \
            --query 'job.steps[?status==`FAILED`]'
        
        # Cleanup
        rm -f deployment.zip amplify-build-spec.json
        aws s3 rm s3://$BUCKET_NAME/deployment.zip --region $REGION
        aws s3 rb s3://$BUCKET_NAME --region $REGION
        exit 1
    fi
    
    sleep 10
done

# Get app URL
APP_URL=$(aws amplify get-app \
    --app-id $APP_ID \
    --region $REGION \
    --query 'app.defaultDomain' \
    --output text)

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your app is available at: https://${BRANCH_NAME}.${APP_URL}"
echo "📱 Amplify Console: https://${REGION}.console.aws.amazon.com/amplify/home?region=${REGION}#/${APP_ID}"

# Cleanup
echo "🧹 Cleaning up..."
rm -f deployment.zip amplify-build-spec.json
aws s3 rm s3://$BUCKET_NAME/deployment.zip --region $REGION
aws s3 rb s3://$BUCKET_NAME --region $REGION

echo "✅ Done!"