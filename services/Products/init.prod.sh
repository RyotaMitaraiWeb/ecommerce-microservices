#!/bin/sh
set -e 

echo "Building NestJS project"
npm run build

echo "Running migrations..."
npm run migration:run

echo "Starting app..."
npm run start:prod