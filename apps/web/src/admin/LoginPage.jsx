import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin, isAdminAuthed } from "@/lib/adminAuth";
import Logo from "@/components/site/Logo";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Đăng nhập | Quản trị";
  }, []);

  if (isAdminAuthed()) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(username, password);
      const redirectTo = location.state?.from || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo showText={false} />
          <CardTitle className="mt-2">Đăng nhập quản trị</CardTitle>
          <CardDescription>VinFast Kim Sơn — trang quản trị nội bộ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="mb-1.5 block text-sm font-medium">Tên đăng nhập</label>
              <Input
                id="admin-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tài khoản"
                autoCapitalize="none"
                spellCheck={false}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Chỉ cần nhập tên, hệ thống tự thêm @vinfastbienhoa.com.vn.
              </p>
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">Mật khẩu</label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
