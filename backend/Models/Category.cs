namespace CmAgency.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public bool Completed { get; set; }
    public ICollection<Item> Items { get; set; } = [];
}
