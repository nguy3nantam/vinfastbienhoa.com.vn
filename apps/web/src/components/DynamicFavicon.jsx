import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicFavicon = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings.faviconUrl) return;
    const links = document.querySelectorAll("link[rel~='icon']");
    if (links.length) {
      links.forEach((link) => {
        link.href = settings.faviconUrl;
        if (settings.faviconUrl.endsWith(".png")) {
          link.type = "image/png";
        } else if (settings.faviconUrl.endsWith(".svg")) {
          link.type = "image/svg+xml";
        } else if (settings.faviconUrl.endsWith(".ico")) {
          link.type = "image/x-icon";
        } else {
          link.removeAttribute("type");
        }
      });
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = settings.faviconUrl;
      document.head.appendChild(link);
    }
  }, [settings.faviconUrl]);

  return null;
};

export default DynamicFavicon;
