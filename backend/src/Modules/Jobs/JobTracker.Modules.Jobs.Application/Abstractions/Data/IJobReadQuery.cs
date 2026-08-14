using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Pagination;

namespace JobTracker.Modules.Jobs.Application.Abstractions.Data;

public sealed record JobResponse(
    Guid Id,
    string Title,
    string Description,
    string Status,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal Latitude,
    decimal Longitude,
    DateTime? ScheduledDate,
    Guid? AssigneeId,
    Guid CustomerId,
    Guid OrganizationId,
    string? Notes,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    string? SignatureUrl,
    int PhotoCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public interface IJobReadQuery
{
    Task<PagedList<JobResponse>> SearchAsync(JobSearchCriteria criteria, CancellationToken cancellationToken = default);

    Task<JobResponse?> GetByIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
}
