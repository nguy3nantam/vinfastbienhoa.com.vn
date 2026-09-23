import { useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Users2,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  Images,
  Car,
} from "lucide-react";
import { isAdminAuthed, currentRole, adminLogout, currentAdmin } from "@/lib/adminAuth";

const NAV_ITEMS = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true, roles: ["admin", "user"] },
  { to: "/admin/vehicles", label: "Quản lý xe", icon: Car, roles: ["admin", "user"] },
  { to: "/admin/sliders", label: "Slider", icon: Images, roles: ["admin", "user"] },
  { to: "/admin/news", label: "Tin tức", icon: Newspaper, roles: ["admin", "user"] },
  { to: "/admin/customers", label: "Khách hàng", icon: Users, roles: ["admin", "user"] },
  { to: "/admin/users", label: "Người dùng", icon: Users2, roles: ["admin"] },
  { to: "/admin/settings/site", label: "Cấu hình web", icon: Settings, roles: ["admin"] },
  { to: "/admin/settings/mail", label: "Cấu hình email", icon: Mail, roles: ["admin"] },
];

// Đường dẫn chỉ Admin (superuser) được vào — chặn cả khi User gõ thẳng URL.
const ADMIN_ONLY_PREFIXES = ["/admin/users", "/admin/settings"];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const activeNav = NAV_ITEMS.slice().reverse().find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    const label = activeNav ? activeNav.label : "Quản trị";
    document.title = `${label} | Quản trị`;
  }, [location.pathname]);

  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const role = currentRole();

  if (role !== "admin" && ADMIN_ONLY_PREFIXES.some((p) => location.pathname.startsWith(p))) {
    return <Navigate to="/admin" replace />;
  }

  const admin = currentAdmin();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const logout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7f9] text-[#151515]">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-black/5 bg-white">
        <div className="flex h-16 items-center border-b border-black/5 px-5">
          <span className="font-display text-lg font-bold tracking-wide">VinFast Kim Sơn</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-[#3b5bdb] text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-[#151515]"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-black/5 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            <ExternalLink className="h-4 w-4" />
            Xem website
          </a>
          <div className="mt-1 px-3 py-1 text-xs text-neutral-400 truncate">{admin?.email}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
