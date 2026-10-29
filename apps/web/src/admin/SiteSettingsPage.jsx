import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import pb from "@/lib/pocketbaseClient";
import { invalidateSiteSettingsCache } from "@/hooks/useSiteSettings";

const FIELDS = [
  { key: "hotline_kd", label: "Hotline kinh doanh (KD)" },
  { key: "hotline_dv", label: "Hotline dịch vụ (DV)" },
  { key: "hotline", label: "Hotline liên hệ chung" },
  { key: "email", label: "Email liên hệ" },
  { key: "address", label: "Địa chỉ" },
  { key: "mst", label: "Mã số thuế" },
  { key: "zalo", label: "Link Zalo" },
  { key: "messenger", label: "Link Messenger" },
  { key: "fanpage", label: "Link Fanpage Facebook" },
  { key: "tiktok", label: "Link TikTok" },
  { key: "youtube", label: "Link YouTube" },
];

const toForm = (record) => ({
  hotline_kd: record.hotline_kd || "",
  hotline_dv: record.hotline_dv || "",
  hotline: record.hotline || "",
  email: record.email || "",
  address: record.address || "",
  mst: record.mst || "",
  zalo: record.zalo || "",
  messenger: record.messenger || "",
  fanpage: record.fanpage || "",
  tiktok: record.tiktok || "",
  youtube: record.youtube || "",
  google_tag_head: record.google_tag_head || "",
  google_tag_body: record.google_tag_body || "",
});

const getSaveErrorMessage = (error) => {
  const fieldErrors = Object.values(error?.response?.data || {})
    .flatMap((fieldError) => fieldError?.message ? [fieldError.message] : [])
    .filter(Boolean);

  return fieldErrors.join(" ") || error?.response?.message || "Có lỗi xảy ra khi lưu.";
};

const SiteSettingsPage = () => {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    pb.collection("site_settings")
      .getFirstListItem("")
      .then((rec) => {
        setRecord(rec);
        setForm(toForm(rec));
      })
      .catch(() => setMessage("Không tải được cấu hình website. Vui lòng tải lại trang."))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = logoFile || faviconFile
        ? { ...form, ...(logoFile && { logo: logoFile }), ...(faviconFile && { favicon: faviconFile }) }
        : form;
      const updated = await pb.collection("site_settings").update(record.id, data);
      setRecord(updated);
      setForm(toForm(updated));
      setLogoFile(null);
      setFaviconFile(null);
      invalidateSiteSettingsCache();
      setMessage("Đã lưu cấu hình website.");
    } catch (err) {
      setMessage(getSaveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-neutral-400">Đang tải...</p>;
  if (!record) return <p role="alert" className="text-red-600">{message}</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Cấu hình Website</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Logo, favicon, hotline và các kênh liên hệ hiển thị trên toàn bộ website.
      </p>

      <form onSubmit={save} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nhận diện thương hiệu</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Logo</label>
              {record?.logo && (
                <img
                  src={pb.files.getURL(record, record.logo)}
                  alt="logo"
                  className="mb-2 h-10 w-auto"
                />
              )}
              <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Favicon</label>
              {record?.favicon && (
                <img
                  src={pb.files.getURL(record, record.favicon)}
                  alt="favicon"
                  className="mb-2 h-8 w-8"
                />
              )}
              <Input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hotline &amp; liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium">{label}</label>
                <Input
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Tag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-neutral-500">
              Dán nguyên đoạn mã Google cung cấp (Google Tag Manager, gtag.js, Facebook Pixel...) —
              không chỉ mã ID. Để trống nếu chưa dùng.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Mã chèn vào &lt;head&gt;
              </label>
              <Textarea
                rows={5}
                value={form.google_tag_head || ""}
                placeholder={'<!-- Google Tag Manager -->\n<script>...</script>'}
                onChange={(e) => setForm((f) => ({ ...f, google_tag_head: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Mã chèn ngay sau &lt;body&gt;
              </label>
              <Textarea
                rows={4}
                value={form.google_tag_body || ""}
                placeholder={'<!-- Google Tag Manager (noscript) -->\n<noscript><iframe ...></iframe></noscript>'}
                onChange={(e) => setForm((f) => ({ ...f, google_tag_body: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {message && <p className="text-sm text-neutral-700">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu cấu hình
        </Button>
      </form>
    </div>
  );
};

export default SiteSettingsPage;
