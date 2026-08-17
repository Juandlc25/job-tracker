FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY backend/ .
COPY sql/001_schema.sql /sql/001_schema.sql
RUN dotnet restore JobTracker.sln
RUN dotnet publish src/JobTracker.Api/JobTracker.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5080
EXPOSE 5080
ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
