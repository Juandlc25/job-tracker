using JobTracker.Modules.Jobs.Application.Abstractions.Data;
using JobTracker.Modules.Jobs.Application.Abstractions.Messaging;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Pagination;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

public sealed record SearchJobsQuery(
    Guid OrganizationId,
    string? Search,
    IReadOnlyCollection<JobStatus>? Statuses,
    DateTime? DateFromUtc,
    DateTime? DateToUtc,
    Guid? AssigneeId,
    string? Cursor,
    int PageSize = 20) : IQuery<PagedList<JobResponse>>;
