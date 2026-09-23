import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCachedResource } from '../src/lib/cachedResource.js';

test('concurrent consumers share one request and cache the result', async () => {
  let calls = 0;
  const resource = createCachedResource(async () => { calls++; return ['car']; }, []);
  const first = resource.load();
  assert.equal(resource.load(), first);
  await first;
  assert.deepEqual(await resource.load(), ['car']);
  assert.equal(calls, 1);
  assert.equal(resource.getSnapshot().loading, false);
});

test('invalidating refreshes mounted consumers', async () => {
  let value = 'old';
  const resource = createCachedResource(async () => value, 'fallback');
  await resource.load();
  const snapshots = [];
  const unsubscribe = resource.subscribe(() => snapshots.push(resource.getSnapshot()));
  value = 'new';
  resource.invalidate();
  await resource.load();
  assert.deepEqual(snapshots.at(-1), { data: 'new', loading: false });
  unsubscribe();
});

test('an old pending response cannot overwrite a forced refresh', async () => {
  const resolvers = [];
  const resource = createCachedResource(() => new Promise((resolve) => resolvers.push(resolve)), 'fallback');
  const old = resource.load();
  await Promise.resolve();
  const current = resource.load(true);
  await Promise.resolve();
  resolvers[1]('new');
  await current;
  resolvers[0]('old');
  assert.equal(await old, 'new');
  assert.equal(resource.getSnapshot().data, 'new');
});

test('failures retain good data and do not cause a request per consumer', async () => {
  let calls = 0;
  const resource = createCachedResource(() => {
    if (++calls > 1) throw new Error('offline');
    return 'good';
  }, 'fallback');
  await resource.load();
  await resource.load(true);
  assert.equal(await resource.load(), 'good');
  assert.equal(calls, 2);
  assert.equal(resource.getSnapshot().loading, false);
});

test('failed initial request returns fallback and can be retried', async () => {
  let offline = true;
  const resource = createCachedResource(async () => {
    if (offline) throw new Error('offline');
    return 'recovered';
  }, 'fallback');
  assert.equal(await resource.load(), 'fallback');
  offline = false;
  assert.equal(await resource.load(true), 'recovered');
});
