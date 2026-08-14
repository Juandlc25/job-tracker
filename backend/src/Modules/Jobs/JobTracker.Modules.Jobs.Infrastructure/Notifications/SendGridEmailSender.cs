using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Jobs.Infrastructure.Notifications;

/// <summary>
/// SendGrid-shaped adapter. In production this would call SendGridClient;
/// locally it logs so the take-home does not require an API key.
/// </summary>
internal sealed class SendGridEmailSender : IEmailSender
{
    private readonly ILogger<SendGridEmailSender> _logger;

    public SendGridEmailSender(ILogger<SendGridEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("SendGrid email to {To}: {Subject}\n{Body}", to, subject, body);
        return Task.CompletedTask;
    }
}
