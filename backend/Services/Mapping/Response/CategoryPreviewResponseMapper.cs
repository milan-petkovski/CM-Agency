using CmAgency.Dto.Response;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Response;

public class CategoryPreviewResponseMapper : IResponseMapper<Category, CategoryPreviewResponseDto>
{
    public CategoryPreviewResponseDto Map(Category from) =>
        new() { Id = from.Id, Name = from.Name };
}
