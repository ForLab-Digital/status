// GitHub skips most "*/5" schedule runs of uptime.yml (9 runs in the first 2 days),
// so a Cloudflare cron trigger starts Uptime CI every 5 minutes through
// repository_dispatch (uptime.yml listens for event type "uptime").
// Response Time CI (the graph points) is daily by default; it is also started at
// the top of every hour so the graph gets hourly points.
// GITHUB_TOKEN: fine-grained token, only this repo, Contents read/write.
export default {
  async scheduled(event, env) {
    await dispatch(env, "uptime");
    if (new Date(event.scheduledTime).getUTCMinutes() === 0) await dispatch(env, "response_time");
  },
};

async function dispatch(env, eventType) {
  const res = await fetch("https://api.github.com/repos/ForLab-Digital/status/dispatches", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "forlab-status-trigger",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ event_type: eventType }),
  });
  if (res.status !== 204) {
    console.log(JSON.stringify({ code: "STATUS_TRIGGER_FAILED", event: eventType, status: res.status }));
    throw new Error(`STATUS_TRIGGER_FAILED event=${eventType} status=${res.status}`);
  }
}
