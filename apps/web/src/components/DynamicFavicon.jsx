import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicFavicon = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings.faviconUrl) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }, [settings.faviconUrl]);

  return null;
};

export default DynamicFavicon;
