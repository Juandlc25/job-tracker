using JobTracker.Modules.Jobs.Application.Abstractions.Messaging;

namespace JobTracker.Modules.Jobs.Application.Jobs.CreateJob;

public sealed record CreateJobCommand(
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal Latitude,
    decimal Longitude,
    DateTime ScheduledDate,
    Guid AssigneeId,
    Guid CustomerId,
    Guid OrganizationId,
    string? Notes) : ICommand<Guid>;
