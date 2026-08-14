namespace JobTracker.Modules.Jobs.Infrastructure.Notifications;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}
