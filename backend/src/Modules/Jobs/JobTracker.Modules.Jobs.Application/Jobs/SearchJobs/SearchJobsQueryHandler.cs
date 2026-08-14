using JobTracker.Modules.Jobs.Application.Abstractions.Data;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Pagination;
using JobTracker.SharedKernel.Results;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

internal sealed class SearchJobsQueryHandler
    : IRequestHandler<SearchJobsQuery, Result<PagedList<JobResponse>>>
{
    private readonly IJobReadQuery _readQuery;

    public SearchJobsQueryHandler(IJobReadQuery readQuery)
    {
        _readQuery = readQuery;
    }

    public async Task<Result<PagedList<JobResponse>>> Handle(
        SearchJobsQuery request,
        CancellationToken cancellationToken)
    {
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;
        var page = await _readQuery.SearchAsync(
            new JobSearchCriteria(
                request.OrganizationId,
                request.Search,
                request.Statuses,
                request.DateFromUtc,
                request.DateToUtc,
                request.AssigneeId,
                request.Cursor,
                pageSize),
            cancellationToken);

        return Result.Success(page);
    }
}
