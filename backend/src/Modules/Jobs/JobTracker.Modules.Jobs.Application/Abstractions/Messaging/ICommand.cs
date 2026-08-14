using JobTracker.SharedKernel.Results;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Abstractions.Messaging;

public interface ICommand : IRequest<Result>;

public interface ICommand<TResponse> : IRequest<Result<TResponse>>;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>;
