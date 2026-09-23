import { useMemo } from "react";
import pb from "@/lib/pocketbaseClient";
import { createCachedResource } from "@/lib/cachedResource";
import { useCachedResource } from "./useCachedResource";
import { electricCars as FALLBACK_ELECTRIC, serviceCars as FALLBACK_SERVICE } from "@/data/cars";

const FALLBACK = [
  ...FALLBACK_ELECTRIC.map((car) => ({ ...car, category: "electric" })),
  ...FALLBACK_SERVICE.map((car) => ({ ...car, category: "service" })),
];

const toCar = (rec) => ({
  id: rec.slug,
  name: rec.name,
  category: rec.category,
  tagline: rec.tagline || "",
  price: rec.price || "",
  image: rec.image ? pb.files.getURL(rec, rec.image) : rec.image_url || "",
  color: rec.color || "",
  specs: Array.isArray(rec.specs) ? rec.specs : [],
});

const resource = createCachedResource(() => pb
    .collection("vehicles")
    .getFullList({ filter: "active = true", sort: "category,order", requestKey: null })
    .then((records) => records.map(toCar)), FALLBACK);

export const loadVehicles = resource.load;
export const invalidateVehiclesCache = resource.invalidate;

export function useVehicles() {
  const { data: vehicles, loading } = useCachedResource(resource);
  const electricCars = useMemo(() => vehicles.filter((v) => v.category === "electric"), [vehicles]);
  const serviceCars = useMemo(() => vehicles.filter((v) => v.category === "service"), [vehicles]);

  return { vehicles, electricCars, serviceCars, loading };
}
