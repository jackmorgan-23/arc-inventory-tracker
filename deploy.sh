#!/bin/bash

echo "Starting ARC-INVENTORY Deployment..."

# Ensure the API Gateway API exists
echo "Ensuring API Gateway API exists..."
gcloud api-gateway apis create arc-inventory-api --project arc-492718 2>/dev/null || true

echo "Refreshing hosted item catalog from Cloud Storage..."
gcloud storage cp gs://arc-raiders-item-cache/items_v2.json frontend/public/items_v2.json

echo "Building frontend..."
cd frontend || exit 1
npm run build
cd - >/dev/null || exit 1

echo "Frontend..."
firebase deploy --only hosting
# Submit the Cloud Build pipeline
echo "Triggering Cloud Build for backend services..."
gcloud builds submit --config infra/cloudbuild.yaml .

echo "Backend deployment finished. Starting Frontend deploy.... separate via Firebase Hosting."
