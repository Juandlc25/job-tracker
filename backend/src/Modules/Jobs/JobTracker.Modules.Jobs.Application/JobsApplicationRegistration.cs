using FluentValidation;
using JobTracker.Modules.Jobs.Application.Behaviors;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Application;

public static class JobsApplicationRegistration
{
    public static IServiceCollection AddJobsApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(JobsApplicationRegistration).Assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssembly(typeof(JobsApplicationRegistration).Assembly);
        return services;
    }
}
