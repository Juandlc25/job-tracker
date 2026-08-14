using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Persistence;
using Moq;

namespace JobTracker.Modules.Jobs.UnitTests.Application;

public class CreateJobCommandHandlerTests
{
    [Fact]
    public async Task Handle_persists_job_and_raises_created_event()
    {
        Job? captured = null;
        var repository = new Mock<IJobRepository>();
        repository
            .Setup(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((job, _) => captured = job)
            .Returns(Task.CompletedTask);

        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new CreateJobCommandHandler(repository.Object, unitOfWork.Object);
        var command = new CreateJobCommand(
            "Tear-off",
            "Replace 24sq after hail.",
            "1400 Commerce St",
            "Dallas",
            "TX",
            "75201",
            32.77m,
            -96.79m,
            DateTime.UtcNow.AddDays(2),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(captured);
        Assert.Equal(JobStatus.Scheduled, captured!.Status);
        Assert.Contains(captured.DomainEvents, e => e.GetType().Name == "JobCreatedDomainEvent");
        unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
