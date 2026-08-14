using JobTracker.Modules.Billing.Application.Persistence;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Persistence;

public static class DatabaseInitializer
{
    private static readonly Guid Tenant = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid CrewA = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid CrewB = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid CustomerA = Guid.Parse("44444444-4444-4444-4444-444444444444");
    private static readonly Guid CustomerB = Guid.Parse("55555555-5555-5555-5555-555555555555");

    public static async Task SeedAsync(JobsDbContext jobs, BillingDbContext billing)
    {
        await jobs.Database.EnsureCreatedAsync();

        var schemaPath = Path.Combine(AppContext.BaseDirectory, "sql", "001_schema.sql");
        if (File.Exists(schemaPath))
        {
            var sql = await File.ReadAllTextAsync(schemaPath);
            await jobs.Database.ExecuteSqlRawAsync(sql);
        }
        else
        {
            await billing.Database.EnsureCreatedAsync();
        }

        if (jobs.Jobs.Any())
        {
            return;
        }

        var utcNow = DateTime.UtcNow;
        var dallas = Address.Create("1400 Commerce St", "Dallas", "TX", "75201", 32.7767m, -96.7970m).Value;
        var highland = Address.Create("4500 Beverly Dr", "Dallas", "TX", "75205", 32.8300m, -96.7900m).Value;
        var plano = Address.Create("6000 Windhaven Pkwy", "Plano", "TX", "75093", 33.0200m, -96.7000m).Value;

        var bungalow = Job.Create(
            "Full tear-off — Oak Lawn bungalow",
            "Replace 24sq architectural shingles after hail damage.",
            dallas,
            CustomerA,
            Tenant,
            null,
            utcNow.AddDays(-2)).Value;
        bungalow.Schedule(utcNow.AddDays(3), CrewA, utcNow);

        var leak = Job.Create(
            "Leak repair — Highland Park",
            "Flashing around chimney and two pipe boots.",
            highland,
            CustomerB,
            Tenant,
            "Customer on site after 2pm",
            utcNow.AddDays(-5)).Value;
        leak.Schedule(utcNow.AddDays(-1), CrewB, utcNow.AddDays(-1));
        leak.Start(utcNow.AddDays(-1));
        leak.AddPhoto("https://cdn.jobtracker.local/photos/1.jpg", utcNow.AddDays(-1), "North slope");

        var inspection = Job.Create(
            "Inspection — Plano commercial",
            "TPO roof inspection, 18,000 sq ft.",
            plano,
            CustomerA,
            Tenant,
            "Waiting on access badges",
            utcNow.AddDays(-1)).Value;

        jobs.Jobs.AddRange(bungalow, leak, inspection);
        await jobs.SaveChangesAsync();
    }
}
