using Microsoft.AspNetCore.SignalR;

namespace SignalR.Hubs
{
    public class DealthyHallowHub : Hub
    {
        public Dictionary<string, int> GetRaceStatus()
        {
            return SD.DealthyHallowRace;
        }

        public async Task RequestLatestCounts()
        {
            await Clients.Caller.SendAsync("updateDealthyHallowCount",
                SD.DealthyHallowRace[SD.Cloak],
                SD.DealthyHallowRace[SD.Stone],
                SD.DealthyHallowRace[SD.Wand]
            );
        }
    }
}
