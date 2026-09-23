import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";

const EMPTY_FORM = {
  id: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  source_url: "",
  published: true,
};

const NewsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await pb.collection("news").getFullList({ sort: "-created", requestKey: null });
      setItems(list);
    } catch {
      setError("Không tải được danh sách tin tức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setError("");
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setError("");
    setForm({
      id: item.id,
      title: item.title || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      cover_image_url: item.cover_image_url || "",
      source_url: item.source_url || "",
      published: !!item.published,
    });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        cover_image_url: form.cover_image_url.trim(),
        source_url: form.source_url.trim(),
        published: form.published,
        ...(!form.id ? { published_at: new Date().toISOString() } : {}),
      };
      if (form.id) {
        await pb.collection("news").update(form.id, payload);
      } else {
        await pb.collection("news").create(payload);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.message || "Không lưu được tin tức. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item) => {
    try {
      await pb.collection("news").update(item.id, { published: !item.published });
      await load();
    } catch {
      setError("Không cập nhật được trạng thái tin tức. Vui lòng thử lại.");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Xóa tin "${item.title}"?`)) return;
    try {
      await pb.collection("news").delete(item.id);
      await load();
    } catch {
      setError("Không xóa được tin tức. Vui lòng thử lại.");
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const result = await pb.send("/api/custom/news-sync", { method: "POST" });
      setSyncMsg(`Đã lấy ${result.fetched} tin, thêm mới ${result.created}, bỏ qua ${result.skipped} tin đã có.`);
      load();
    } catch (err) {
      setSyncMsg(err?.response?.message || err?.message || "Đồng bộ thất bại, vui lòng thử lại sau.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Tin tức</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Đăng tin thủ công hoặc đồng bộ tự động từ trang tin xe điện VinFastAuto.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncNow} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Đồng bộ từ VinFast
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Đăng tin mới
          </Button>
        </div>
      </div>

      {error && !dialogOpen && <p role="alert" className="mt-4 text-sm text-red-600">{error} <button type="button" onClick={load} className="underline">Tải lại</button></p>}
      {syncMsg && (
        <p className="mt-3 rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
          {syncMsg}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Trạng thái</TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-neutral-400">
                  Chưa có tin tức nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-md">
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {new Date(item.created).toLocaleString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#3b5bdb] hover:underline"
                      >
                        {item.source_name || "Nguồn"} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Badge variant="secondary">Tự đăng</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!item.published} onCheckedChange={() => togglePublished(item)} aria-label={`Hiển thị công khai: ${item.title}`} />
                      <span className="text-xs text-neutral-500">
                        {item.published ? "Đã đăng" : "Bản nháp"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Sửa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(item)} aria-label="Xóa">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Chỉnh sửa tin tức" : "Đăng tin mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tiêu đề *</label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tóm tắt</label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nội dung</label>
              <Textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Có thể dùng thẻ HTML cơ bản (p, b, i, a...)"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ảnh bìa (URL)</label>
              <Input
                type="url"
                value={form.cover_image_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Link nguồn (nếu có)</label>
              <Input
                type="url"
                value={form.source_url}
                onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
                placeholder="https://vinfastauto.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
              <span className="text-sm">Hiển thị công khai trên website</span>
            </div>
            <DialogFooter>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
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

export default NewsPage;
