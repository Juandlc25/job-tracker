using JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;
using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Application.Jobs.GetJob;
using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Tenancy;
using MediatR;

namespace JobTracker.Api.Endpoints;

public static class JobsEndpoints
{
    public static IEndpointRouteBuilder MapJobsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/jobs").WithTags("Jobs").RequireRateLimiting("api");

        group.MapGet("/", Search);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create);
        group.MapPost("/{id:guid}/complete", Complete);

        return app;
    }

    private static async Task<IResult> Search(
        [AsParameters] SearchJobsRequest request,
        ISender sender,
        ITenantContext tenant,
        CancellationToken cancellationToken)
    {
        var statuses = request.Statuses?
            .Select(ParseStatus)
            .OfType<JobStatus>()
            .ToArray();

        var result = await sender.Send(
            new SearchJobsQuery(
                tenant.OrganizationId,
                request.Search,
                statuses,
                request.DateFrom,
                request.DateTo,
                request.AssigneeId,
                request.Cursor,
                request.PageSize ?? 20),
            cancellationToken);

        return result.IsFailure
            ? Results.BadRequest(result.Error)
            : Results.Ok(result.Value);
    }

    private static async Task<IResult> GetById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetJobQuery(id), cancellationToken);
        return result.IsFailure ? Results.NotFound(result.Error) : Results.Ok(result.Value);
    }

    private static async Task<IResult> Create(
        CreateJobRequest request,
        ISender sender,
        ITenantContext tenant,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateJobCommand(
                request.Title,
                request.Description,
                request.Street,
                request.City,
                request.State,
                request.ZipCode,
                request.Latitude,
                request.Longitude,
                request.ScheduledDate,
                request.AssigneeId,
                request.CustomerId,
                tenant.OrganizationId,
                request.Notes),
            cancellationToken);

        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        var created = await sender.Send(new GetJobQuery(result.Value), cancellationToken);
        return Results.Created($"/api/jobs/{result.Value}", created.Value);
    }

    private static async Task<IResult> Complete(
        Guid id,
        CompleteJobRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CompleteJobCommand(id, request.SignatureUrl), cancellationToken);
        if (result.IsFailure)
        {
            return Results.BadRequest(result.Error);
        }

        var job = await sender.Send(new GetJobQuery(id), cancellationToken);
        return Results.Ok(job.Value);
    }

    private static JobStatus? ParseStatus(string value) =>
        Enum.TryParse<JobStatus>(value, ignoreCase: true, out var status) ? status : null;
}

public sealed record SearchJobsRequest(
    string? Search,
    string[]? Statuses,
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? AssigneeId,
    string? Cursor,
    int? PageSize);

public sealed record CreateJobRequest(
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal Latitude,
    decimal Longitude,
    DateTime ScheduledDate,
    Guid AssigneeId,
    Guid CustomerId,
    string? Notes);

public sealed record CompleteJobRequest(string SignatureUrl);
