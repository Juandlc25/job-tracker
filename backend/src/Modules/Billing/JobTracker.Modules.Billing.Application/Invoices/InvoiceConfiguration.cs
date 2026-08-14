using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Modules.Billing.Application.Invoices;

internal sealed class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices", "billing");
        builder.HasKey(invoice => invoice.Id);
        builder.Property(invoice => invoice.IdempotencyKey).HasMaxLength(128).IsRequired();
        builder.HasIndex(invoice => invoice.IdempotencyKey).IsUnique();
        builder.Property(invoice => invoice.Amount).HasPrecision(12, 2);
    }
}
