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

const DEFAULT_RECIPIENTS = [];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRecipients = (items) => {
  const seen = new Set();
  return items.reduce((result, item) => {
    const email = String(item.email || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || seen.has(email)) return result;
    seen.add(email);
    result.push({ ...item, email });
    return result;
  }, []);
};

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
  const [loadedSenderAddress, setLoadedSenderAddress] = useState("");
  const [mailSettingsId, setMailSettingsId] = useState("");

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
    Promise.all([
      pb.send("/api/settings", { method: "GET" }),
      pb.collection("mail_settings").getList(1, 1, { requestKey: null }),
    ])
      .then(([settings, mailSettingsResult]) => {
        const mailSettings = mailSettingsResult.items[0];
        setForm({
          enabled: !!settings.smtp?.enabled,
          host: settings.smtp?.host && !settings.smtp.host.includes("example.com") ? settings.smtp.host : "",
          port: settings.smtp?.port || 587,
          username: settings.smtp?.username && !settings.smtp.username.includes("example.com") ? settings.smtp.username : "",
          password: "",
          tls: settings.smtp?.tls !== false,
        });
        setLoadedSenderAddress(settings.meta?.senderAddress || "");
        setMailSettingsId(mailSettings?.id || "");

        if (mailSettings?.recipients_json) {
          try {
            const list = JSON.parse(mailSettings.recipients_json);
            if (Array.isArray(list)) setRecipients(list);
          } catch {}
        }
        if (mailSettings?.senders_json) {
          try {
            const list = JSON.parse(mailSettings.senders_json);
            if (Array.isArray(list)) setSenders(list);
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
      if (form.enabled && (!form.host.trim() || !form.username.trim())) {
        setMessage("SMTP đang bật: vui lòng nhập đầy đủ SMTP Host và Username.");
        return;
      }
      if (form.enabled && Number(form.port) === 587 && form.tls) {
        setMessage("Cổng 587 phải tắt TLS trực tiếp để PocketBase dùng STARTTLS.");
        return;
      }

      const normalizedRecipients = normalizeRecipients(recipients);
      const activeRecipients = normalizedRecipients.filter((r) => r.active !== false);
      if (form.enabled && activeRecipients.length === 0) {
        setMessage("SMTP đang bật: cần ít nhất một email nhận thông báo đang hoạt động.");
        return;
      }

      const activeSenders = senders.filter((s) => s.active !== false);
      const smtp = {
        enabled: form.enabled,
        host: form.host.trim(),
        port: Number(form.port) || 587,
        username: form.username.trim(),
        tls: form.tls,
      };
      if (form.password) smtp.password = form.password;

      const selectedDefaultSender = activeSenders.find((s) => s.isDefault) || activeSenders[0] || {
        name: "VinFast Kim Sơn",
        email: form.username.trim(),
      };
      const smtpSenderEmail = form.username.trim();
      const smtpSender = activeSenders.find((sender) => sender.email.toLowerCase() === smtpSenderEmail.toLowerCase());
      const synchronizedSender = smtpSender || {
        id: `smtp-${Date.now()}`,
        name: selectedDefaultSender.name || "VinFast Kim Sơn",
        email: smtpSenderEmail,
        role: "Tài khoản SMTP thực tế",
        active: true,
      };
      const synchronizedSenders = smtpSender ? senders : [...senders, synchronizedSender];
      const normalizedSenders = synchronizedSenders.map((sender) => ({
        ...sender,
        isDefault: sender.id === synchronizedSender.id,
      }));

      await pb.send("/api/settings", {
        method: "PATCH",
        body: {
          smtp,
          meta: {
            senderName: synchronizedSender.name,
            senderAddress: smtpSenderEmail,
          },
        },
      });

      const mailSettingsBody = {
        senders_json: JSON.stringify(normalizedSenders),
        recipients_json: JSON.stringify(normalizedRecipients),
      };
      if (mailSettingsId) {
        await pb.collection("mail_settings").update(mailSettingsId, mailSettingsBody);
      } else {
        const created = await pb.collection("mail_settings").create(mailSettingsBody);
        setMailSettingsId(created.id);
      }

      setSenders(normalizedSenders);
      setRecipients(normalizedRecipients);
      localStorage.setItem("vf_mail_senders", JSON.stringify(normalizedSenders));
      localStorage.setItem("vf_mail_recipients", JSON.stringify(normalizedRecipients));

      setForm((f) => ({ ...f, password: "" }));
      setLoadedSenderAddress(smtpSenderEmail);
      setMessage("Đã lưu cấu hình. Hãy dùng Gửi thử để xác nhận SMTP hoạt động và kiểm tra hộp thư nhận.");
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

  const handleToggleSender = (id, active) => {
    setSenders((current) => current.map((sender) => (
      sender.id === id ? { ...sender, active } : sender
    )));
  };

  // Recipient list handlers
  const handleAddRecipient = (e) => {
    e.preventDefault();
    const email = newRecipient.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setMessage("Email người nhận không hợp lệ.");
      return;
    }
    if (recipients.some((recipient) => recipient.email?.trim().toLowerCase() === email)) {
      setMessage("Email người nhận đã có trong danh sách.");
      return;
    }
    const item = {
      id: String(Date.now()),
      email,
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

  const handleToggleRecipient = (id, active) => {
    setRecipients((current) => current.map((recipient) => (
      recipient.id === id ? { ...recipient, active } : recipient
    )));
  };

  const portNumber = Number(form.port);
  const transportWarning = portNumber === 587 && form.tls
    ? "Cấu hình không khớp: cổng 587 dùng STARTTLS, hãy tắt TLS trực tiếp."
    : portNumber === 465 && !form.tls
      ? "Cấu hình không khớp: cổng 465 thường cần bật TLS trực tiếp."
      : "";
  const selectedSender = senders.find((sender) => sender.isDefault && sender.active !== false);
  const senderWarning = form.enabled && selectedSender?.email && form.username.trim()
    && selectedSender.email.toLowerCase() !== form.username.trim().toLowerCase()
    ? `Người gửi mặc định (${selectedSender.email}) khác Username SMTP (${form.username.trim()}). Chỉ dùng được nếu nhà cung cấp cho phép alias này.`
    : "";

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
                aria-label="Bật hoặc tắt SMTP"
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
              <Switch
                checked={form.tls}
                onCheckedChange={(v) => setForm((f) => ({ ...f, tls: v }))}
                aria-label="TLS trực tiếp"
              />
              <span className="text-sm font-medium">TLS trực tiếp (thường dùng cổng 465)</span>
            </div>
            <p className="text-xs text-neutral-500 sm:col-span-2">
              Với cổng 587, hãy tắt công tắc này để PocketBase dùng STARTTLS. Lưu cấu hình chưa có nghĩa là SMTP đã gửi được; cần chạy Gửi thử.
            </p>
            {transportWarning && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 sm:col-span-2">
                {transportWarning}
              </p>
            )}
            {senderWarning && (
              <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800 sm:col-span-2">
                {senderWarning}
              </p>
            )}
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
              Đây là địa chỉ From dùng khi gửi thông báo, không phải hộp thư được tạo trên máy chủ. Nhà cung cấp SMTP có thể yêu cầu người gửi mặc định trùng Username SMTP.
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
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={s.active !== false}
                              onCheckedChange={(active) => handleToggleSender(s.id, active)}
                              aria-label={`Bật hoặc tắt ${s.email}`}
                            />
                            <span className="text-xs text-neutral-500">{s.active !== false ? "Đang dùng" : "Đã tắt"}</span>
                          </div>
                          {s.isDefault && s.active !== false && (
                            <Badge className="mt-1 bg-emerald-600 text-white font-medium">Người gửi mặc định</Badge>
                          )}
                          {s.isDefault && loadedSenderAddress === s.email && (
                            <Badge variant="outline" className="ml-1 mt-1">Đã lưu máy chủ</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {!s.isDefault && s.active !== false && (
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
              Chỉ email đang bật mới nhận thông báo khách hàng mới. Danh sách này không tạo hộp thư; địa chỉ phải tồn tại và domain phải có MX hợp lệ.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recipients.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-sm font-semibold text-[#151515]">{r.email}</p>
                    <p className="text-xs text-neutral-400">{r.note}</p>
                  </div>
                  <Switch
                    checked={r.active !== false}
                    onCheckedChange={(active) => handleToggleRecipient(r.id, active)}
                    aria-label={`Bật hoặc tắt nhận mail ${r.email}`}
                  />
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

