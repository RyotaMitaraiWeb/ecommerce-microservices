#!/bin/sh
set -e 

echo "Building NestJS project"
npm run build

echo "Starting app..."
npm run start:prod