import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  subtitle: "",
  image_url: "",
  link_url: "",
  active: true,
};

const SlidersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await pb.collection("sliders").getFullList({ sort: "order" });
      setItems(list);
    } catch (err) {
      setError(err?.response?.message || err?.message || "Không thể tải danh sách slider.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title || "",
      subtitle: item.subtitle || "",
      image_url: item.image_url || "",
      link_url: item.link_url || "",
      active: !!item.active,
    });
    setImageFile(null);
    setError("");
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!imageFile && !form.image_url.trim() && !form.id) {
      setError("Vui lòng tải ảnh lên hoặc nhập link ảnh.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("subtitle", form.subtitle.trim());
      formData.append("image_url", form.image_url.trim());
      formData.append("link_url", form.link_url.trim());
      formData.append("active", form.active ? "true" : "false");
      if (imageFile) formData.append("image", imageFile);

      if (form.id) {
        await pb.collection("sliders").update(form.id, formData);
      } else {
        const maxOrder = items.reduce((m, it) => Math.max(m, it.order || 0), -1);
        formData.append("order", String(maxOrder + 1));
        await pb.collection("sliders").create(formData);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setError("");
    try {
      await pb.collection("sliders").update(item.id, { active: !item.active });
      await load();
    } catch (err) {
      setError(err?.response?.message || err?.message || "Không thể cập nhật trạng thái slider.");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Xóa slide "${item.title || "này"}"?`)) return;
    try {
      await pb.collection("sliders").delete(item.id);
      await load();
    } catch (err) {
      setError(err?.response?.message || err?.message || "Không thể xóa slider.");
    }
  };

  const move = async (item, dir) => {
    const idx = items.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    setError("");
    try {
      await Promise.all([
        pb.collection("sliders").update(item.id, { order: other.order ?? swapIdx }),
        pb.collection("sliders").update(other.id, { order: item.order ?? idx }),
      ]);
      await load();
    } catch (err) {
      setError(err?.response?.message || err?.message || "Không thể đổi thứ tự slider.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Slider trang chủ</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Quản lý các ảnh banner trình chiếu ở đầu trang chủ.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm slide
        </Button>
      </div>

      {error && !dialogOpen && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-neutral-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-neutral-400">
                  Chưa có slide nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => {
                const img = item.image ? pb.files.getURL(item, item.image) : item.image_url;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {img && (
                        <img src={img} alt="" className="h-12 w-20 rounded object-cover" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.title || "—"}</div>
                      {item.subtitle && (
                        <div className="text-xs text-neutral-400">{item.subtitle}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={idx === 0} onClick={() => move(item, -1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === items.length - 1}
                          onClick={() => move(item, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!item.active}
                          onCheckedChange={() => toggleActive(item)}
                          aria-label={`Hiển thị: ${item.title || "slide"}`}
                        />
                        <span className="text-xs text-neutral-500">
                          {item.active ? "Đang hiện" : "Đã ẩn"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Chỉnh sửa slider">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(item)} aria-label="Xóa slider">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Chỉnh sửa slide" : "Thêm slide mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ảnh tải lên</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Hoặc link ảnh (URL)</label>
              <Input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tiêu đề (tùy chọn)</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mô tả phụ (tùy chọn)</label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Link khi bấm vào (tùy chọn)</label>
              <Input
                type="url"
                value={form.link_url}
                onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <span className="text-sm">Hiển thị trên trang chủ</span>
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

export default SlidersPage;
