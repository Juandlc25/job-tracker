using Hangfire;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.SharedKernel.Outbox;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace JobTracker.Modules.Jobs.Infrastructure.Background;

public sealed class ProcessOutboxJob
{
    private readonly JobsDbContext _dbContext;
    private readonly IPublisher _publisher;
    private readonly ILogger<ProcessOutboxJob> _logger;

    public ProcessOutboxJob(
        JobsDbContext dbContext,
        IPublisher publisher,
        ILogger<ProcessOutboxJob> logger)
    {
        _dbContext = dbContext;
        _publisher = publisher;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 5)]
    [DisableConcurrentExecution(timeoutInSeconds: 60)]
    public async Task Execute(CancellationToken cancellationToken)
    {
        var messages = await _dbContext.Set<OutboxMessage>()
            .Where(message => message.ProcessedOnUtc == null)
            .OrderBy(message => message.OccurredOnUtc)
            .Take(20)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                var type = Type.GetType(message.Type, throwOnError: false);
                if (type is null)
                {
                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = $"Unknown type {message.Type}";
                    continue;
                }

                var payload = JsonSerializer.Deserialize(
                    message.Content,
                    type,
                    new JsonSerializerOptions(JsonSerializerDefaults.Web));

                if (payload is INotification notification)
                {
                    await _publisher.Publish(notification, cancellationToken);
                }

                message.ProcessedOnUtc = DateTime.UtcNow;
                message.Error = null;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to process outbox message {MessageId}", message.Id);
                message.Error = exception.Message;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
