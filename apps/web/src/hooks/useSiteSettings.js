import pb from "@/lib/pocketbaseClient";
import { createCachedResource } from "@/lib/cachedResource";
import { useCachedResource } from "./useCachedResource";
import { CONTACT, COMPANY_INFO } from "@/data/cars";

const FALLBACK = {
  logoUrl: "",
  faviconUrl: "",
  hotline_kd: CONTACT.phoneKD,
  hotline_dv: CONTACT.phoneDV,
  hotline: CONTACT.phone,
  zalo: CONTACT.zalo,
  messenger: CONTACT.messenger,
  fanpage: CONTACT.messenger,
  tiktok: "",
  youtube: "",
  fanpage: CONTACT.fanpage,
  tiktok: CONTACT.tiktok,
  youtube: CONTACT.youtube,
  email: CONTACT.email,
  address: COMPANY_INFO.address,
  mst: CONTACT.mst,
  googleTagHead: "",
  googleTagBody: "",
  record: null,
};

const resource = createCachedResource(() => pb
    .collection("site_settings")
    .getFirstListItem("", { requestKey: null })
    .then((record) => {
      const data = {
        ...FALLBACK,
        hotline_kd: record.hotline_kd || FALLBACK.hotline_kd,
        hotline_dv: record.hotline_dv || FALLBACK.hotline_dv,
        hotline: record.hotline || FALLBACK.hotline,
        zalo: record.zalo || FALLBACK.zalo,
        messenger: record.messenger || FALLBACK.messenger,
        fanpage: record.fanpage || FALLBACK.fanpage,
        tiktok: record.tiktok || "",
        youtube: record.youtube || "",
        tiktok: record.tiktok || FALLBACK.tiktok,
        youtube: record.youtube || FALLBACK.youtube,
        email: record.email || FALLBACK.email,
        address: record.address || FALLBACK.address,
        mst: record.mst || FALLBACK.mst,
        googleTagHead: record.google_tag_head || "",
        googleTagBody: record.google_tag_body || "",
        logoUrl: record.logo ? pb.files.getURL(record, record.logo) : "",
        faviconUrl: record.favicon ? pb.files.getURL(record, record.favicon) : "",
        record,
      };
      return data;
    }), FALLBACK);

export const loadSiteSettings = resource.load;
export const invalidateSiteSettingsCache = resource.invalidate;

export function useSiteSettings() {
  const { data: settings, loading } = useCachedResource(resource);
  return { settings, loading };
}
