using CmAgency.Models;
using Microsoft.EntityFrameworkCore;

namespace CmAgency.Data;

public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(category =>
        {
            category.HasKey(c => c.Id);

            category.HasIndex(c => c.Name).IsUnique();
        });

        modelBuilder.Entity<Item>(item =>
        {
            item.HasKey(i => i.Id);

            item.HasOne(i => i.Category).WithMany(c => c.Items).HasForeignKey(i => i.CategoryId);

            item.HasOne(i => i.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(i => i.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            item.HasIndex(i => i.Name).IsUnique();
        });

        modelBuilder.Entity<Notepad>(notepad =>
        {
            notepad.HasKey(n => n.Id);
        });
    }
}
