export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = origin === 'https://blog.th3mujd11.dpdns.org';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': allowed ? origin : '',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'X-Proxy-Key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const proxyKey = request.headers.get('X-Proxy-Key');
    if (!allowed || proxyKey !== env.PROXY_KEY) {
      return new Response('Unauthorized', { status: 403 });
    }

    const res = await fetch('https://api.github.com/users/th3mujd11/events?per_page=30', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${env.GH_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'cloudflare-worker',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowed ? origin : '' },
      });
    }

    const events = await res.json();
    const pushEvents = events.filter(e => e.type === 'PushEvent');

    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GH_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cloudflare-worker',
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
        'Access-Control-Allow-Origin': allowed ? origin : '',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
