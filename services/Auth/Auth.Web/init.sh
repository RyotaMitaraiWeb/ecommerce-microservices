#!/bin/sh
echo "Applying EF Core migrations..."
dotnet ef database update --verbose --project /app/Auth.Web/Auth.Web.csproj --startup-project /app/Auth.Web/Auth.Web.csproj

echo "Running the app..."
exec dotnet Auth.Web.dll