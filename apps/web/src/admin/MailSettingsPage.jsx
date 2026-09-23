import { useEffect, useState } from "react";
import { Loader2, Save, Send, Plus, Trash2, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";

const DEFAULT_SENDERS = [
  {
    id: "s1",
    name: "VinFast Kim Sơn - Thông báo hệ thống",
    email: "no-reply@vinfastbienhoa.com.vn",
    role: "Thông báo hệ thống",
    isDefault: true,
    active: true,
  },
  {
    id: "s2",
    name: "Phòng Kinh Doanh & Báo Giá",
    email: "kd@vinfastbienhoa.com.vn",
    role: "Tư vấn & Báo giá",
    isDefault: false,
    active: true,
  },
  {
    id: "s3",
    name: "Chăm Sóc Khách Hàng & Dịch Vụ",
    email: "cskh@vinfastbienhoa.com.vn",
    role: "Hỗ trợ & Dịch vụ",
    isDefault: false,
    active: true,
  },
];

const DEFAULT_RECIPIENTS = [
  { id: "r1", email: "tan.tranminh@vinfastbienhoa.vn", note: "Trưởng phòng kinh doanh", active: true },
  { id: "r2", email: "nguy3nantam@gmail.com", note: "Quản trị viên hệ thống", active: true },
  { id: "r3", email: "admin@vinfastbienhoa.com.vn", note: "Quản trị viên chính", active: true },
  { id: "r4", email: "kinhdoanh@vinfastbienhoa.com.vn", note: "Bộ phận tư vấn lái thử", active: true },
];

const MailSettingsPage = () => {
  const [form, setForm] = useState({
    enabled: false,
    host: "",
    port: 587,
    username: "",
    password: "",
    tls: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  // Configured sender accounts list
  const [senders, setSenders] = useState(() => {
    try {
      const saved = localStorage.getItem("vf_mail_senders");
      return saved ? JSON.parse(saved) : DEFAULT_SENDERS;
    } catch {
      return DEFAULT_SENDERS;
    }
  });

  // Notification recipient list
  const [recipients, setRecipients] = useState(() => {
    try {
      const saved = localStorage.getItem("vf_mail_recipients");
      return saved ? JSON.parse(saved) : DEFAULT_RECIPIENTS;
    } catch {
      return DEFAULT_RECIPIENTS;
    }
  });

  // New sender input form state
  const [newSender, setNewSender] = useState({ name: "", email: "", role: "Tư vấn & Báo giá" });
  // New recipient input form state
  const [newRecipient, setNewRecipient] = useState({ email: "", note: "" });

  useEffect(() => {
    pb.send("/api/settings", { method: "GET" })
      .then((settings) => {
        setForm({
          enabled: !!settings.smtp?.enabled,
          host: settings.smtp?.host && !settings.smtp.host.includes("example.com") ? settings.smtp.host : "",
          port: settings.smtp?.port || 587,
          username: settings.smtp?.username && !settings.smtp.username.includes("example.com") ? settings.smtp.username : "",
          password: "",
          tls: settings.smtp?.tls !== false,
        });

        if (settings.meta?.recipientsJson) {
          try {
            const list = JSON.parse(settings.meta.recipientsJson);
            if (Array.isArray(list) && list.length > 0) setRecipients(list);
          } catch {}
        }
        if (settings.meta?.sendersJson) {
          try {
            const list = JSON.parse(settings.meta.sendersJson);
            if (Array.isArray(list) && list.length > 0) setSenders(list);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const smtp = {
        enabled: form.enabled,
        host: form.host.trim(),
        port: Number(form.port) || 587,
        username: form.username.trim(),
        tls: form.tls,
      };
      if (form.password) smtp.password = form.password;

      const defaultSender = senders.find((s) => s.isDefault) || senders[0] || {
        name: "VinFast Kim Sơn",
        email: "no-reply@vinfastbienhoa.com.vn",
      };

      await pb.send("/api/settings", {
        method: "PATCH",
        body: {
          smtp,
          meta: {
            senderName: defaultSender.name,
            senderAddress: defaultSender.email,
            sendersJson: JSON.stringify(senders),
            recipientsJson: JSON.stringify(recipients),
            notificationEmails: recipients.map((r) => r.email).join(","),
          },
        },
      });

      localStorage.setItem("vf_mail_senders", JSON.stringify(senders));
      localStorage.setItem("vf_mail_recipients", JSON.stringify(recipients));

      setForm((f) => ({ ...f, password: "" }));
      setMessage("Đã lưu thành công tất cả cấu hình gửi/nhận email.");
    } catch (err) {
      setMessage(err?.response?.message || "Có lỗi xảy ra khi lưu cấu hình mail.");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setMessage("");
    try {
      await pb.send("/api/settings/test/email", {
        method: "POST",
        body: { email: testEmail.trim(), template: "verification" },
      });
      setMessage(`Đã gửi mail thử thành công tới ${testEmail}.`);
    } catch (err) {
      setMessage(err?.response?.message || "Gửi mail thử thất bại. Kiểm tra lại cấu hình SMTP.");
    } finally {
      setTesting(false);
    }
  };

  // Sender list handlers
  const handleAddSender = (e) => {
    e.preventDefault();
    if (!newSender.email.trim()) return;
    const item = {
      id: String(Date.now()),
      name: newSender.name.trim() || "VinFast Kim Sơn",
      email: newSender.email.trim(),
      role: newSender.role.trim() || "Thông báo",
      isDefault: senders.length === 0,
      active: true,
    };
    const updated = [...senders, item];
    setSenders(updated);
    localStorage.setItem("vf_mail_senders", JSON.stringify(updated));
    setNewSender({ name: "", email: "", role: "Tư vấn & Báo giá" });
  };

  const handleRemoveSender = (id) => {
    const updated = senders.filter((s) => s.id !== id);
    if (updated.length > 0 && !updated.some((s) => s.isDefault)) {
      updated[0].isDefault = true;
    }
    setSenders(updated);
    localStorage.setItem("vf_mail_senders", JSON.stringify(updated));
  };

  const handleSetDefaultSender = (sender) => {
    const updated = senders.map((s) => ({ ...s, isDefault: s.id === sender.id }));
    setSenders(updated);
    localStorage.setItem("vf_mail_senders", JSON.stringify(updated));
  };

  // Recipient list handlers
  const handleAddRecipient = (e) => {
    e.preventDefault();
    if (!newRecipient.email.trim()) return;
    const item = {
      id: String(Date.now()),
      email: newRecipient.email.trim(),
      note: newRecipient.note.trim() || "Nhận thông báo",
      active: true,
    };
    const updated = [...recipients, item];
    setRecipients(updated);
    localStorage.setItem("vf_mail_recipients", JSON.stringify(updated));
    setNewRecipient({ email: "", note: "" });
  };

  const handleRemoveRecipient = (id) => {
    const updated = recipients.filter((r) => r.id !== id);
    setRecipients(updated);
    localStorage.setItem("vf_mail_recipients", JSON.stringify(updated));
  };

  if (loading) return <p className="text-neutral-400">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Cấu hình gửi mail</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Quản lý máy chủ SMTP, gom nhóm các địa chỉ email gửi đi và danh sách email nhận thông báo khách hàng mới.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Máy chủ SMTP */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#3b5bdb]" />
              Máy chủ SMTP
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
              />
              <span className="text-sm font-medium text-neutral-600">{form.enabled ? "Đang bật" : "Đang tắt"}</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">SMTP Host</label>
              <Input
                value={form.host}
                onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Port</label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Username</label>
              <Input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="username@gmail.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Mật khẩu ứng dụng (App Password)"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch checked={form.tls} onCheckedChange={(v) => setForm((f) => ({ ...f, tls: v }))} />
              <span className="text-sm font-medium">Sử dụng kết nối bảo mật TLS / SSL</span>
            </div>
          </CardContent>
        </Card>

        {/* GOM CHUNG DANH SÁCH EMAIL GỬI ĐI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#3b5bdb]" />
              Danh sách địa chỉ email gửi đi (Outgoing Sender Emails)
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {senders.length} địa chỉ
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-neutral-500">
              Quản lý tất cả địa chỉ email gửi đi. Email được chọn mốc <strong className="text-emerald-700">"Người gửi mặc định"</strong> sẽ được tự động sử dụng làm thông tin gửi chính từ hệ thống.
            </p>

            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên hiển thị người gửi</TableHead>
                    <TableHead>Địa chỉ Email (From Address)</TableHead>
                    <TableHead>Vai trò / Mục đích</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-neutral-400">
                        Chưa có email gửi nào trong danh sách.
                      </TableCell>
                    </TableRow>
                  ) : (
                    senders.map((s) => (
                      <TableRow key={s.id} className={s.isDefault ? "bg-emerald-50/40" : ""}>
                        <TableCell className="font-medium text-[#151515]">{s.name}</TableCell>
                        <TableCell className="font-mono text-xs">{s.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {s.isDefault ? (
                            <Badge className="bg-emerald-600 text-white font-medium">Người gửi mặc định</Badge>
                          ) : (
                            <span className="text-xs text-neutral-500">Đã cấu hình</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {!s.isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultSender(s)}
                              className="text-xs text-[#3b5bdb] hover:bg-blue-50"
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Đặt mặc định
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSender(s.id)}
                            aria-label="Xóa email gửi"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Form thêm email gửi mới */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-[#151515]">Thêm địa chỉ email gửi mới vào danh sách:</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Tên hiển thị (ví dụ: VinFast Kim Sơn)"
                  value={newSender.name}
                  onChange={(e) => setNewSender((s) => ({ ...s, name: e.target.value }))}
                />
                <Input
                  type="email"
                  placeholder="Địa chỉ Email gửi (vd: no-reply@...)"
                  value={newSender.email}
                  onChange={(e) => setNewSender((s) => ({ ...s, email: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Mục đích (ví dụ: Tư vấn & Báo giá)"
                    value={newSender.role}
                    onChange={(e) => setNewSender((s) => ({ ...s, role: e.target.value }))}
                  />
                  <Button type="button" onClick={handleAddSender} className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DANH SÁCH EMAIL NHẬN THÔNG BÁO KHÁCH ĐĂNG KÝ MỚI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#3b5bdb]" />
              Danh sách email nhận thông báo (Lead Notifications)
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {recipients.length} người nhận
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-neutral-500">
              Các email nằm trong danh sách này sẽ tự động nhận được thư báo khi có khách hàng điền form nhận tư vấn hoặc đăng ký lái thử trên website.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recipients.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-sm font-semibold text-[#151515]">{r.email}</p>
                    <p className="text-xs text-neutral-400">{r.note}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRecipient(r.id)}
                    aria-label="Xóa email nhận"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Form thêm email nhận mới */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-[#151515]">Thêm email nhận thông báo mới:</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  type="email"
                  placeholder="Email nhận thông báo (vd: kd@vinfastbienhoa.vn)"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient((r) => ({ ...r, email: e.target.value }))}
                />
                <Input
                  placeholder="Ghi chú (vd: Trưởng phòng bán hàng)"
                  value={newRecipient.note}
                  onChange={(e) => setNewRecipient((r) => ({ ...r, note: e.target.value }))}
                />
                <Button type="button" onClick={handleAddRecipient} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Thêm người nhận
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {message && (
          <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-800">
            {message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu tất cả cấu hình mail
          </Button>

          <div className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="Nhập email nhận thử"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-64"
            />
            <Button type="button" variant="outline" onClick={sendTest} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gửi thử
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MailSettingsPage;

