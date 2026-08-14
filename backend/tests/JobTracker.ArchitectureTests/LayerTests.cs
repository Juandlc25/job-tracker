using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using NetArchTest.Rules;

namespace JobTracker.ArchitectureTests;

public class LayerTests
{
    [Fact]
    public void Domain_does_not_reference_application_or_infrastructure()
    {
        var result = Types.InAssembly(typeof(Job).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "JobTracker.Modules.Jobs.Application",
                "JobTracker.Modules.Jobs.Infrastructure",
                "JobTracker.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_does_not_reference_infrastructure_or_api()
    {
        var result = Types.InAssembly(typeof(CreateJobCommand).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "JobTracker.Modules.Jobs.Infrastructure",
                "JobTracker.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Infrastructure_does_not_reference_api()
    {
        var result = Types.InAssembly(typeof(JobsDbContext).Assembly)
            .ShouldNot()
            .HaveDependencyOn("JobTracker.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }
}

public class NamingConventionTests
{
    [Fact]
    public void Commands_are_sealed_and_end_with_Command()
    {
        var result = Types.InAssembly(typeof(CreateJobCommand).Assembly)
            .That()
            .AreClasses()
            .And()
            .HaveNameEndingWith("Command")
            .Should()
            .BeSealed()
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Queries_are_sealed_and_end_with_Query()
    {
        var result = Types.InAssembly(typeof(SearchJobsQuery).Assembly)
            .That()
            .AreClasses()
            .And()
            .HaveNameEndingWith("Query")
            .Should()
            .BeSealed()
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Command_handlers_are_internal_sealed()
    {
        var result = Types.InAssembly(typeof(CreateJobCommand).Assembly)
            .That()
            .HaveNameEndingWith("CommandHandler")
            .Should()
            .NotBePublic()
            .And()
            .BeSealed()
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }
}
