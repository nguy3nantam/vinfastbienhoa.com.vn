import { useEffect, useSyncExternalStore } from "react";

export function useCachedResource(resource) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot);

  useEffect(() => {
    void resource.load();
  }, [resource]);

  return snapshot;
}
