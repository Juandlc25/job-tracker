using JobTracker.SharedKernel.Primitives;

namespace JobTracker.Modules.Jobs.Domain.Jobs.Events;

public sealed class JobCreatedDomainEvent : IDomainEvent
{
    public JobCreatedDomainEvent(Guid jobId, Guid organizationId, Guid? assigneeId)
    {
        JobId = jobId;
        OrganizationId = organizationId;
        AssigneeId = assigneeId;
    }

    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; } = DateTime.UtcNow;
    public Guid JobId { get; }
    public Guid OrganizationId { get; }
    public Guid? AssigneeId { get; }
}
