using JobTracker.SharedKernel.Primitives;

namespace JobTracker.Modules.Jobs.Domain.Jobs.Events;

public sealed class JobCompletedDomainEvent : IDomainEvent
{
    public JobCompletedDomainEvent(
        Guid jobId,
        Guid organizationId,
        Guid customerId,
        DateTime completedAtUtc)
    {
        JobId = jobId;
        OrganizationId = organizationId;
        CustomerId = customerId;
        CompletedAtUtc = completedAtUtc;
    }

    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; } = DateTime.UtcNow;
    public Guid JobId { get; }
    public Guid OrganizationId { get; }
    public Guid CustomerId { get; }
    public DateTime CompletedAtUtc { get; }
}
