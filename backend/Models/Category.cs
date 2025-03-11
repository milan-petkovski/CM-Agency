namespace CmAgency.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public bool Completed { get; set; }
    public DateOnly? CompletedAt { get; set; } = null;
    public ICollection<Item> Items { get; set; } = [];
}
