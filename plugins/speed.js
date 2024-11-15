import os from "os";
import { performance } from "perf_hooks";

const helper = {
  command: ['ping'],
  category: 'info',
  description: 'Speedtest bot',
  operate: async (ctx) => {
    const start = performance.now();

        const cpus = os.cpus();
        const uptimeSeconds = os.uptime();
        const uptimeDays = Math.floor(uptimeSeconds / 86400);
        const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeSecs = Math.floor(uptimeSeconds % 60);
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const formattedUsedMem = Func.formatSize(usedMem);
        const formattedTotalMem = Func.formatSize(totalMem);
        const loadAverage = os.loadavg().map(avg => avg.toFixed(2)).join(", ");
        const speed = (performance.now() - start).toFixed(3);

        const serverInfo = `Server Information:\n
- CPU Cores: ${cpus.length}
- Platform: ${os.platform()}
- Architecture: ${os.arch()}
- Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSecs}s
- RAM: ${formattedUsedMem} / ${formattedTotalMem}
- Load Average (1, 5, 15 min): ${loadAverage}
- Response Time: ${speed} seconds`.trim();

await ctx.reply(serverInfo, { parse_mode: 'Markdown' });
  },
  noPrefix: false,
  isOwner: false,
  isGroup: false,
  isPremium: false,
};

export default helper;
