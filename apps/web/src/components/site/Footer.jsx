import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { LOCATIONS } from "@/data/cars";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const COLS = [
  {
    title: "Dòng Xe Điện",
    links: [
      { label: "VF 2", href: "/xe/vf2" },
      { label: "VF 3", href: "/xe/vf3" },
      { label: "VF 5", href: "/xe/vf5" },
      { label: "VF 6", href: "/xe/vf6" },
      { label: "VF 7", href: "/xe/vf7" },
      { label: "VF 8", href: "/xe/vf8" },
      { label: "VF 9", href: "/xe/vf9" },
      { label: "MPV7", href: "/xe/mpv7" },
      { label: "VF8 All New", href: "/xe/vf8-all-new" },
    ],
  },
  {
    title: "Xe Dịch Vụ",
    links: [
      { label: "Minio Green", href: "/xe/minio-green" },
      { label: "Herio Green", href: "/xe/herio-green" },
      { label: "Nerio Green", href: "/xe/nerio-green" },
      { label: "Limo Green", href: "/xe/limo-green" },
      { label: "EC-Van", href: "/xe/ec-van" },
    ],
  },
];

const Footer = () => {
  const { settings } = useSiteSettings();
  const kdDial = settings.hotline_kd.replace(/\D/g, "");
  const dvDial = settings.hotline_dv.replace(/\D/g, "");

  return (
    <footer className="border-t border-neutral-200 bg-[#eef0f2] pt-16 text-[#151515]">
      <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="font-display text-lg font-bold text-[#151515]">CTY TNHH TM DV Ô TÔ KIM SƠN</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3b5bdb] mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Hotline KD</p>
                  <a href={`tel:${kdDial}`} className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    {settings.hotline_kd}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3b5bdb] mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Hotline DV</p>
                  <a href={`tel:${dvDial}`} className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    {settings.hotline_dv}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#3b5bdb] mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Trụ sở</p>
                  <p className="text-sm text-neutral-700">{settings.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#3b5bdb] mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    {settings.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3b5bdb] mt-0.5 opacity-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">MST</p>
                  <p className="text-sm text-neutral-700">{settings.mst}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:contents">
            {COLS.map((c) => (
              <div key={c.title}>
                <h4 className="font-display text-sm font-bold uppercase tracking-wide">{c.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-sm text-neutral-600 transition hover:text-[#3b5bdb]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide">Liên Hệ</h4>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Website</p>
                <a href="https://vinfastbienhoa.com.vn" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                  vinfastbienhoa.com.vn
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Zalo</p>
                <a href={settings.zalo} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                  Chat Zalo
                </a>
              </div>
              {settings.fanpage && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Fanpage</p>
                  <a href={settings.fanpage} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    VinFast Kim Sơn
                  </a>
                </div>
              )}
              {settings.tiktok && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Tiktok</p>
                  <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    @ngocnga.vinfast
                  </a>
                </div>
              )}
              {settings.youtube && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Youtube</p>
                  <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:text-[#3b5bdb] transition">
                    VinFast Kim Sơn
                  </a>
                </div>
              )}
              <div className="mt-4 flex gap-3 pt-1">
                {settings.fanpage && (
                  <a href={settings.fanpage} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm transition hover:bg-[#3b5bdb] hover:text-white" title="Fanpage">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                )}
                {settings.tiktok && (
                  <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm transition hover:bg-[#3b5bdb] hover:text-white" title="TikTok">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z" /></svg>
                  </a>
                )}
                {settings.youtube && (
                  <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm transition hover:bg-[#3b5bdb] hover:text-white" title="YouTube">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 10 Locations Section */}
        <div className="mt-12 border-t border-neutral-300 pt-10">
          <h3 className="font-display text-lg font-bold text-[#151515] mb-4">NPP Kim Sơn tự hào là đơn vị phân phối và dịch vụ hàng đầu tại Đồng Nai với 10 cơ sở:</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {LOCATIONS.map((loc, idx) => (
              <p key={idx} className="text-sm text-neutral-700 leading-relaxed">
                📍 <span className="font-semibold">{loc.name}</span> - {loc.address}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-300 py-6 text-xs text-neutral-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Tamdev. Bảo lưu mọi quyền.</span>
          <div className="flex gap-5">
            <a href="#top" className="hover:text-[#3b5bdb]">Chính sách bảo mật</a>
            <a href="#top" className="hover:text-[#3b5bdb]">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
