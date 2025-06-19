using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CmAgency.Migrations
{
    /// <inheritdoc />
    public partial class AddLangToItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LanguageCode",
                table: "Item",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Item_LanguageCode",
                table: "Item",
                column: "LanguageCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Item_LanguageCode",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "LanguageCode",
                table: "Item");
        }
    }
}
