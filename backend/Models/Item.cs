namespace CmAgency.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public bool Completed { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
