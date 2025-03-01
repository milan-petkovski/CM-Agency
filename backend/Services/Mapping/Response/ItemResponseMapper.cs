using CmAgency.Dto.Response;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Response;

public class ItemResponseMapper(
    IResponseMapper<Category, CategoryPreviewResponseDto> categoryResponseDto
) : IResponseMapper<Item, ItemResponseDto>
{
    private readonly IResponseMapper<Category, CategoryPreviewResponseDto> categoryResponseMapper =
        categoryResponseDto;

    public ItemResponseDto Map(Item from) =>
        new()
        {
            Id = from.Id,
            Name = from.Name,
            Category = categoryResponseMapper.Map(from.Category),
        };
}
