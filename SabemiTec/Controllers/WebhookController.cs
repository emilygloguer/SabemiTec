using Microsoft.AspNetCore.Mvc;
using SabemiTec.Contracts;
using SabemiTec.Services;

namespace SabemiTec.Controllers;

[ApiController]
[Route("webhooks")]
public class WebhookController(IWebhookService webhookService) : ControllerBase
{
    [HttpPost("pagamentos")]
    public async Task<IActionResult> PersistirWebhook([FromBody] PaymentWebhookRequest payload)
    {
        try
        {
            return Accepted(await webhookService.PersistirWebhook(payload));
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

    //apikey
    //listar pagamentos paginado
    //endpoint de busca com filtragem
}
