using Microsoft.AspNetCore.Mvc;
using SabemiTec.Contracts;
using SabemiTec.Services;

namespace SabemiTec.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController(IWebhookService webhookService) : ControllerBase
{
    [HttpPost("webhooks/pagamentos")]
    public async Task<IActionResult> PersistirWebhook([FromBody] PaymentWebhookRequest payload)
    {
        try
        {
            return Ok(await webhookService.PersistirWebhook(payload));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao persistir o webhook.", error = ex.Message });
        }
    }

    //listar pagamentos paginado
    //filtrar 





}
