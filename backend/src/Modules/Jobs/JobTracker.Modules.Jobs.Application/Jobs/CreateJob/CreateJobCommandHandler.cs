using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Persistence;
using JobTracker.SharedKernel.Results;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CreateJob;

internal sealed class CreateJobCommandHandler : IRequestHandler<CreateJobCommand, Result<Guid>>
{
    private readonly IJobRepository _jobs;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJobCommandHandler(IJobRepository jobs, IUnitOfWork unitOfWork)
    {
        _jobs = jobs;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateJobCommand request, CancellationToken cancellationToken)
    {
        var address = Address.Create(
            request.Street,
            request.City,
            request.State,
            request.ZipCode,
            request.Latitude,
            request.Longitude);

        if (address.IsFailure)
        {
            return Result.Failure<Guid>(address.Error);
        }

        var utcNow = DateTime.UtcNow;
        var job = Job.Create(
            request.Title,
            request.Description,
            address.Value,
            request.CustomerId,
            request.OrganizationId,
            request.Notes,
            utcNow);

        if (job.IsFailure)
        {
            return Result.Failure<Guid>(job.Error);
        }

        var scheduled = job.Value.Schedule(request.ScheduledDate, request.AssigneeId, utcNow);
        if (scheduled.IsFailure)
        {
            return Result.Failure<Guid>(scheduled.Error);
        }

        await _jobs.AddAsync(job.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(job.Value.Id);
    }
}
