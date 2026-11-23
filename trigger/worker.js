// GitHub skips most "*/5" schedule runs of uptime.yml (9 runs in the first 2 days),
// so a Cloudflare cron trigger starts Uptime CI every 5 minutes through
// repository_dispatch (uptime.yml listens for event type "uptime").
// GITHUB_TOKEN: fine-grained token, only this repo, Contents read/write.
export default {
  async scheduled(_event, env) {
    const res = await fetch("https://api.github.com/repos/ForLab-Digital/status/dispatches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "forlab-status-trigger",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ event_type: "uptime" }),
    });
    if (res.status !== 204) {
      console.log(JSON.stringify({ code: "STATUS_TRIGGER_FAILED", status: res.status }));
      throw new Error(`STATUS_TRIGGER_FAILED status=${res.status}`);
    }
  },
};
