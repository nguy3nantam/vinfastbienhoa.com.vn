import { useEffect, useState } from "react";
import { Newspaper, Users, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import pb from "@/lib/pocketbaseClient";
import { currentRole } from "@/lib/adminAuth";

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <Card>
    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-neutral-500">{label}</CardTitle>
      <Icon className="h-4 w-4 text-neutral-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{loading ? "…" : value}</div>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const isAdmin = currentRole() === "admin";
  const [stats, setStats] = useState({ news: null, contacts: null, users: null });
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setError(false);
    Promise.all([
      pb.collection("news").getList(1, 1, { fields: "id", requestKey: null }),
      pb.collection("contacts").getList(1, 1, { fields: "id", requestKey: null }),
      isAdmin ? pb.collection("_superusers").getList(1, 1, { fields: "id", requestKey: null }) : Promise.resolve(null),
    ]).then(([news, contacts, users]) => {
      if (!mounted) return;
      setStats({
        news: news.totalItems,
        contacts: contacts.totalItems,
        users: users?.totalItems ?? null,
      });
    }).catch(() => {
      if (mounted) setError(true);
    });
    return () => {
      mounted = false;
    };
  }, [isAdmin, attempt]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Tổng quan</h1>
      <p className="mt-1 text-sm text-neutral-500">Trang quản trị nội bộ VinFast Kim Sơn.</p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">Không tải được thống kê. <button type="button" onClick={() => setAttempt((value) => value + 1)} className="underline">Thử lại</button></p>
      ) : <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Newspaper} label="Tin tức" value={stats.news} loading={stats.news === null} />
        <StatCard icon={Users} label="Khách hàng đăng ký" value={stats.contacts} loading={stats.contacts === null} />
        {isAdmin && (
          <StatCard icon={Users2} label="Người dùng quản trị" value={stats.users} loading={stats.users === null} />
        )}
      </div>}
    </div>
  );
};

export default DashboardPage;
