/* global URL, process, fetch, AbortSignal, setTimeout, console */
// Only public health/preflight requests; never sends credentials or changes data.
const origin = 'https://animarc.github.io';
for (const [key, service] of [
  ['VITE_SESSION_API_URL', 'TabijiLog.Session.Api'],
  ['VITE_TRAVELS_API_URL', 'TabijiLog.Travels.Api']
]) {
  const url = new URL(process.env[key] || '');
  if (url.protocol !== 'https:' || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error(key + ' must be a public HTTPS origin without credentials or path.');
  }
  let healthy = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(new URL('/health/ready', url), { signal: AbortSignal.timeout(90000) });
      const health = await response.json();
      if (response.ok && health.status === 'healthy' && health.service === service) {
        healthy = true;
        break;
      }
    } catch { /* Free services may be waking up. */ }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  if (!healthy) throw new Error(service + ' is not ready. SPA publication cancelled.');
  const response = await fetch(new URL('/api/auth/browser/refresh', url), {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type' }
  });
  if (!response.ok || response.headers.get('access-control-allow-origin') !== origin ||
      (key === 'VITE_SESSION_API_URL' && response.headers.get('access-control-allow-credentials') !== 'true')) {
    throw new Error(service + ' CORS is not configured for GitHub Pages.');
  }
  console.log(service + ': ready and CORS verified.');
}
