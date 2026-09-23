import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import DepositDialog, { openDepositDialog } from "./DepositDialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useVehicles } from "@/hooks/useVehicles";

const modelLink = (car) => `/xe/${car.id}`;

const DesktopVehicleMenu = ({ menu, solid }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={`relative flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-[#3b5bdb] after:transition-all hover:after:w-full ${solid ? "text-[#151515] hover:text-[#3b5bdb]" : "text-white/90 hover:text-white"
          }`}
        onClick={() => setOpen((v) => !v)}
      >
        {menu.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-md border border-black/5 bg-white shadow-xl">
            <div className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] ${menu.tint} bg-black/[0.03]`}>
              {menu.label}
            </div>
            <ul className="py-1">
              {menu.list.map((car) => (
                <li key={car.id}>
                  <Link
                    to={modelLink(car)}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:bg-[#f6f7f9] hover:text-[#3b5bdb]"
                  >
                    <span>{car.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileVehicleMenu = ({ menu, onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-semibold text-[#151515] transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{menu.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>
      {open && (
        <ul className="ml-3 my-1 space-y-1 border-l-2 border-[#3b5bdb]/30 pl-3 py-1">
          {menu.list.map((car) => (
            <li key={car.id}>
              <Link
                to={modelLink(car)}
                onClick={onNavigate}
                className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
              >
                {car.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { electricCars, serviceCars } = useVehicles();
  const phoneDial = settings.hotline.replace(/\D/g, "");

  const VEHICLE_MENUS = [
    { label: "Dòng Xe Điện", tint: "text-[#3b5bdb]", list: electricCars },
    { label: "Xe Dịch Vụ", tint: "text-emerald-600", list: serviceCars },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-[90rem] items-center justify-between px-5 lg:px-10">
        <Link to="/" aria-label="VinFast Home">
          <Logo light={false} showText={false} src={settings.logoUrl} />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          <Link
            to="/gioi-thieu"
            className="relative text-sm font-medium tracking-wide transition-colors text-[#151515] hover:text-[#3b5bdb] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-[#3b5bdb] after:transition-all hover:after:w-full"
          >
            Giới thiệu
          </Link>
          {VEHICLE_MENUS.map((menu) => (
            <DesktopVehicleMenu key={menu.label} menu={menu} solid={true} />
          ))}
          <Link
            to="/tin-tuc"
            className="relative text-sm font-medium tracking-wide transition-colors text-[#151515] hover:text-[#3b5bdb] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-[#3b5bdb] after:transition-all hover:after:w-full"
          >
            Tin tức
          </Link>
          <Link
            to="/lien-he"
            className="relative text-sm font-medium tracking-wide transition-colors text-[#151515] hover:text-[#3b5bdb] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-[#3b5bdb] after:transition-all hover:after:w-full"
          >
            Liên hệ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${phoneDial}`}
            className="hidden items-center gap-2 text-sm font-semibold text-[#151515] md:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {settings.hotline}
          </a>
          <button
            type="button"
            onClick={() => openDepositDialog()}
            className="hidden rounded-sm bg-[#3b5bdb] px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#2b47b8] sm:inline-block"
          >
            Nhận Tư Vấn
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="lg:hidden rounded-md p-1.5 text-[#151515] transition-colors hover:bg-neutral-100"
            aria-label="Mở Menu"
          >
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Off-Canvas Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Off-Canvas Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${open ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
      >
        {/* Header Drawer */}
        <div className="flex h-[72px] items-center justify-between border-b border-black/5 px-6">
          <Link to="/" onClick={() => setOpen(false)} aria-label="VinFast Home">
            <Logo light={false} showText={false} src={settings.logoUrl} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black"
            aria-label="Đóng Menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body Drawer */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-base font-semibold text-[#151515] transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
            >
              Trang chủ
            </Link>
            <Link
              to="/gioi-thieu"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-base font-semibold text-[#151515] transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
            >
              Giới thiệu
            </Link>

            {VEHICLE_MENUS.map((menu) => (
              <MobileVehicleMenu key={menu.label} menu={menu} onNavigate={() => setOpen(false)} />
            ))}

            <Link
              to="/tin-tuc"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-base font-semibold text-[#151515] transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
            >
              Tin tức
            </Link>
            <Link
              to="/lien-he"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-base font-semibold text-[#151515] transition-colors hover:bg-neutral-100 hover:text-[#3b5bdb]"
            >
              Liên hệ
            </Link>
          </nav>
        </div>

        {/* Footer Drawer */}
        <div className="border-t border-black/5 bg-neutral-50 p-5 space-y-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openDepositDialog();
            }}
            className="w-full rounded-md bg-[#3b5bdb] py-3 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#2b47b8]"
          >
            Nhận Tư Vấn Ưu Đãi
          </button>
          <a
            href={`tel:${phoneDial}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#3b5bdb] py-3 text-center text-sm font-semibold uppercase tracking-wider text-[#3b5bdb] transition-colors hover:bg-[#3b5bdb] hover:text-white"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            Hotline: {settings.hotline}
          </a>
        </div>
      </div>

      <DepositDialog />
    </header>
  );
};

export default Header;
