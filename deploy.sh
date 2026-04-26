#!/bin/bash

echo "Starting ARC-INVENTORY Deployment..."

# Ensure the API Gateway API exists
echo "Ensuring API Gateway API exists..."
gcloud api-gateway apis create arc-inventory-api --project arc-492718 2>/dev/null || true

# Submit the Cloud Build pipeline
echo "Triggering Cloud Build for backend services..."
gcloud builds submit --config infra/cloudbuild.yaml .

echo "Backend deployment finished. Starting Frontend deploy.... separate via Firebase Hosting."

firebase deploy --only hosting