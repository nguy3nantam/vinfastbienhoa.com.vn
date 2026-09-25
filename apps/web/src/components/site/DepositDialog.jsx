import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import pb from "@/lib/pocketbaseClient";
import { useVehicles } from "@/hooks/useVehicles";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Logo from "./Logo";

const SUPPORT_REQUEST_OPTIONS = ["Nhận Ưu Đãi", "Hỗ Trợ Dịch Vụ", "Đăng Ký Lái Thử"];

export const OPEN_DEPOSIT_EVENT = "vf-open-deposit";

export const openDepositDialog = (model) => {
  window.dispatchEvent(new CustomEvent(OPEN_DEPOSIT_EVENT, { detail: { model } }));
};

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[16px] sm:text-sm outline-none transition focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs sm:text-sm font-medium text-neutral-700">{label}</span>
    {children}
  </label>
);

const DepositDialog = () => {
  const { settings } = useSiteSettings();
  const { vehicles } = useVehicles();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", model: "", support: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e) => {
      setForm((f) => ({ ...f, model: e.detail?.model || f.model }));
      setStatus("idle");
      setError("");
      setOpen(true);
    };
    window.addEventListener(OPEN_DEPOSIT_EVENT, handler);
    return () => window.removeEventListener(OPEN_DEPOSIT_EVENT, handler);
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }
    setStatus("loading");
    try {
      await pb.collection("contacts").create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        model: form.model,
        color: form.support,
        message: form.message.trim(),
      });
      setStatus("done");
      setForm({ name: "", phone: "", model: "", support: "", message: "" });
    } catch (err) {
      setStatus("idle");
      setError("Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.");
      console.error("deposit create failed", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setStatus("idle");
      }}
    >
      <DialogContent className="max-w-[92vw] sm:max-w-md rounded-2xl border-none bg-white p-0 shadow-2xl overflow-hidden">
        {status === "done" ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <CheckCircle2 className="h-14 w-14 text-[#3b5bdb]" />
            <h3 className="mt-4 font-display text-xl font-bold text-[#151515]">Cảm ơn bạn!</h3>
            <p className="mt-2 max-w-xs text-xs sm:text-sm text-neutral-600">
              Yêu cầu đặt cọc của bạn đã được gửi. Đội ngũ VinFast Kim Sơn sẽ liên hệ với bạn sớm nhất.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center px-5 py-5 sm:px-7 sm:py-6">
            <div className="mb-2 sm:mb-3 flex justify-center">
              <Logo showText={false} src={settings.logoUrl} className="h-7 w-auto sm:h-8" />
            </div>
            <DialogHeader className="w-full text-center space-y-1">
              <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-[#151515] text-center">
                Đăng Ký Nhận Tư Vấn
              </DialogTitle>
              <DialogDescription className="text-center text-xs sm:text-sm text-neutral-500">
                Quý Khách vui lòng đăng ký để nhận quyền lợi và ưu đãi tốt nhất từ VinFast Kim Sơn.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="mt-4 w-full space-y-3">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Họ và tên *">
                  <input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Nguyễn Văn A"
                    className={inputCls}
                  />
                </Field>
                <Field label="Số điện thoại *">
                  <input
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="09xx xxx xxx"
                    type="tel"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Mẫu xe quan tâm">
                  <select value={form.model} onChange={update("model")} className={inputCls}>
                    <option value="">-- Chọn mẫu xe --</option>
                    {vehicles.map((car) => (
                      <option key={car.id} value={car.name}>
                        {car.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Yêu cầu hỗ trợ">
                  <select value={form.support} onChange={update("support")} className={inputCls}>
                    <option value="">-- Chọn yêu cầu --</option>
                    {SUPPORT_REQUEST_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Lời nhắn">
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  rows={2}
                  placeholder="Nhu cầu của bạn..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {error && <p className="text-center text-xs sm:text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#3b5bdb] px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#2b47b8] disabled:opacity-70 cursor-pointer shadow-sm mt-1"
              >
                {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu đặt cọc"}
              </button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
