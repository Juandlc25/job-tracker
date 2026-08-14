using JobTracker.Modules.Jobs.Domain.Jobs.Events;
using JobTracker.SharedKernel.Primitives;
using JobTracker.SharedKernel.Results;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class Job : AggregateRoot<Guid>
{
    private readonly List<JobPhoto> _photos = [];

    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Address Address { get; private set; } = null!;
    public JobStatus Status { get; private set; }
    public DateTime? ScheduledDateUtc { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid OrganizationId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? StartedAtUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }
    public string? SignatureUrl { get; private set; }
    public DateTime? CancelledAtUtc { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    public IReadOnlyCollection<JobPhoto> Photos => _photos.AsReadOnly();

    private Job()
    {
    }

    public static Result<Job> Create(
        string title,
        string description,
        Address address,
        Guid customerId,
        Guid organizationId,
        string? notes,
        DateTime utcNow)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return Result.Failure<Job>(JobErrors.TitleRequired);
        }

        var job = new Job
        {
            Id = Guid.NewGuid(),
            Title = title.Trim(),
            Description = description.Trim(),
            Address = address,
            Status = JobStatus.Draft,
            CustomerId = customerId,
            OrganizationId = organizationId,
            Notes = notes,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        job.Raise(new JobCreatedDomainEvent(job.Id, organizationId, null));
        return Result.Success(job);
    }

    public Result Schedule(DateTime scheduledDateUtc, Guid assigneeId, DateTime utcNow)
    {
        if (IsTerminal())
        {
            return Result.Failure(JobErrors.TerminalState);
        }

        if (scheduledDateUtc < utcNow)
        {
            return Result.Failure(JobErrors.ScheduledInPast);
        }

        if (Status is not JobStatus.Draft and not JobStatus.Scheduled)
        {
            return Result.Failure(JobErrors.InvalidTransition);
        }

        Status = JobStatus.Scheduled;
        ScheduledDateUtc = scheduledDateUtc;
        AssigneeId = assigneeId;
        Touch(utcNow);
        return Result.Success();
    }

    public Result Start(DateTime utcNow)
    {
        if (IsTerminal())
        {
            return Result.Failure(JobErrors.TerminalState);
        }

        if (Status != JobStatus.Scheduled)
        {
            return Result.Failure(JobErrors.InvalidTransition);
        }

        Status = JobStatus.InProgress;
        StartedAtUtc = utcNow;
        Touch(utcNow);
        return Result.Success();
    }

    public Result Complete(string signatureUrl, DateTime utcNow)
    {
        if (IsTerminal())
        {
            return Result.Failure(JobErrors.TerminalState);
        }

        if (Status == JobStatus.Scheduled)
        {
            var started = Start(utcNow);
            if (started.IsFailure)
            {
                return started;
            }
        }

        if (Status != JobStatus.InProgress)
        {
            return Result.Failure(JobErrors.InvalidTransition);
        }

        if (string.IsNullOrWhiteSpace(signatureUrl))
        {
            return Result.Failure(JobErrors.SignatureRequired);
        }

        Status = JobStatus.Completed;
        CompletedAtUtc = utcNow;
        SignatureUrl = signatureUrl;
        Touch(utcNow);
        Raise(new JobCompletedDomainEvent(Id, OrganizationId, CustomerId, utcNow));
        return Result.Success();
    }

    public Result Cancel(string reason, DateTime utcNow)
    {
        if (IsTerminal())
        {
            return Result.Failure(JobErrors.TerminalState);
        }

        if (Status is not JobStatus.Scheduled and not JobStatus.InProgress)
        {
            return Result.Failure(JobErrors.InvalidTransition);
        }

        if (string.IsNullOrWhiteSpace(reason))
        {
            return Result.Failure(JobErrors.CancellationReasonRequired);
        }

        Status = JobStatus.Cancelled;
        CancelledAtUtc = utcNow;
        CancellationReason = reason;
        Touch(utcNow);
        Raise(new JobCancelledDomainEvent(Id, OrganizationId, reason));
        return Result.Success();
    }

    public Result AddPhoto(string url, DateTime capturedAtUtc, string? caption)
    {
        if (IsTerminal())
        {
            return Result.Failure(JobErrors.TerminalState);
        }

        _photos.Add(new JobPhoto(Guid.NewGuid(), url, capturedAtUtc, caption));
        return Result.Success();
    }

    private bool IsTerminal() => Status is JobStatus.Completed or JobStatus.Cancelled;

    private void Touch(DateTime utcNow) => UpdatedAtUtc = utcNow;
}
