using CmAgency.Dto.Request;
using CmAgency.Dto.Response;
using CmAgency.Models;
using CmAgency.Services.Create;
using CmAgency.Services.Delete;
using CmAgency.Services.Mapping.Request;
using CmAgency.Services.Mapping.Response;
using CmAgency.Services.Read;
using CmAgency.Services.Update;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CmAgency.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/item")]
[ApiController]
public class ItemController(
    ICreateRangeService<Item> createRangeService,
    IReadRangeService<Item> readRangeService,
    IExecuteUpdateService<Item> updateService,
    IDeleteService<Item> deleteService,
    IRequestMapper<CreateItemRequestDto, Item> createItemRequestMapper,
    IResponseMapper<Item, ItemResponseDto> itemResponseMapper
) : ControllerBase
{
    private readonly ICreateRangeService<Item> createRangeService = createRangeService;
    private readonly IReadRangeService<Item> readRangeService = readRangeService;
    private readonly IExecuteUpdateService<Item> updateService = updateService;
    private readonly IDeleteService<Item> deleteService = deleteService;
    private readonly IRequestMapper<CreateItemRequestDto, Item> createItemRequestMapper =
        createItemRequestMapper;
    private readonly IResponseMapper<Item, ItemResponseDto> itemResponseMapper = itemResponseMapper;

    [HttpPost("bulk")]
    public async Task<ActionResult> Create(IEnumerable<CreateItemRequestDto> request) =>
        Ok(await createRangeService.Add(request.Select(createItemRequestMapper.Map)));

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] bool? completed)
    {
        var result = await readRangeService.Get(
            completed is null ? null : x => x.Completed == completed,
            0,
            -1,
            q => q.Include(x => x.Category).OrderByDescending(x => x.Id)
        );

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value.Select(itemResponseMapper.Map));
    }

    [HttpPut("{id:int}/toggle-complete")]
    public async Task<ActionResult> ToggleComplete(int id) =>
        Ok(
            await updateService.Update(
                x => x.Id == id,
                x => x.SetProperty(x => x.Completed, x => !x.Completed)
            )
        );

    [HttpPut("complete-everything")]
    public async Task<ActionResult> CompleteEverything() =>
        Ok(await updateService.Update(x => true, x => x.SetProperty(x => x.Completed, true)));

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id) =>
        Ok(await deleteService.Delete(x => x.Id == id, false));
}
