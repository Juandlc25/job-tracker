using JobTracker.Modules.Jobs.Application.Abstractions.Data;
using JobTracker.Modules.Jobs.Application.Abstractions.Messaging;
using JobTracker.SharedKernel.Tenancy;

namespace JobTracker.Modules.Jobs.Application.Jobs.GetJob;

public sealed record GetJobQuery(Guid JobId) : IQuery<JobResponse>;

internal sealed class GetJobQueryHandler
    : MediatR.IRequestHandler<GetJobQuery, JobTracker.SharedKernel.Results.Result<JobResponse>>
{
    private readonly IJobReadQuery _readQuery;
    private readonly ITenantContext _tenant;

    public GetJobQueryHandler(IJobReadQuery readQuery, ITenantContext tenant)
    {
        _readQuery = readQuery;
        _tenant = tenant;
    }

    public async Task<JobTracker.SharedKernel.Results.Result<JobResponse>> Handle(
        GetJobQuery request,
        CancellationToken cancellationToken)
    {
        var job = await _readQuery.GetByIdAsync(request.JobId, _tenant.OrganizationId, cancellationToken);
        return job is null
            ? JobTracker.SharedKernel.Results.Result.Failure<JobResponse>(
                JobTracker.Modules.Jobs.Domain.Jobs.JobErrors.NotFound)
            : JobTracker.SharedKernel.Results.Result.Success(job);
    }
}
