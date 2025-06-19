using CmAgency.Dto.Request;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Request;

public class CreateItemRequestMapper : IRequestMapper<CreateItemRequestDto, Item>
{
    public Item Map(CreateItemRequestDto from) =>
        new()
        {
            Name = from.Name,
            CategoryId = from.CategoryId,
            LanguageCode = from.LangCode,
            Completed = false,
        };
}
