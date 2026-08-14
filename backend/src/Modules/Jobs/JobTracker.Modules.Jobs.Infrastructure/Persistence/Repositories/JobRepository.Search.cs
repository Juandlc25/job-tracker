using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Repositories;

internal sealed partial class JobRepository
{
    public async Task<PagedList<Job>> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Jobs
            .AsNoTracking()
            .Where(job => job.OrganizationId == criteria.OrganizationId);

        query = ApplyFilters(query, criteria);
        query = query.OrderByDescending(job => job.CreatedAtUtc).ThenByDescending(job => job.Id);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Take(criteria.PageSize).ToListAsync(cancellationToken);
        return new PagedList<Job>(items, total, null);
    }

    private static IQueryable<Job> ApplyFilters(IQueryable<Job> query, JobSearchCriteria criteria)
    {
        if (!string.IsNullOrWhiteSpace(criteria.Search))
        {
            var term = criteria.Search;
            query = query.Where(job =>
                EF.Functions.ILike(job.Title, $"%{term}%") ||
                EF.Functions.ILike(job.Description, $"%{term}%"));
        }

        if (criteria.Statuses is { Count: > 0 })
        {
            query = query.Where(job => criteria.Statuses.Contains(job.Status));
        }

        if (criteria.DateFromUtc is not null)
        {
            query = query.Where(job => job.ScheduledDateUtc >= criteria.DateFromUtc);
        }

        if (criteria.DateToUtc is not null)
        {
            query = query.Where(job => job.ScheduledDateUtc <= criteria.DateToUtc);
        }

        if (criteria.AssigneeId is not null)
        {
            query = query.Where(job => job.AssigneeId == criteria.AssigneeId);
        }

        return query;
    }
}
