using MediatR;

namespace JobTracker.Modules.Jobs.IntegrationEvents;

public sealed record JobCreatedIntegrationEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid? AssigneeId) : INotification;
