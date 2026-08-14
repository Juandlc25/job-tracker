using JobTracker.Modules.Jobs.Application.Abstractions.Data;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Infrastructure.Background;
using JobTracker.Modules.Jobs.Infrastructure.Notifications;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Interceptors;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Queries;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Repositories;
using JobTracker.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Infrastructure;

public static class JobsInfrastructureRegistration
{
    public static IServiceCollection AddJobsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<InsertOutboxMessagesInterceptor>();
        services.AddDbContext<JobsDbContext>((sp, options) =>
        {
            options.UseNpgsql(configuration.GetConnectionString("Database"))
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(sp.GetRequiredService<InsertOutboxMessagesInterceptor>());
        });

        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IJobReadQuery, JobReadQuery>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IEmailSender, SendGridEmailSender>();
        services.AddScoped<ProcessOutboxJob>();
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(JobsInfrastructureRegistration).Assembly));

        return services;
    }
}
