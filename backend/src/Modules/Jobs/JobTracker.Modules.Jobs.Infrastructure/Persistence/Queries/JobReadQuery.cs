using JobTracker.Modules.Jobs.Application.Abstractions.Data;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Queries;

internal sealed class JobReadQuery : IJobReadQuery
{
    private readonly JobsDbContext _dbContext;

    public JobReadQuery(JobsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedList<JobResponse>> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Jobs.AsNoTracking()
            .Where(job => job.OrganizationId == criteria.OrganizationId);

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

        query = ApplyCursor(query, criteria.Cursor);
        query = query.OrderByDescending(job => job.CreatedAtUtc).ThenByDescending(job => job.Id);

        var total = await query.CountAsync(cancellationToken);
        var page = await query
            .Take(criteria.PageSize + 1)
            .Select(job => new JobResponse(
                job.Id,
                job.Title,
                job.Description,
                job.Status.ToString(),
                job.Address.Street,
                job.Address.City,
                job.Address.State,
                job.Address.ZipCode,
                job.Address.Latitude,
                job.Address.Longitude,
                job.ScheduledDateUtc,
                job.AssigneeId,
                job.CustomerId,
                job.OrganizationId,
                job.Notes,
                job.StartedAtUtc,
                job.CompletedAtUtc,
                job.SignatureUrl,
                job.Photos.Count,
                job.CreatedAtUtc,
                job.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        string? nextCursor = null;
        if (page.Count > criteria.PageSize)
        {
            var last = page[criteria.PageSize - 1];
            nextCursor = Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes($"{last.CreatedAt:O}|{last.Id}"));
            page = page.Take(criteria.PageSize).ToList();
        }

        return new PagedList<JobResponse>(page, total, nextCursor);
    }

    public async Task<JobResponse?> GetByIdAsync(
        Guid id,
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Jobs.AsNoTracking()
            .Where(job => job.Id == id && job.OrganizationId == organizationId)
            .Select(job => new JobResponse(
                job.Id,
                job.Title,
                job.Description,
                job.Status.ToString(),
                job.Address.Street,
                job.Address.City,
                job.Address.State,
                job.Address.ZipCode,
                job.Address.Latitude,
                job.Address.Longitude,
                job.ScheduledDateUtc,
                job.AssigneeId,
                job.CustomerId,
                job.OrganizationId,
                job.Notes,
                job.StartedAtUtc,
                job.CompletedAtUtc,
                job.SignatureUrl,
                job.Photos.Count,
                job.CreatedAtUtc,
                job.UpdatedAtUtc))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static IQueryable<Job> ApplyCursor(IQueryable<Job> query, string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor))
        {
            return query;
        }

        try
        {
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var parts = decoded.Split('|');
            if (parts.Length != 2 ||
                !DateTime.TryParse(parts[0], out var createdAt) ||
                !Guid.TryParse(parts[1], out var id))
            {
                return query;
            }

            return query.Where(job =>
                job.CreatedAtUtc < createdAt ||
                (job.CreatedAtUtc == createdAt && job.Id.CompareTo(id) < 0));
        }
        catch (FormatException)
        {
            return query;
        }
    }
}
