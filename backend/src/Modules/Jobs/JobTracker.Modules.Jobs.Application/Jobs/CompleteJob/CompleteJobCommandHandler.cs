using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Persistence;
using JobTracker.SharedKernel.Results;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

internal sealed class CompleteJobCommandHandler : IRequestHandler<CompleteJobCommand, Result<Unit>>
{
    private readonly IJobRepository _jobs;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteJobCommandHandler(IJobRepository jobs, IUnitOfWork unitOfWork)
    {
        _jobs = jobs;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(CompleteJobCommand request, CancellationToken cancellationToken)
    {
        var job = await _jobs.GetByIdAsync(request.JobId, cancellationToken);
        if (job is null)
        {
            return Result.Failure<Unit>(JobErrors.NotFound);
        }

        var completed = job.Complete(request.SignatureUrl, DateTime.UtcNow);
        if (completed.IsFailure)
        {
            return Result.Failure<Unit>(completed.Error);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(Unit.Value);
    }
}
