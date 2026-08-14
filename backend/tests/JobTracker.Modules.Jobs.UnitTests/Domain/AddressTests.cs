using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.UnitTests.Domain;

public class AddressTests
{
    [Fact]
    public void Equality_is_structural()
    {
        var left = Address.Create("1400 Commerce St", "Dallas", "TX", "75201", 32.77m, -96.79m).Value;
        var right = Address.Create("1400 Commerce St", "Dallas", "TX", "75201", 32.77m, -96.79m).Value;

        Assert.Equal(left, right);
        Assert.True(left == right);
        Assert.Equal(left.GetHashCode(), right.GetHashCode());
    }

    [Fact]
    public void Different_street_is_not_equal()
    {
        var left = Address.Create("1400 Commerce St", "Dallas", "TX", "75201", 32.77m, -96.79m).Value;
        var right = Address.Create("200 Main St", "Dallas", "TX", "75201", 32.77m, -96.79m).Value;

        Assert.NotEqual(left, right);
    }

    [Fact]
    public void Empty_street_is_invalid()
    {
        var result = Address.Create(" ", "Dallas", "TX", "75201", 32.77m, -96.79m);

        Assert.True(result.IsFailure);
        Assert.Equal(JobErrors.InvalidAddress.Code, result.Error.Code);
    }
}
