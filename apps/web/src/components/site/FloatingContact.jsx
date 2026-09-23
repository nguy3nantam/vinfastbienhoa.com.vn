import { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ZaloIcon, MessengerIcon } from "./icons";

const FloatingContact = () => {
  const { settings } = useSiteSettings();
  const phoneDial = settings.hotline.replace(/\D/g, "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const brandIconClassName = "h-7 w-7 shrink-0";
  const buttonClassName = "flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg ring-1 transition-transform duration-200 hover:scale-105";

  const items = [
    { key: "zalo", href: settings.zalo, label: "Chat Zalo", icon: <ZaloIcon className={`${brandIconClassName} text-[#0068ff]`} />, external: true },
    { key: "messenger", href: settings.messenger, label: "Messenger", icon: <MessengerIcon className={`${brandIconClassName} text-[#0084ff]`} />, external: true },
    { key: "phone", href: `tel:${phoneDial}`, label: "Gọi điện", icon: <Phone className="h-6 w-6 shrink-0 text-[#3b5bdb]" strokeWidth={2.2} />, external: false },
  ];

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3">
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
            aria-label={item.label}
            onClick={() => setOpen(false)}
            className={`${buttonClassName} bg-white ring-black/5`}
          >
            {item.icon}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng" : "Liên hệ"}
        aria-expanded={open}
        className={`${buttonClassName} bg-[#3b5bdb] text-white ring-[#3b5bdb]`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default FloatingContact;
