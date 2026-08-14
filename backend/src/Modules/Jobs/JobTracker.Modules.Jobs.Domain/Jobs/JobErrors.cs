using JobTracker.SharedKernel.Results;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public static class JobErrors
{
    public static readonly Error InvalidAddress = new("Job.InvalidAddress", "Address street, city, and state are required.");
    public static readonly Error TitleRequired = new("Job.TitleRequired", "A job title is required.");
    public static readonly Error ScheduledInPast = new("Job.ScheduledInPast", "A job cannot be scheduled in the past.");
    public static readonly Error TerminalState = new("Job.TerminalState", "A completed or cancelled job cannot change state.");
    public static readonly Error InvalidTransition = new("Job.InvalidTransition", "The requested status transition is not allowed.");
    public static readonly Error NotFound = new("Job.NotFound", "The job was not found.");
    public static readonly Error SignatureRequired = new("Job.SignatureRequired", "A customer signature is required to complete a job.");
    public static readonly Error CancellationReasonRequired = new("Job.CancellationReasonRequired", "A cancellation reason is required.");
}
