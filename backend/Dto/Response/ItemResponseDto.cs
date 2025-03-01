namespace CmAgency.Dto.Response;

public class ItemResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public CategoryPreviewResponseDto Category { get; set; } = null!;
}
