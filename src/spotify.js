const API_BASE = 'https://api.spotify.com/v1';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function spotifyRequest(path, getToken, options = {}, retryCount = 0) {
  const token = await getToken();
  if (!token) throw new Error('Spotifyセッションの有効期限が切れました。');

  const response = await fetch(path.startsWith('http') ? path : `${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 429 && retryCount < 1) {
    const seconds = Math.min(10, Number(response.headers.get('Retry-After') || 1));
    await wait(seconds * 1000);
    return spotifyRequest(path, getToken, options, retryCount + 1);
  }

  if (response.status === 204) return null;
  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`Spotify APIエラー (${response.status})`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }
  return response.json();
}

export function artistNames(track) {
  return (track?.artists || []).map((artist) => artist.name).filter(Boolean).join(', ') || 'Unknown Artist';
}

export function coverUrl(track, size = 0) {
  return track?.album?.images?.[size]?.url || track?.album?.images?.[0]?.url || '';
}

export async function loadListeningData(getToken) {
  const ranges = ['short_term', 'medium_term', 'long_term'];
  const [profile, ...responses] = await Promise.all([
    spotifyRequest('/me', getToken),
    ...ranges.map((range) => spotifyRequest(`/me/top/tracks?time_range=${range}&limit=20`, getToken))
  ]);

  const data = Object.fromEntries(ranges.map((range, index) => [range, responses[index]?.items || []]));
  return {
    profile,
    ranges: data,
    crate: buildCrate(data),
    comparison: buildComparison(data)
  };
}

function normalizedTrack(track, category, reason) {
  return {
    ...track,
    category,
    reason,
    artistLabel: artistNames(track),
    cover: coverUrl(track)
  };
}

export function buildCrate(ranges) {
  const groups = [
    {
      items: ranges.short_term || [],
      category: '最近の沼',
      reason: '最近4週間で繰り返し聴いている盤'
    },
    {
      items: ranges.medium_term || [],
      category: '今の定番',
      reason: 'この半年の中心にいる盤'
    },
    {
      items: ranges.long_term || [],
      category: 'ずっと残る',
      reason: '長い時間を通して残っている盤'
    }
  ];

  const selected = [];
  const seen = new Set();
  for (const group of groups) {
    for (const track of group.items) {
      if (!track?.uri || seen.has(track.uri)) continue;
      selected.push(normalizedTrack(track, group.category, group.reason));
      seen.add(track.uri);
      if (selected.filter((item) => item.category === group.category).length >= 4) break;
    }
  }

  if (selected.length < 12) {
    for (const group of groups) {
      for (const track of group.items) {
        if (!track?.uri || seen.has(track.uri)) continue;
        selected.push(normalizedTrack(track, group.category, group.reason));
        seen.add(track.uri);
        if (selected.length >= 12) break;
      }
      if (selected.length >= 12) break;
    }
  }
  return selected.slice(0, 12);
}

export function buildComparison(ranges) {
  const recent = ranges.short_term || [];
  const long = ranges.long_term || [];
  const longUris = new Set(long.map((track) => track.uri));
  const recentUris = new Set(recent.map((track) => track.uri));
  const fresh = recent.find((track) => !longUris.has(track.uri)) || recent[0] || null;
  const classic = long.find((track) => !recentUris.has(track.uri)) || long[0] || null;
  return {
    fresh: fresh ? normalizedTrack(fresh, '最近の一曲', '最近4週間で存在感が強い曲') : null,
    classic: classic ? normalizedTrack(classic, 'ずっと残る一曲', '長期トップに残り続ける曲') : null
  };
}
