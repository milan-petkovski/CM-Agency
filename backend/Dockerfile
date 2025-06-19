FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5055

ENV ASPNETCORE_URLS=http://+:5055

USER app
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG configuration=Release
WORKDIR /src
COPY ["backend/CmAgency.csproj", "backend/"]
RUN dotnet restore "backend/CmAgency.csproj"
COPY . .
WORKDIR "/src/backend"
RUN dotnet build "CmAgency.csproj" -c "$configuration" -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "CmAgency.csproj" -c "$configuration" -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CmAgency.dll"]
