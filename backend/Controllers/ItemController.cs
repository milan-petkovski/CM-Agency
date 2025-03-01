using CmAgency.Dto.Request;
using CmAgency.Dto.Response;
using CmAgency.Models;
using CmAgency.Services.Create;
using CmAgency.Services.Delete;
using CmAgency.Services.Mapping.Request;
using CmAgency.Services.Mapping.Response;
using CmAgency.Services.Read;
using Microsoft.AspNetCore.Mvc;

namespace CmAgency.Controllers;

[Route("api/item")]
[ApiController]
public class ItemController(
    ICreateRangeService<Item> createRangeService,
    IReadRangeService<Item> readRangeService,
    IDeleteService<Item> deleteService,
    IRequestMapper<CreateItemRequestDto, Item> createItemRequestMapper,
    IResponseMapper<Item, ItemResponseDto> itemResponseMapper
) : ControllerBase
{
    private readonly ICreateRangeService<Item> createRangeService = createRangeService;
    private readonly IReadRangeService<Item> readRangeService = readRangeService;
    private readonly IDeleteService<Item> deleteService = deleteService;
    private readonly IRequestMapper<CreateItemRequestDto, Item> createItemRequestMapper =
        createItemRequestMapper;
    private readonly IResponseMapper<Item, ItemResponseDto> itemResponseMapper = itemResponseMapper;

    [HttpPost("bulk")]
    public async Task<ActionResult> Create(IEnumerable<CreateItemRequestDto> request) =>
        Ok(await createRangeService.Add(request.Select(createItemRequestMapper.Map)));

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var result = await readRangeService.Get(
            null,
            0,
            -1,
            q => q.Include(x => x.Category).OrderByDescending(x => x.Id)
        );

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value.Select(itemResponseMapper.Map));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id) =>
        Ok(await deleteService.Delete(x => x.Id == id, false));
}
