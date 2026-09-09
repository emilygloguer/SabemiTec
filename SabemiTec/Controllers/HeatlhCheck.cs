using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SabemiTec.Controllers;

[ApiController]
[AllowAnonymous]
[Route("ping")]
public sealed class HealthCheckController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        const string response =
       """
            ---- PONG ----
          o/             \o
         /|      ●        |\
         / \  |-------|  / \
        """;

        return Content(response, "text/plain");
    }
}
