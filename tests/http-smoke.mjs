import assert from 'node:assert/strict';

// Read-only check against a locally running production build.
const base = process.env.REWORK_TEST_URL || 'http://localhost:3108';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local test server');
const slugs = ['', '/freight-rework', '/cross-docking', '/transloading', '/rejected-load', '/shifted-load', '/pallet-restacking', '/repalletizing', '/short-term-staging', '/freight-rescue', '/pitch', '/proof'];
const titles = new Set(); const descriptions = new Set();
for (const slug of slugs) {
  const response = await fetch(`${base}/denver-express${slug}`);
  assert.equal(response.status, 200, slug); assert.match(response.headers.get('x-robots-tag') || '', /noindex, nofollow/);
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow/);
  assert.doesNotMatch(html, /<link rel="canonical"/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `H1 ${slug}`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title); assert.ok(!titles.has(title)); titles.add(title);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]; assert.ok(description); assert.ok(!descriptions.has(description)); descriptions.add(description);
  assert.doesNotMatch(html, /"@type":"(?:AggregateRating|Review)"/);
}
assert.equal((await fetch(`${base}/denver-express/not-a-service`)).status, 404);
assert.equal((await fetch(`${base}/denver-express/api/rescue`)).status, 405);
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text(); assert.ok(!sitemap.includes('/denver-express'));
const robots = await (await fetch(`${base}/robots.txt`)).text(); assert.match(robots, /Disallow: \/denver-express\s/);
for (const route of ['/', '/dock', '/office', '/reserve', '/maps', '/commercial', '/manifest.webmanifest', '/sw.js']) assert.equal((await fetch(`${base}${route}`)).status, 200, route);
console.log('PASS: 12 demo pages; unique titles/descriptions; noindex headers/meta; no canonicals; 404/405; sitemap/robots; 8 baseline resources.');
