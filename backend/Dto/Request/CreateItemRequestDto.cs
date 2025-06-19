namespace CmAgency.Dto.Request;

public class CreateItemRequestDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public string LangCode { get; set; } = null!;
}
