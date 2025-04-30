using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalR.Hubs;
using SignalR.Models;

namespace SignalR.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHubContext<DealthyHallowHub> _hubContext;

        public HomeController(ILogger<HomeController> logger, IHubContext<DealthyHallowHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        public IActionResult Index()
        {
            return View();
        }        
        
        public IActionResult Voting()
        {
            return View();
        }        
        
        public async Task<IActionResult> DeathlyHallows(string type)
        {
            if (SD.DealthyHallowRace.ContainsKey(type))
            {
                SD.DealthyHallowRace[type]++;
            }

            await _hubContext.Clients.All.SendAsync("updateDealthyHallowCount", 
                SD.DealthyHallowRace[SD.Cloak],
                SD.DealthyHallowRace[SD.Stone],
                SD.DealthyHallowRace[SD.Wand]
                );
            return RedirectToAction(nameof(Voting));
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
