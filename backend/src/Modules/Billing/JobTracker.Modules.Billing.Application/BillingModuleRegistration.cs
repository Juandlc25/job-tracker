using JobTracker.Modules.Billing.Application.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Billing.Application;

public static class BillingModuleRegistration
{
    public static IServiceCollection AddBillingModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<BillingDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Database"))
                .UseSnakeCaseNamingConvention());

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(BillingModuleRegistration).Assembly));

        return services;
    }
}
