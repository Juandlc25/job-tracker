using JobTracker.SharedKernel.Outbox;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Configurations;

internal sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");
        builder.HasKey(message => message.Id);
        builder.Property(message => message.Type).HasMaxLength(512).IsRequired();
        builder.Property(message => message.Content).HasColumnType("jsonb").IsRequired();
        builder.HasIndex(message => message.ProcessedOnUtc);
    }
}
