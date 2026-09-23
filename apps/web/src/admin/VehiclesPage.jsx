import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";
import { invalidateVehiclesCache } from "@/hooks/useVehicles";

const CATEGORY_LABEL = { electric: "Xe điện", service: "Xe dịch vụ" };

const EMPTY_FORM = {
  id: "",
  slug: "",
  name: "",
  category: "electric",
  tagline: "",
  price: "",
  image_url: "",
  color: "",
  specs: [{ label: "", value: "" }],
  active: true,
};

const VehiclesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setListError("");
    try {
      const list = await pb.collection("vehicles").getFullList({ sort: "category,order" });
      setItems(list);
    } catch (err) {
      setListError(err?.response?.message || "Không tải được danh sách xe. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, specs: [{ label: "", value: "" }] });
    setImageFile(null);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      slug: item.slug || "",
      name: item.name || "",
      category: item.category || "electric",
      tagline: item.tagline || "",
      price: item.price || "",
      image_url: item.image_url || "",
      color: item.color || "",
      specs: item.specs?.length ? item.specs : [{ label: "", value: "" }],
      active: item.active !== false,
    });
    setImageFile(null);
    setError("");
    setDialogOpen(true);
  };

  const updateSpec = (idx, key, value) => {
    setForm((f) => {
      const specs = [...f.specs];
      specs[idx] = { ...specs[idx], [key]: value };
      return { ...f, specs };
    });
  };

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));
  const removeSpec = (idx) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== idx) }));

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.slug.trim() || !form.name.trim()) {
      setError("Vui lòng nhập mã xe (slug) và tên xe.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      setError("Mã xe chỉ gồm chữ thường, số và dấu gạch ngang.");
      return;
    }
    if (!imageFile && !form.image_url.trim() && !form.id) {
      setError("Vui lòng tải ảnh lên hoặc nhập link ảnh.");
      return;
    }
    setSaving(true);
    try {
      const cleanSpecs = form.specs
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value);
      const formData = new FormData();
      formData.append("slug", form.slug.trim());
      formData.append("name", form.name.trim());
      formData.append("category", form.category);
      formData.append("tagline", form.tagline.trim());
      formData.append("price", form.price.trim());
      formData.append("image_url", form.image_url.trim());
      formData.append("color", form.color.trim());
      formData.append("specs", JSON.stringify(cleanSpecs));
      formData.append("active", form.active ? "true" : "false");
      if (imageFile) formData.append("image", imageFile);

      if (form.id) {
        await pb.collection("vehicles").update(form.id, formData);
      } else {
        const sameCategory = items.filter((it) => it.category === form.category);
        const maxOrder = sameCategory.reduce((m, it) => Math.max(m, it.order || 0), -1);
        formData.append("order", String(maxOrder + 1));
        await pb.collection("vehicles").create(formData);
      }
      setDialogOpen(false);
      invalidateVehiclesCache();
      await load();
    } catch (err) {
      setError(err?.response?.message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (item, action) => {
    if (busyId) return;
    setBusyId(item.id);
    setListError("");
    try {
      await action();
      invalidateVehiclesCache();
      await load();
    } catch (err) {
      setListError(err?.response?.message || "Không thực hiện được thao tác. Vui lòng thử lại.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (item) => runAction(item, () =>
    pb.collection("vehicles").update(item.id, { active: !item.active })
  );

  const remove = async (item) => {
    if (!window.confirm(`Xóa xe "${item.name}"?`)) return;
    await runAction(item, () => pb.collection("vehicles").delete(item.id));
  };

  const move = async (item, dir) => {
    const sameCategory = items.filter((it) => it.category === item.category);
    const idx = sameCategory.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sameCategory.length) return;
    const other = sameCategory[swapIdx];
    await runAction(item, () => Promise.all([
      pb.collection("vehicles").update(item.id, { order: other.order ?? swapIdx }),
      pb.collection("vehicles").update(other.id, { order: item.order ?? idx }),
    ]));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Quản lý xe</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Danh sách xe hiển thị trên trang chủ và trang chi tiết sản phẩm.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm xe
        </Button>
      </div>

      {listError && (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{listError}</span>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            Tải lại
          </Button>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên xe</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-neutral-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-neutral-400">
                  Chưa có xe nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const img = item.image ? pb.files.getURL(item, item.image) : item.image_url;
                const sameCategory = items.filter((it) => it.category === item.category);
                const idx = sameCategory.findIndex((i) => i.id === item.id);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {img && (
                        <img src={img} alt="" className="h-12 w-20 rounded object-contain bg-neutral-50" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{CATEGORY_LABEL[item.category] || item.category}</span>
                    </TableCell>
                    <TableCell className="text-sm">{item.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Đưa ${item.name} lên`} disabled={!!busyId || idx === 0} onClick={() => move(item, -1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Đưa ${item.name} xuống`}
                          disabled={!!busyId || idx === sameCategory.length - 1}
                          onClick={() => move(item, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.active !== false}
                          onCheckedChange={() => toggleActive(item)}
                          disabled={!!busyId}
                          aria-label={`${item.active !== false ? "Ẩn" : "Hiện"} ${item.name}`}
                        />
                        <span className="text-xs text-neutral-500">
                          {item.active !== false ? "Đang hiện" : "Đã ẩn"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label={`Sửa ${item.name}`} disabled={!!busyId} onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Xóa ${item.name}`} disabled={!!busyId} onClick={() => remove(item)}>
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Chỉnh sửa xe" : "Thêm xe mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mã xe (slug) *</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().trim() }))}
                  placeholder="vf2"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Danh mục</label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electric">Xe điện</SelectItem>
                    <SelectItem value="service">Xe dịch vụ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Tên xe *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VinFast VF 2"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Mô tả ngắn</label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Giá (VNĐ)</label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="188.000.000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Màu</label>
                <Input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="Trắng"
                />
              </div>
            </div>

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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Thông số kỹ thuật</label>
                <Button type="button" variant="ghost" size="sm" onClick={addSpec}>
                  <Plus className="h-3.5 w-3.5" />
                  Thêm dòng
                </Button>
              </div>
              <div className="space-y-2">
                {form.specs.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={s.label}
                      onChange={(e) => updateSpec(idx, "label", e.target.value)}
                      placeholder="Quãng đường / lần sạc"
                      className="flex-1"
                    />
                    <Input
                      value={s.value}
                      onChange={(e) => updateSpec(idx, "value", e.target.value)}
                      placeholder="180 km"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <span className="text-sm">Hiển thị trên website</span>
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

export default VehiclesPage;
