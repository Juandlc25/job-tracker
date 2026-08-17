using Hangfire.Dashboard;

namespace JobTracker.Api.HangfireAuth;

/// <summary>
/// Hangfire's default filter only allows loopback. Requests through Docker
/// port publishing look remote inside the container, which yields HTTP 401.
/// This take-home has no auth; lock the dashboard down in production.
/// </summary>
internal sealed class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
