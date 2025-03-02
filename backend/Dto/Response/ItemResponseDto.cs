namespace CmAgency.Dto.Response;

public class ItemResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool Completed { get; set; }
    public int CategoryId { get; set; }
}
