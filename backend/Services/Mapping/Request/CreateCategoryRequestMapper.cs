using CmAgency.Dto.Request;
using CmAgency.Models;

namespace CmAgency.Services.Mapping.Request;

public class CreateCategoryRequestMapper : IRequestMapper<CreateCategoryRequestDto, Category>
{
    public Category Map(CreateCategoryRequestDto from) => new() { Name = from.Name, Items = [] };
}
