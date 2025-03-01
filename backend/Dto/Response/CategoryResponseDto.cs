namespace CmAgency.Dto.Response;

public class CategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public IEnumerable<ItemResponseDto> Items { get; set; } = null!;
}
