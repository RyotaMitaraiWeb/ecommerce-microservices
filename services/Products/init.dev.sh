#!/bin/sh

echo "Building NestJS project (generating Swagger schemas...)"
npm run build

echo "Starting app..."
npm run start:dev