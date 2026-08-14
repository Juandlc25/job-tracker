using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.UnitTests.Domain;

public class JobTests
{
    private static Address Dallas() =>
        Address.Create("1400 Commerce St", "Dallas", "TX", "75201", 32.77m, -96.79m).Value;

    private static Job Draft(DateTime utcNow) =>
        Job.Create("Tear-off", "Replace shingles after hail.", Dallas(), Guid.NewGuid(), Guid.NewGuid(), null, utcNow).Value;

    [Fact]
    public void Create_raises_job_created_domain_event()
    {
        var utcNow = DateTime.UtcNow;
        var job = Draft(utcNow);

        Assert.Equal(JobStatus.Draft, job.Status);
        Assert.Contains(job.DomainEvents, e => e.GetType().Name == "JobCreatedDomainEvent");
    }

    [Fact]
    public void Schedule_in_the_past_fails()
    {
        var utcNow = DateTime.UtcNow;
        var job = Draft(utcNow);

        var result = job.Schedule(utcNow.AddMinutes(-1), Guid.NewGuid(), utcNow);

        Assert.True(result.IsFailure);
        Assert.Equal(JobErrors.ScheduledInPast.Code, result.Error.Code);
    }

    [Fact]
    public void Start_from_draft_is_invalid()
    {
        var job = Draft(DateTime.UtcNow);

        var result = job.Start(DateTime.UtcNow);

        Assert.True(result.IsFailure);
        Assert.Equal(JobErrors.InvalidTransition.Code, result.Error.Code);
    }

    [Fact]
    public void Complete_from_scheduled_starts_then_completes_and_raises_event()
    {
        var utcNow = DateTime.UtcNow;
        var job = Draft(utcNow);
        job.ClearDomainEvents();
        job.Schedule(utcNow.AddHours(2), Guid.NewGuid(), utcNow);

        var result = job.Complete("https://cdn.example/sig.png", utcNow);

        Assert.True(result.IsSuccess);
        Assert.Equal(JobStatus.Completed, job.Status);
        Assert.Contains(job.DomainEvents, e => e.GetType().Name == "JobCompletedDomainEvent");
    }

    [Fact]
    public void Completed_job_cannot_be_cancelled()
    {
        var utcNow = DateTime.UtcNow;
        var job = Draft(utcNow);
        job.Schedule(utcNow.AddHours(2), Guid.NewGuid(), utcNow);
        job.Complete("https://cdn.example/sig.png", utcNow);

        var result = job.Cancel("customer changed mind", utcNow);

        Assert.True(result.IsFailure);
        Assert.Equal(JobErrors.TerminalState.Code, result.Error.Code);
    }

    [Fact]
    public void Photos_are_only_added_through_the_aggregate()
    {
        var job = Draft(DateTime.UtcNow);
        var added = job.AddPhoto("https://cdn.example/1.jpg", DateTime.UtcNow, "south slope");

        Assert.True(added.IsSuccess);
        Assert.Single(job.Photos);
    }
}
