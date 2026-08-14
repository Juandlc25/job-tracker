using JobTracker.SharedKernel.Tenancy;

namespace JobTracker.Api.Middleware;

public sealed class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Guid DemoTenant = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, TenantContext tenant)
    {
        if (context.Request.Headers.TryGetValue("X-Organization-Id", out var header) &&
            Guid.TryParse(header, out var organizationId))
        {
            tenant.OrganizationId = organizationId;
        }
        else
        {
            tenant.OrganizationId = DemoTenant;
        }

        await _next(context);
    }
}
