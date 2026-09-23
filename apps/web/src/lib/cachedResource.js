// Share requests and snapshots across consumers, including already mounted ones.
export function createCachedResource(fetchData, fallback) {
  let snapshot = { data: fallback, loading: true };
  let expiresAt = 0;
  let generation = 0;
  let inflight = null;
  const listeners = new Set();

  const publish = (data, loading) => {
    snapshot = { data, loading };
    listeners.forEach((listener) => listener());
  };

  const invalidate = () => {
    generation += 1;
    expiresAt = 0;
    inflight = null;
    if (listeners.size) void load();
  };

  const load = (force = false) => {
    if (force) invalidate();
    if (inflight) return inflight;
    if (Date.now() < expiresAt) return Promise.resolve(snapshot.data);

    const version = generation;
    const request = Promise.resolve()
      .then(fetchData)
      .then((data) => {
        if (version !== generation) return load();
        expiresAt = Date.now() + 5 * 60_000;
        publish(data, false);
        return data;
      }, () => {
        if (version !== generation) return load();
        // Keep the last good result and avoid retrying for every component.
        expiresAt = Date.now() + 30_000;
        publish(snapshot.data, false);
        return snapshot.data;
      })
      .finally(() => {
        if (inflight === request) inflight = null;
      });
    inflight = request;
    publish(snapshot.data, true);
    return request;
  };

  return {
    load,
    invalidate,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
