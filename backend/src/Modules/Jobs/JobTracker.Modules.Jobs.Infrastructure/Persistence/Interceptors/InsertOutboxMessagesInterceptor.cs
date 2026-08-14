using JobTracker.SharedKernel.Outbox;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Jobs.Events;
using JobTracker.Modules.Jobs.IntegrationEvents;
using JobTracker.SharedKernel.Primitives;
using System.Text.Json;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Domain events stay inside the Jobs module (in-process reactions, invariant
/// orchestration). Integration events are the public contract other modules
/// consume. The outbox writes both in the SAME transaction as the aggregate
/// save, which is what gives at-least-once delivery: if the process crashes
/// after commit, Hangfire will retry unprocessed rows; if it crashes before
/// commit, nothing is published.
/// </summary>
internal sealed class InsertOutboxMessagesInterceptor : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            InsertOutboxMessages(eventData.Context);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void InsertOutboxMessages(DbContext context)
    {
        var aggregates = context.ChangeTracker
            .Entries<AggregateRoot<Guid>>()
            .Select(entry => entry.Entity)
            .ToList();

        var domainEvents = aggregates
            .SelectMany(aggregate =>
            {
                var events = aggregate.DomainEvents.ToList();
                aggregate.ClearDomainEvents();
                return events;
            })
            .ToList();

        if (domainEvents.Count == 0)
        {
            return;
        }

        var messages = domainEvents.SelectMany(Map).ToList();
        context.Set<OutboxMessage>().AddRange(messages);
    }

    private static IEnumerable<OutboxMessage> Map(IDomainEvent domainEvent)
    {
        yield return new OutboxMessage
        {
            Id = domainEvent.Id,
            Type = domainEvent.GetType().AssemblyQualifiedName ?? domainEvent.GetType().FullName!,
            Content = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), JsonOptions),
            OccurredOnUtc = domainEvent.OccurredOnUtc
        };

        if (domainEvent is JobCompletedDomainEvent completed)
        {
            var integration = new JobCompletedIntegrationEvent(
                completed.JobId,
                completed.OrganizationId,
                completed.CustomerId,
                completed.CompletedAtUtc);

            yield return new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = typeof(JobCompletedIntegrationEvent).AssemblyQualifiedName!,
                Content = JsonSerializer.Serialize(integration, JsonOptions),
                OccurredOnUtc = completed.OccurredOnUtc
            };
        }

        if (domainEvent is JobCreatedDomainEvent created)
        {
            var integration = new JobCreatedIntegrationEvent(
                created.JobId,
                created.OrganizationId,
                created.AssigneeId);

            yield return new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = typeof(JobCreatedIntegrationEvent).AssemblyQualifiedName!,
                Content = JsonSerializer.Serialize(integration, JsonOptions),
                OccurredOnUtc = created.OccurredOnUtc
            };
        }
    }
}
