---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
---

## As you might know, I'm th3mujd11!

> Well, I write code, explore new technologies and spend time in the air whenever I have some free time. I'm driven by curiosity and a messy sleep schedule.  
{: .prompt-danger}

## Facts

- I make CTF challenges for contests such as [HackTheART](https://hacktheart.ro)
- I am a CS student at the University of Bucharest 
- Sometimes I fly planes and sailplanes for fun

## Skills

| Area | Details |
|------|---------|
| Languages | Python, Java, C/C++ |
| Tools | Vim maxxer, Wireshark, Ghidra(when I feel lucky), Docker  |
| Interests | Blue/Red teaming, Aviation security |

## What am I listening to now?

<div id="now-playing" style="padding: 0.75rem 1rem; border-radius: 8px; background: var(--card-bg, #1e1e2e); border: 1px solid var(--border-color, #333); display: flex; align-items: center; gap: 1rem; max-width: 480px;">
  <span style="opacity: 0.6;">Loading...</span>
</div>

<script>
(function() {
  var USER = 'th3mujd11';
  var KEY = '81804a958403ed706961e812b56a1dea';
  var el = document.getElementById('now-playing');

  function fetchTrack() {
    fetch('https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + USER + '&api_key=' + KEY + '&format=json&limit=1', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var t = data && data.recenttracks && data.recenttracks.track && data.recenttracks.track[0];
        if (!t) { el.innerHTML = '<span style="opacity:0.6;">No recent tracks</span>'; return; }
        var playing = !!(t['@attr'] && t['@attr'].nowplaying);
        var imgUrl = (t.image && t.image[2] && t.image[2]['#text']) || (t.image && t.image[0] && t.image[0]['#text']) || '';
        var url = t.url || '#';
        var artist = (t.artist && t.artist['#text']) || 'Unknown';

        el.innerHTML = '';
        var imgEl = document.createElement('div');
        imgEl.style.cssText = 'width:48px;height:48px;border-radius:4px;background:var(--border-color,#333);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;';
        imgEl.textContent = '♫';
        if (imgUrl) {
          var pic = document.createElement('img');
          pic.alt = 'album art';
          pic.style.cssText = 'width:48px;height:48px;border-radius:4px;object-fit:cover;';
          pic.onload = function() { imgEl.replaceWith(pic); };
          pic.src = imgUrl;
        }
        el.appendChild(imgEl);

        var info = document.createElement('div');
        info.innerHTML = '<div style="font-size:0.75rem;opacity:0.6;margin-bottom:2px;">' + (playing ? '&#9835; Now Playing' : '&#9835; Last Played') + '</div>' +
          '<a href="' + url + '" target="_blank" rel="noreferrer" style="font-weight:600;">' + (t.name || 'Unknown') + '</a>' +
          '<div style="font-size:0.85rem;opacity:0.8;">' + artist + '</div>';
        el.appendChild(info);
      })
      .catch(function() {
        el.innerHTML = '<span style="opacity:0.6;">Could not load track</span>';
      });
  }
  fetchTrack();
  setInterval(fetchTrack, 30000);
})();
</script>

## Gitty git

<div id="git-graph" style="max-width: 560px;">
  <span style="opacity: 0.6;">Loading...</span>
</div>

<style>
  .git-commit { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.35rem 0; }
  .git-dot-col { display: flex; flex-direction: column; align-items: center; min-width: 14px; }
  .git-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--link-color, #79b8ff); flex-shrink: 0; }
  .git-line-seg { width: 2px; flex: 1; background: var(--border-color, #444); min-height: 12px; }
  .git-info { font-size: 0.85rem; line-height: 1.4; }
  .git-sha { font-family: monospace; font-size: 0.8rem; opacity: 0.7; margin-right: 0.5rem; }
  .git-time { font-size: 0.75rem; opacity: 0.5; margin-left: 0.5rem; }
  .git-repo-label { font-size: 0.8rem; font-weight: 600; margin: 0.5rem 0 0.2rem 1.5rem; }
  .git-branch { font-size: 0.75rem; opacity: 0.6; margin-left: 0.4rem; padding: 1px 6px; border-radius: 4px; background: var(--border-color, #333); }
</style>

<script>
(function() {
  var el = document.getElementById('git-graph');

  function timeAgo(iso) {
    var diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return Math.floor(diff) + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  fetch('https://github-events-proxy.th3mujd11.workers.dev', { cache: 'no-store', headers: { 'X-Proxy-Key': '__PROXY_KEY__' } })
    .then(function(r) { return r.json(); })
    .then(function(events) {
      var commits = [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        if (ev.type !== 'PushEvent' || !ev.payload || !ev.payload.commits || !ev.payload.commits.length) continue;
        var repo = (ev.repo && ev.repo.name) || 'unknown';
        var repoShort = repo.split('/').pop();
        var branch = (ev.payload.ref || '').replace('refs/heads/', '');
        for (var j = 0; j < ev.payload.commits.length; j++) {
          var c = ev.payload.commits[j];
          commits.push({ sha: (c.sha || '').slice(0, 7), message: (c.message || '').split('\n')[0], repo: repo, repoShort: repoShort, branch: branch, createdAt: ev.created_at, link: 'https://github.com/' + repo + '/commit/' + c.sha });
        }
        if (commits.length >= 5) break;
      }
      if (!commits.length) { el.innerHTML = '<span style="opacity:0.6;">No recent commits</span>'; return; }

      var html = '';
      for (var k = 0; k < Math.min(commits.length, 5); k++) {
        var cc = commits[k];
        var showRepo = k === 0 || commits[k - 1].repo !== cc.repo || commits[k - 1].branch !== cc.branch;
        if (showRepo) {
          html += '<div class="git-repo-label"><a href="https://github.com/' + cc.repo + '" target="_blank" rel="noreferrer">' + cc.repoShort + '</a><span class="git-branch">' + cc.branch + '</span></div>';
        }
        html += '<div class="git-commit"><div class="git-dot-col"><span class="git-dot"></span><span class="git-line-seg"></span></div><div class="git-info"><a class="git-sha" href="' + cc.link + '" target="_blank" rel="noreferrer">' + cc.sha + '</a><span>' + cc.message + '</span><span class="git-time">' + timeAgo(cc.createdAt) + '</span></div></div>';
      }
      el.innerHTML = html;
    })
    .catch(function() {
      el.innerHTML = '<span style="opacity:0.6;">Could not load commits</span>';
    });
})();
</script>

---

