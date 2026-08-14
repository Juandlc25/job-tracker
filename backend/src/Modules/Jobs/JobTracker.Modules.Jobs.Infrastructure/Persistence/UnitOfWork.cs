using JobTracker.SharedKernel.Persistence;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence;

internal sealed class UnitOfWork : IUnitOfWork
{
    private readonly JobsDbContext _dbContext;

    public UnitOfWork(JobsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
