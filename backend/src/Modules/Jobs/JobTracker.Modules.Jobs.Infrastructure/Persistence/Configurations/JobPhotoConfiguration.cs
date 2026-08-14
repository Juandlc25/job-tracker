using JobTracker.Modules.Jobs.Domain.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Configurations;

internal sealed class JobPhotoConfiguration : IEntityTypeConfiguration<JobPhoto>
{
    public void Configure(EntityTypeBuilder<JobPhoto> builder)
    {
        builder.ToTable("job_photos");
        builder.HasKey(photo => photo.Id);
        builder.Property(photo => photo.Url).HasMaxLength(2048).IsRequired();
        builder.Property(photo => photo.Caption).HasMaxLength(500);
        builder.Property<Guid>("JobId");
        builder.HasIndex("JobId");
    }
}
