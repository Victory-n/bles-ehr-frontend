#!/bin/bash

# BrightLife EHR Deployment Script
# This script should be run on the EC2 instance in the project directory.

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Starting BrightLife EHR Deployment ==="

# 1. Pull latest code
echo "Pulling latest code from git..."
git pull

# 2. Install dependencies
echo "Installing dependencies..."
npm install

# 3. Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# 4. Deploy Database Migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 5. Build the Frontend
echo "Building the Next.js frontend..."
npm run build

# 6. Restart/Start PM2 Apps
echo "Restarting application processes via PM2..."
pm2 startOrRestart ecosystem.config.js --env production

# Save PM2 process list so it persists across server reboots
echo "Saving PM2 list..."
pm2 save

echo "=== Deployment Completed Successfully! ==="
