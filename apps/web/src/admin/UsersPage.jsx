import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";
import { currentAdmin } from "@/lib/adminAuth";

const ROLE_COLLECTION = { admin: "_superusers", user: "users" };
const ROLE_LABEL = { admin: "Admin (toàn quyền)", user: "User (tin tức, form, slider)" };

const UsersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", passwordConfirm: "", role: "user" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const me = currentAdmin();

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [admins, staff] = await Promise.all([
        pb.collection("_superusers").getFullList({ sort: "created", requestKey: null }),
        pb.collection("users").getFullList({ sort: "created", requestKey: null }),
      ]);
      setItems([
        ...admins.map((i) => ({ ...i, role: "admin" })),
        ...staff.map((i) => ({ ...i, role: "user" })),
      ]);
    } catch {
      setLoadError("Không tải được danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ email: "", password: "", passwordConfirm: "", role: "user" });
    setError("");
    setResetTarget(null);
    setDialogOpen(true);
  };

  const openReset = (item) => {
    setForm({ email: item.email, password: "", passwordConfirm: "", role: item.role });
    setError("");
    setResetTarget(item);
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.passwordConfirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSaving(true);
    try {
      const collection = ROLE_COLLECTION[resetTarget ? resetTarget.role : form.role];
      if (resetTarget) {
        await pb.collection(collection).update(resetTarget.id, {
          password: form.password,
          passwordConfirm: form.passwordConfirm,
        });
      } else {
        await pb.collection(collection).create({
          email: form.email.trim(),
          password: form.password,
          passwordConfirm: form.passwordConfirm,
        });
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.message || "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (item.id === me?.id) {
      window.alert("Bạn không thể tự xóa tài khoản đang đăng nhập.");
      return;
    }
    if (item.role === "admin" && items.filter((i) => i.role === "admin").length <= 1) {
      window.alert("Không thể xóa tài khoản Admin cuối cùng.");
      return;
    }
    if (!window.confirm(`Xóa tài khoản "${item.email}"?`)) return;
    try {
      await pb.collection(ROLE_COLLECTION[item.role]).delete(item.id);
      await load();
    } catch {
      setLoadError("Không xóa được tài khoản. Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Người dùng quản trị</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Tài khoản có quyền đăng nhập vào trang quản trị này.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {loadError && <p role="alert" className="mt-4 text-sm text-red-600">{loadError} <button type="button" onClick={load} className="underline">Tải lại</button></p>}
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-neutral-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.email}
                    {item.id === me?.id && (
                      <span className="ml-2 text-xs text-neutral-400">(bạn)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-500">{ROLE_LABEL[item.role]}</TableCell>
                  <TableCell className="text-sm text-neutral-500">
                    {new Date(item.created).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openReset(item)} title="Đặt lại mật khẩu">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(item)} title="Xóa">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{resetTarget ? `Đặt lại mật khẩu — ${resetTarget.email}` : "Thêm người dùng quản trị"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {!resetTarget && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Vai trò *</label>
                  <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{ROLE_LABEL.user}</SelectItem>
                      <SelectItem value="admin">{ROLE_LABEL.admin}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mật khẩu *</label>
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Xác nhận mật khẩu *</label>
              <Input
                type="password"
                required
                minLength={8}
                value={form.passwordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
