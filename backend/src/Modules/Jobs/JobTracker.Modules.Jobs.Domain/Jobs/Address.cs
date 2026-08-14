using JobTracker.SharedKernel.Primitives;
using JobTracker.SharedKernel.Results;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string ZipCode { get; }
    public decimal Latitude { get; }
    public decimal Longitude { get; }

    private Address()
    {
        Street = string.Empty;
        City = string.Empty;
        State = string.Empty;
        ZipCode = string.Empty;
    }

    private Address(string street, string city, string state, string zipCode, decimal latitude, decimal longitude)
    {
        Street = street;
        City = city;
        State = state;
        ZipCode = zipCode;
        Latitude = latitude;
        Longitude = longitude;
    }

    public static Result<Address> Create(
        string street,
        string city,
        string state,
        string zipCode,
        decimal latitude,
        decimal longitude)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            return Result.Failure<Address>(JobErrors.InvalidAddress);
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            return Result.Failure<Address>(JobErrors.InvalidAddress);
        }

        if (string.IsNullOrWhiteSpace(state))
        {
            return Result.Failure<Address>(JobErrors.InvalidAddress);
        }

        return Result.Success(new Address(street.Trim(), city.Trim(), state.Trim(), zipCode.Trim(), latitude, longitude));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return ZipCode;
        yield return Latitude;
        yield return Longitude;
    }
}
