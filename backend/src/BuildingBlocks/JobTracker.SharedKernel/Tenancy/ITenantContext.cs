namespace JobTracker.SharedKernel.Tenancy;

public interface ITenantContext
{
    Guid OrganizationId { get; }
}

public sealed class TenantContext : ITenantContext
{
    public Guid OrganizationId { get; set; }
}
