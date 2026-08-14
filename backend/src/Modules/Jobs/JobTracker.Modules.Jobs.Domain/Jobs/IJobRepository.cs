using JobTracker.SharedKernel.Pagination;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed record JobSearchCriteria(
    Guid OrganizationId,
    string? Search,
    IReadOnlyCollection<JobStatus>? Statuses,
    DateTime? DateFromUtc,
    DateTime? DateToUtc,
    Guid? AssigneeId,
    string? Cursor,
    int PageSize);

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Job job, CancellationToken cancellationToken = default);

    Task<PagedList<Job>> SearchAsync(JobSearchCriteria criteria, CancellationToken cancellationToken = default);
}
