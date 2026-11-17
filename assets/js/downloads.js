// Cumulative downloads for the open-source project cards.
(() => {
  const stats = document.querySelectorAll('[data-pypi-downloads]');
  const healthStats = document.querySelectorAll('[data-agenthealth-downloads]');
  if (!stats.length && !healthStats.length) return;

  const packages = [
    { slug: 'agenticlens', fallback: 122300 },
    { slug: 'deep-agentic-core-mcp', fallback: 103800 },
    { slug: 'agentic-chaos', fallback: 90900 },
    { slug: 'agentic-sidecar', fallback: 22000 },
    { slug: 'agenticops-control-tower', fallback: null },
    { slug: 'agentic-evals', fallback: 7800 }
  ];

  function parseBadgeCount(svgText) {
    const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    if (svg.querySelector('parsererror') || svg.documentElement.localName !== 'svg') {
      throw new Error('Invalid badge');
    }

    const multipliers = { '': 1, k: 1e3, m: 1e6, b: 1e9 };
    const counts = [...svg.querySelectorAll('text')]
      .map(node => node.textContent.trim().match(/^(\d+(?:,\d{3})*(?:\.\d+)?)\s*([kmb]?)$/i))
      .filter(Boolean)
      .map(([, number, suffix]) => Math.round(
        Number(number.replaceAll(',', '')) * multipliers[suffix.toLowerCase()]
      ))
      .filter(Number.isFinite);

    if (!counts.length) throw new Error('No download count found');
    return counts.at(-1);
  }

  async function getDownloads({ url, fallback, read = response => response.text().then(parseBadgeCount) }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const count = await read(response);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid download count');
      return { count, live: true };
    } catch {
      return { count: fallback, live: false };
    } finally {
      clearTimeout(timer);
    }
  }

  function renderStats(elements, results, description) {
    const total = results.reduce((sum, { count }) => sum + (Number.isFinite(count) ? count : 0), 0);
    const live = results.every(result => result.live);
    elements.forEach(stat => {
      const count = stat.querySelector('[data-download-count]');
      count.textContent = total.toLocaleString('en-US', {
        notation: 'compact', maximumFractionDigits: 1
      }).toLowerCase();
      count.setAttribute('aria-label', total.toLocaleString('en-US'));
      stat.querySelector('[data-download-status]').textContent = live ? 'Live' : 'Estimated';
      stat.dataset.state = live ? 'live' : 'estimated';
      stat.title = live
        ? `${description} Badge values may be rounded or cached.`
        : `${description} Estimated total: some counts use fallback values; unavailable counts are excluded.`;
    });
  }

  if (stats.length) {
    Promise.all(packages.map(pkg => getDownloads({
      ...pkg, url: `https://api.pepy.tech/badge/${pkg.slug}`
    }))).then(results => renderStats(stats, results, 'Total across six PyPI packages.'));
  }

  // npm reports complete UTC days. Split long histories into annual windows
  // so the cumulative range stays within the API's per-request limit.
  async function getNpmDownloads() {
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    end.setUTCHours(0, 0, 0, 0);
    let start = new Date('2026-10-13T00:00:00Z');
    const requests = [];
    while (start <= end) {
      const rangeEnd = new Date(Math.min(start.getTime() + 364 * 86400000, end.getTime()));
      const range = `${start.toISOString().slice(0, 10)}:${rangeEnd.toISOString().slice(0, 10)}`;
      requests.push(getDownloads({
        url: `https://api.npmjs.org/downloads/point/${range}/%40theagenthealth%2Fagenthealth`,
        fallback: null,
        read: response => response.json().then(data => data.downloads)
      }));
      start = new Date(rangeEnd.getTime() + 86400000);
    }
    const results = await Promise.all(requests);
    if (!results.length || results.some(result => !result.live)) {
      return { count: 14601, live: false };
    }
    return { count: results.reduce((sum, result) => sum + result.count, 0), live: true };
  }

  if (healthStats.length) {
    const dockerUrl = 'https://hub.docker.com/v2/namespaces/theagenthealth/repositories/agenthealth';
    // Shields reads Docker Hub's exact pull_count; Docker Hub itself does not allow browser CORS.
    const dockerBadge = `https://img.shields.io/badge/dynamic/json.svg?url=${encodeURIComponent(dockerUrl)}&query=%24.pull_count&label=pulls`;
    Promise.all([
      getDownloads({ url: 'https://api.pepy.tech/badge/agenthealth', fallback: 16000 }),
      getNpmDownloads(),
      getDownloads({ url: dockerBadge, fallback: 6899 })
    ]).then(results => renderStats(healthStats, results,
      'Cumulative PyPI downloads, npm downloads since October 13, 2026 through yesterday UTC, and Docker Hub pulls.'));
  }
})();
