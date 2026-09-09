using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SabemiTec.Migrations
{
    /// <inheritdoc />
    public partial class initialcreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LogsEventosBrutos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TransacaoId = table.Column<string>(type: "text", nullable: false),
                    ContratoId = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StatusRecebido = table.Column<string>(type: "text", nullable: false),
                    PayloadBruto = table.Column<string>(type: "text", nullable: false),
                    StatusProcessamento = table.Column<int>(type: "integer", nullable: false),
                    MensagemErro = table.Column<string>(type: "text", nullable: true),
                    DataRecebimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogsEventosBrutos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StatusDosContratos",
                columns: table => new
                {
                    ContratoId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    UltimoPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValorUltimoPagamento = table.Column<decimal>(type: "numeric", nullable: true),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusDosContratos", x => x.ContratoId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LogsEventosBrutos_TransacaoId",
                table: "LogsEventosBrutos",
                column: "TransacaoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LogsEventosBrutos");

            migrationBuilder.DropTable(
                name: "StatusDosContratos");
        }
    }
}
