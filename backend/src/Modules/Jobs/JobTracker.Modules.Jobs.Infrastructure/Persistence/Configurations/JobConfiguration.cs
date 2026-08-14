using JobTracker.Modules.Jobs.Domain.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Configurations;

internal sealed class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("jobs");
        builder.HasKey(job => job.Id);

        builder.Property(job => job.Title).HasMaxLength(200).IsRequired();
        builder.Property(job => job.Description).HasMaxLength(4000).IsRequired();
        builder.Property(job => job.Status).HasConversion<string>().HasMaxLength(32);
        builder.Property(job => job.SignatureUrl).HasMaxLength(2048);
        builder.Property(job => job.Notes).HasMaxLength(2000);
        builder.Property(job => job.CancellationReason).HasMaxLength(1000);

        builder.OwnsOne(job => job.Address, address =>
        {
            address.Property(a => a.Street).HasColumnName("street").HasMaxLength(200);
            address.Property(a => a.City).HasColumnName("city").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("state").HasMaxLength(50);
            address.Property(a => a.ZipCode).HasColumnName("zip_code").HasMaxLength(20);
            address.Property(a => a.Latitude).HasColumnName("latitude").HasPrecision(9, 6);
            address.Property(a => a.Longitude).HasColumnName("longitude").HasPrecision(9, 6);
        });

        builder.HasMany(job => job.Photos)
            .WithOne()
            .HasForeignKey("JobId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(job => job.Photos).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(job => job.OrganizationId);
        builder.HasIndex(job => new { job.OrganizationId, job.Status });
        builder.HasIndex(job => new { job.OrganizationId, job.ScheduledDateUtc });
    }
}
