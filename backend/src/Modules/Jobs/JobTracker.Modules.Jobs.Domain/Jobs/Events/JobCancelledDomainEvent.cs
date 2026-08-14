using JobTracker.SharedKernel.Primitives;

namespace JobTracker.Modules.Jobs.Domain.Jobs.Events;

public sealed class JobCancelledDomainEvent : IDomainEvent
{
    public JobCancelledDomainEvent(Guid jobId, Guid organizationId, string reason)
    {
        JobId = jobId;
        OrganizationId = organizationId;
        Reason = reason;
    }

    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; } = DateTime.UtcNow;
    public Guid JobId { get; }
    public Guid OrganizationId { get; }
    public string Reason { get; }
}
