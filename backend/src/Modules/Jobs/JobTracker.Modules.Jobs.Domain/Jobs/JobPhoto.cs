using JobTracker.SharedKernel.Primitives;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class JobPhoto : Entity<Guid>
{
    public string Url { get; private set; } = string.Empty;
    public DateTime CapturedAtUtc { get; private set; }
    public string? Caption { get; private set; }

    private JobPhoto()
    {
    }

    internal JobPhoto(Guid id, string url, DateTime capturedAtUtc, string? caption) : base(id)
    {
        Url = url;
        CapturedAtUtc = capturedAtUtc;
        Caption = caption;
    }
}
