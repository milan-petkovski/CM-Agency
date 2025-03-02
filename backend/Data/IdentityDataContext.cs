using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CmAgency.Data;

public class IdentityDataContext(DbContextOptions<IdentityDataContext> options)
    : IdentityDbContext(options) { }
