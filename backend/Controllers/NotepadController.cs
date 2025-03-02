using CmAgency.Models;
using CmAgency.Services.Create;
using CmAgency.Services.Delete;
using CmAgency.Services.Read;
using CmAgency.Services.Update;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CmAgency.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/notepad")]
[ApiController]
public class NotepadController(
    ICreateSingleService<Notepad> createService,
    IExecuteUpdateService<Notepad> updateService,
    IReadSingleService<Notepad> readService,
    IDeleteService<Notepad> deleteService
) : ControllerBase
{
    private readonly ICreateSingleService<Notepad> createService = createService;
    private readonly IExecuteUpdateService<Notepad> updateService = updateService;
    private readonly IReadSingleService<Notepad> readService = readService;
    private readonly IDeleteService<Notepad> deleteService = deleteService;

    [HttpPost]
    public async Task<ActionResult> Create() => Ok(await createService.Add(new() { Content = "" }));

    [HttpGet("{id:int}")]
    public async Task<ActionResult> Get(int id)
    {
        var result = await readService.Get(x => x.Id == id);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }

    [HttpGet("default")]
    public async Task<ActionResult> GetDefault()
    {
        var result = await readService.Get(x => true, q => q.OrderByDescending(x => x.Id));

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }

    [HttpPut]
    public async Task<ActionResult> Update([FromBody] Notepad notepad) =>
        Ok(
            await updateService.Update(
                x => x.Id == notepad.Id,
                x => x.SetProperty(x => x.Content, notepad.Content)
            )
        );

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id) =>
        Ok(await deleteService.Delete(x => x.Id == id, false));
}
