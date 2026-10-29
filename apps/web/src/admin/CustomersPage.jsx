import { useEffect, useMemo, useState } from "react";
import { Car, Clock3, Mail, MessageSquareText, Phone, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";

const CustomersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await pb.collection("contacts").getFullList({ sort: "-created", requestKey: null });
      setItems(list);
    } catch {
      setError("Không tải được danh sách khách hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (item) => {
    if (!window.confirm(`Xóa khách hàng "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await pb.collection("contacts").delete(item.id);
      setItems((current) => current.filter((customer) => customer.id !== item.id));
    } catch {
      setError("Không xóa được khách hàng. Vui lòng thử lại.");
    } finally {
      setDeletingId("");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.phone?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.model?.toLowerCase().includes(q) ||
        i.support?.toLowerCase().includes(q) ||
        i.color?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Khách hàng đăng ký</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Danh sách khách hàng đã điền form nhận tư vấn / đặt cọc trên website.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input
            className="h-10 pl-9"
            placeholder="Tìm theo tên, SĐT, mẫu xe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error} <button type="button" onClick={load} className="underline">Tải lại</button></p>}
      {!loading && (
        <p className="mt-4 text-xs font-medium text-neutral-500">
          Hiển thị {filtered.length} / {items.length} khách hàng
        </p>
      )}

      <div className="mt-4 space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">Không có dữ liệu.</div>
        ) : filtered.map((item) => {
          const support = item.support || item.color;
          const phoneDial = String(item.phone || "").replace(/[^\d+]/g, "");
          return (
            <article key={item.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-neutral-100 p-4">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold text-neutral-900">{item.name || "Khách hàng"}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {new Date(item.created).toLocaleString("vi-VN")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === item.id}
                  onClick={() => remove(item)}
                  className="h-11 w-11 flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Xóa khách hàng ${item.name || "này"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.phone && (
                    <a href={`tel:${phoneDial}`} className="flex min-h-11 items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-[#3154d5]">
                      <Phone className="h-4 w-4" />
                      <span className="break-all">{item.phone}</span>
                    </a>
                  )}
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="min-w-0 break-all">{item.email}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-lg border border-neutral-100 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400"><Car className="h-3.5 w-3.5" /> Mẫu xe</p>
                    <p className="mt-1 break-words text-sm font-medium text-neutral-800">{item.model || "Chưa chọn"}</p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-neutral-100 p-3">
                    <p className="text-xs font-medium text-neutral-400">Yêu cầu</p>
                    <p className="mt-1 break-words text-sm font-medium text-neutral-800">{support || "Chưa có"}</p>
                  </div>
                </div>

                {item.message && (
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400"><MessageSquareText className="h-3.5 w-3.5" /> Lời nhắn</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700">{item.message}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Mẫu xe / Yêu cầu</TableHead>
              <TableHead>Lời nhắn</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-neutral-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-neutral-400">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <a href={`tel:${item.phone}`} className="block text-sm hover:text-[#3b5bdb]">
                      {item.phone}
                    </a>
                    {item.email && <div className="text-xs text-neutral-400">{item.email}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.model || "—"}</div>
                    {(item.support || item.color) && (
                      <div className="text-xs text-neutral-400">{item.support || item.color}</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-neutral-600">
                    {item.message || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                    {new Date(item.created).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled={deletingId === item.id} onClick={() => remove(item)} aria-label={`Xóa khách hàng ${item.name || "này"}`}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomersPage;
