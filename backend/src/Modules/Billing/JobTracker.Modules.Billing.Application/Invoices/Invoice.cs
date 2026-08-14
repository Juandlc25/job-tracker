namespace JobTracker.Modules.Billing.Application.Invoices;

public sealed class Invoice
{
    public Guid Id { get; private set; }
    public Guid JobId { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateTime CompletedAtUtc { get; private set; }
    public string IdempotencyKey { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private Invoice()
    {
    }

    public static Invoice Create(
        Guid jobId,
        Guid organizationId,
        Guid customerId,
        DateTime completedAtUtc,
        decimal amount,
        DateTime utcNow)
    {
        return new Invoice
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            OrganizationId = organizationId,
            CustomerId = customerId,
            CompletedAtUtc = completedAtUtc,
            IdempotencyKey = $"{jobId:N}:{completedAtUtc:O}",
            Amount = amount,
            CreatedAtUtc = utcNow
        };
    }
}
