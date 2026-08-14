using MediatR;

namespace JobTracker.Modules.Jobs.IntegrationEvents;

public sealed record JobCompletedIntegrationEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid CustomerId,
    DateTime CompletedAtUtc) : INotification;
