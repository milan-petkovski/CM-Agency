using CmAgency.Dto.Response;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Response;

public class ItemResponseMapper : IResponseMapper<Item, ItemResponseDto>
{
    public ItemResponseDto Map(Item from) =>
        new()
        {
            Id = from.Id,
            Name = from.Name,
            Completed = from.Completed,
            CategoryId = from.CategoryId,
        };
}
