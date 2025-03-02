using CmAgency.Dto.Request;
using CmAgency.Dto.Response;
using CmAgency.Models;
using CmAgency.Services.Create;
using CmAgency.Services.Delete;
using CmAgency.Services.Mapping.Request;
using CmAgency.Services.Mapping.Response;
using CmAgency.Services.Read;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CmAgency.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/category")]
[ApiController]
public class CategoryController(
    ICreateRangeService<Category> createRangeService,
    IReadRangeService<Category> readRangeService,
    IReadSingleService<Category> readSingleService,
    IDeleteService<Category> deleteService,
    IRequestMapper<CreateCategoryRequestDto, Category> createRequestMapper,
    IResponseMapper<Category, CategoryPreviewResponseDto> previewResponseMapper,
    IResponseMapper<Category, CategoryResponseDto> responseMapper
) : ControllerBase
{
    private readonly ICreateRangeService<Category> createRangeService = createRangeService;
    private readonly IReadRangeService<Category> readRangeService = readRangeService;
    private readonly IReadSingleService<Category> readSingleService = readSingleService;
    private readonly IDeleteService<Category> deleteService = deleteService;
    private readonly IRequestMapper<CreateCategoryRequestDto, Category> createRequestMapper =
        createRequestMapper;
    private readonly IResponseMapper<Category, CategoryPreviewResponseDto> previewResponseMapper =
        previewResponseMapper;
    private readonly IResponseMapper<Category, CategoryResponseDto> responseMapper = responseMapper;

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateRange(
        [FromBody] List<CreateCategoryRequestDto> categories
    )
    {
        return Ok(await createRangeService.Add(categories.Select(createRequestMapper.Map)));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await readRangeService.Get(
            null,
            0,
            -1,
            q => q.Include(x => x.Items).OrderByDescending(x => x.Id)
        );

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value.Select(previewResponseMapper.Map));
    }

    [HttpGet("full")]
    public async Task<IActionResult> GetAllFull([FromQuery] bool? completed)
    {
        var result = await readRangeService.Get(
            null,
            0,
            -1,
            completed is null
                ? q => q.Include(x => x.Items).OrderByDescending(x => x.Id)
                : q =>
                    q.Include(x => x.Items.Where(x => x.Completed == completed))
                        .OrderByDescending(x => x.Id)
        );

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value.Select(responseMapper.Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await readSingleService.Get(x => x.Id == id);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(responseMapper.Map(result.Value));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        Ok(await deleteService.Delete(x => x.Id == id, false));
}
