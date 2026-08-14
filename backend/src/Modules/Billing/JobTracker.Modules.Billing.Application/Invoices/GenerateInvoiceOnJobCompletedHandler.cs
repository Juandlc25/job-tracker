using JobTracker.Modules.Billing.Application.Invoices;
using JobTracker.Modules.Billing.Application.Persistence;
using JobTracker.Modules.Jobs.IntegrationEvents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Billing.Application.Invoices;

/// <summary>
/// Idempotency is guaranteed by a unique constraint on
/// IdempotencyKey = JobId + CompletedAt. At-least-once outbox delivery may
/// invoke this handler twice; the second insert is ignored.
/// </summary>
internal sealed class GenerateInvoiceOnJobCompletedHandler
    : INotificationHandler<JobCompletedIntegrationEvent>
{
    private readonly BillingDbContext _dbContext;
    private readonly ILogger<GenerateInvoiceOnJobCompletedHandler> _logger;

    public GenerateInvoiceOnJobCompletedHandler(
        BillingDbContext dbContext,
        ILogger<GenerateInvoiceOnJobCompletedHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Handle(JobCompletedIntegrationEvent notification, CancellationToken cancellationToken)
    {
        var key = $"{notification.JobId:N}:{notification.CompletedAtUtc:O}";
        var exists = await _dbContext.Invoices
            .AnyAsync(invoice => invoice.IdempotencyKey == key, cancellationToken);

        if (exists)
        {
            _logger.LogInformation("Invoice already exists for {Key}", key);
            return;
        }

        var invoice = Invoice.Create(
            notification.JobId,
            notification.OrganizationId,
            notification.CustomerId,
            notification.CompletedAtUtc,
            0m,
            DateTime.UtcNow);

        _dbContext.Invoices.Add(invoice);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            _logger.LogInformation("Duplicate invoice insert ignored for {Key}", key);
        }
    }
}
