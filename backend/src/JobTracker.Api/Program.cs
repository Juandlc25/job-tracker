using System.Threading.RateLimiting;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using JobTracker.Api.HangfireAuth;
using JobTracker.Api.Endpoints;
using JobTracker.Api.Middleware;
using JobTracker.Api.Persistence;
using JobTracker.Modules.Billing.Application;
using JobTracker.Modules.Billing.Application.Persistence;
using JobTracker.Modules.Jobs.Application;
using JobTracker.Modules.Jobs.Infrastructure;
using JobTracker.Modules.Jobs.Infrastructure.Background;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.SharedKernel.Tenancy;
using Microsoft.AspNetCore.RateLimiting;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddJobsApplication();
builder.Services.AddJobsInfrastructure(builder.Configuration);
builder.Services.AddBillingModule(builder.Configuration);

builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(
                builder.Configuration["FrontendOrigin"] ?? "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddSlidingWindowLimiter("api", limiter =>
    {
        limiter.PermitLimit = 60;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.SegmentsPerWindow = 6;
        limiter.QueueLimit = 0;
    });
});

builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("Database"))));
builder.Services.AddHangfireServer();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("JobTracker.Api"))
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation();
        tracing.AddHttpClientInstrumentation();
        var otlp = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(otlp))
        {
            tracing.AddOtlpExporter();
        }
    });

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("frontend");
app.UseRateLimiter();
app.UseMiddleware<TenantMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapJobsEndpoints();
app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new HangfireDashboardAuthorizationFilter()],
});

using (var scope = app.Services.CreateScope())
{
    var jobs = scope.ServiceProvider.GetRequiredService<JobsDbContext>();
    var billing = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
    await DatabaseInitializer.SeedAsync(jobs, billing);
}

RecurringJob.AddOrUpdate<ProcessOutboxJob>(
    "process-outbox",
    job => job.Execute(CancellationToken.None),
    Cron.Minutely);

app.Run();

public partial class Program;
