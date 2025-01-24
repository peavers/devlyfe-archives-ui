#!/bin/bash

# Exit on error
set -e

STACK_NAME="DevlyfeCdkStack"

echo "Building SvelteKit app..."
npm run build

echo "Getting deployment information from CloudFormation..."
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

echo "Deploying to S3 bucket: $BUCKET_NAME"
aws s3 sync ./build "s3://$BUCKET_NAME"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*"

echo "Deployment complete!"