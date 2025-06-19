using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CmAgency.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedAtToCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "CompletedAt",
                table: "Category",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Category");
        }
    }
}
