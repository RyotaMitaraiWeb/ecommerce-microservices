#!/bin/sh
set -e 

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Preparing Prisma client..."
npx prisma generate

echo "Seeding the database..."
npx prisma db seed

echo "Building NestJS project (generating Swagger schemas...)"
npm run build

echo "Starting app..."
npm run start:prod