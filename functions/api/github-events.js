export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const res = await fetch('https://api.github.com/users/th3mujd11/events?per_page=30', {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GH_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cloudflare-pages-function',
    },
  });

  if (!res.ok) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const events = await res.json();
  const pushEvents = events.filter(e => e.type === 'PushEvent');

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${env.GH_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'cloudflare-pages-function',
  };

  for (const ev of pushEvents) {
    if (ev.payload.commits && ev.payload.commits.length) continue;
    const sha = ev.payload.head;
    const repo = ev.repo && ev.repo.name;
    if (!sha || !repo) continue;
    try {
      const commitRes = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, { headers });
      if (commitRes.ok) {
        const data = await commitRes.json();
        ev.payload.commits = [{
          sha: data.sha,
          message: (data.commit && data.commit.message) || 'No message',
        }];
      }
    } catch (e) {}
  }

  return new Response(JSON.stringify(pushEvents), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
