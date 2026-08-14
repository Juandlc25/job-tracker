namespace JobTracker.SharedKernel.Pagination;

public sealed class PagedList<T>
{
    public PagedList(IReadOnlyList<T> items, int totalCount, string? nextCursor)
    {
        Items = items;
        TotalCount = totalCount;
        NextCursor = nextCursor;
    }

    public IReadOnlyList<T> Items { get; }
    public int TotalCount { get; }
    public string? NextCursor { get; }
}
