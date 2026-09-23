import { useEffect, useMemo, useState } from "react";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import pb from "@/lib/pocketbaseClient";

const CustomersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

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
    try {
      await pb.collection("contacts").delete(item.id);
      await load();
    } catch {
      setError("Không xóa được khách hàng. Vui lòng thử lại.");
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
        i.model?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Khách hàng đăng ký</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Danh sách khách hàng đã điền form nhận tư vấn / đặt cọc trên website.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            className="pl-8"
            placeholder="Tìm theo tên, SĐT, mẫu xe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error} <button type="button" onClick={load} className="underline">Tải lại</button></p>}
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
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
                    {item.color && <div className="text-xs text-neutral-400">{item.color}</div>}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-neutral-600">
                    {item.message || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                    {new Date(item.created).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove(item)}>
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
