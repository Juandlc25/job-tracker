using JobTracker.Modules.Jobs.Infrastructure.Notifications;
using JobTracker.Modules.Jobs.IntegrationEvents;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Jobs.Infrastructure.Notifications;

internal sealed class NotifyCrewOnJobCreatedHandler : INotificationHandler<JobCreatedIntegrationEvent>
{
    private readonly IEmailSender _email;
    private readonly ILogger<NotifyCrewOnJobCreatedHandler> _logger;

    public NotifyCrewOnJobCreatedHandler(
        IEmailSender email,
        ILogger<NotifyCrewOnJobCreatedHandler> logger)
    {
        _email = email;
        _logger = logger;
    }

    public async Task Handle(JobCreatedIntegrationEvent notification, CancellationToken cancellationToken)
    {
        if (notification.AssigneeId is null)
        {
            return;
        }

        _logger.LogInformation(
            "Notifying crew {AssigneeId} about job {JobId}",
            notification.AssigneeId,
            notification.JobId);

        await _email.SendAsync(
            $"crew-{notification.AssigneeId}@jobtracker.local",
            "New job assigned",
            $"Job {notification.JobId} was assigned to your crew.",
            cancellationToken);
    }
}

internal sealed class NotifyCustomerOnJobCompletedHandler : INotificationHandler<JobCompletedIntegrationEvent>
{
    private readonly IEmailSender _email;

    public NotifyCustomerOnJobCompletedHandler(IEmailSender email)
    {
        _email = email;
    }

    public Task Handle(JobCompletedIntegrationEvent notification, CancellationToken cancellationToken) =>
        _email.SendAsync(
            $"customer-{notification.CustomerId}@jobtracker.local",
            "Your roofing job is complete",
            $"Job {notification.JobId} was completed at {notification.CompletedAtUtc:u}. An invoice is on the way.",
            cancellationToken);
}
