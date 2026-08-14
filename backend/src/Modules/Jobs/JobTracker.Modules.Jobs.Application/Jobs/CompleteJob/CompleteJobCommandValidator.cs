using FluentValidation;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

internal sealed class CompleteJobCommandValidator : AbstractValidator<CompleteJobCommand>
{
    public CompleteJobCommandValidator()
    {
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.SignatureUrl).NotEmpty();
    }
}
