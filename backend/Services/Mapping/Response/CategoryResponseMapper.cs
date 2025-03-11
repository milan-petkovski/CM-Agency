using CmAgency.Dto.Response;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Response;

public class CategoryResponseMapper(IResponseMapper<Item, ItemResponseDto> itemResponseMapper)
    : IResponseMapper<Category, CategoryResponseDto>
{
    private readonly IResponseMapper<Item, ItemResponseDto> itemResponseMapper = itemResponseMapper;

    public CategoryResponseDto Map(Category from) =>
        new()
        {
            Id = from.Id,
            Name = from.Name,
            Completed = from.Completed,
            CompletedAt = from.CompletedAt,
            Items = from.Items.Select(itemResponseMapper.Map),
        };
}
