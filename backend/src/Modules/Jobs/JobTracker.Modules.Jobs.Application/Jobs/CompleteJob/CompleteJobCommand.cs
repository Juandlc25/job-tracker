using JobTracker.Modules.Jobs.Application.Abstractions.Messaging;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

public sealed record CompleteJobCommand(Guid JobId, string SignatureUrl) : ICommand<Unit>;
