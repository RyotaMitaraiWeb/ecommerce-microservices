# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Auth.Web/Auth.Web.csproj", "Auth.Web/"]

RUN dotnet restore "./Auth.Web/Auth.Web.csproj"
COPY . .
WORKDIR "/src/Auth.Web"
RUN dotnet build "./Auth.Web.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Auth.Web.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
COPY Auth.Web/init.sh /app/publish/init.sh
RUN chmod +x /app/publish/init.sh

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY Auth.Web ./Auth.Web
COPY Auth ./Auth
COPY Jwt ./Jwt
COPY Common ./Common
COPY Database ./Database
COPY Auth.Web/Migrations ./Migrations
WORKDIR /app/Auth.Web
RUN dotnet tool install --global dotnet-ef
WORKDIR /app
ENV PATH="$PATH:/root/.dotnet/tools"

ENTRYPOINT ["./init.sh"]