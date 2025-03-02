using CmAgency.Data;
using CmAgency.Dto.Request;
using CmAgency.Dto.Response;
using CmAgency.Exceptions;
using CmAgency.Models;
using CmAgency.Services.Create;
using CmAgency.Services.Delete;
using CmAgency.Services.Mapping.Request;
using CmAgency.Services.Mapping.Response;
using CmAgency.Services.Read;
using CmAgency.Services.Update;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("secrets.json", optional: true);

builder.Logging.ClearProviders().AddConsole();
builder.Services.AddExceptionHandler<ExceptionHandler>();

builder.Services.AddControllers();

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));

    if (builder.Environment.IsDevelopment())
        options.EnableSensitiveDataLogging();
});

#region Services

#region Category
builder.Services.AddScoped<ICreateRangeService<Category>, CreateService<Category>>();
builder.Services.AddScoped<IReadSingleService<Category>, ReadService<Category>>();
builder.Services.AddScoped<IReadRangeService<Category>, ReadService<Category>>();
builder.Services.AddScoped<IDeleteService<Category>, DeleteService<Category>>();
builder.Services.AddScoped<
    IRequestMapper<CreateCategoryRequestDto, Category>,
    CreateCategoryRequestMapper
>();
builder.Services.AddScoped<
    IResponseMapper<Category, CategoryPreviewResponseDto>,
    CategoryPreviewResponseMapper
>();
builder.Services.AddScoped<
    IResponseMapper<Category, CategoryResponseDto>,
    CategoryResponseMapper
>();
#endregion

#region Item
builder.Services.AddScoped<ICreateRangeService<Item>, CreateService<Item>>();
builder.Services.AddScoped<IReadRangeService<Item>, ReadService<Item>>();
builder.Services.AddScoped<IExecuteUpdateService<Item>, UpdateService<Item>>();
builder.Services.AddScoped<IDeleteService<Item>, DeleteService<Item>>();
builder.Services.AddScoped<IRequestMapper<CreateItemRequestDto, Item>, CreateItemRequestMapper>();
builder.Services.AddScoped<IResponseMapper<Item, ItemResponseDto>, ItemResponseMapper>();
#endregion

#region Notepad
builder.Services.AddScoped<ICreateSingleService<Notepad>, CreateService<Notepad>>();
builder.Services.AddScoped<IReadSingleService<Notepad>, ReadService<Notepad>>();
builder.Services.AddScoped<IExecuteUpdateService<Notepad>, UpdateService<Notepad>>();
builder.Services.AddScoped<IDeleteService<Notepad>, DeleteService<Notepad>>();
#endregion

#endregion

var app = builder.Build();

app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
