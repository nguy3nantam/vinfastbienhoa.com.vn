import { useEffect, useState } from "react";
import { Phone, Mail, CheckCircle2, Loader2 } from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import { useVehicles } from "@/hooks/useVehicles";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ZaloIcon, MessengerIcon } from "./icons";

const SUPPORT_REQUEST_OPTIONS = ["Nhận Ưu Đãi", "Hỗ Trợ Dịch Vụ", "Đăng Ký Lái Thử"];

const ContactSection = ({ selectedModel }) => {
  const { settings } = useSiteSettings();
  const { vehicles } = useVehicles();
  const phoneDial = settings.hotline.replace(/\D/g, "");
  const [form, setForm] = useState({ name: "", phone: "", model: "", support: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedModel) setForm((f) => ({ ...f, model: selectedModel }));
  }, [selectedModel]);

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
      console.error("contact create failed", err);
    }
  };

  return (
    <section id="lien-he" className="bg-[#0d0d0f] py-20 text-white lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 lg:grid-cols-2 lg:px-10">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8aa4e8]">
            Liên hệ với chúng tôi
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
            Đăng ký lái thử &amp; nhận tư vấn
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            Để lại thông tin, đội ngũ tư vấn VinFast sẽ liên hệ trong thời gian sớm nhất. Hoặc kết nối
            ngay qua các kênh dưới đây.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href={`tel:${phoneDial}`}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b5bdb]">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wide text-white/50">Hotline</span>
                <span className="font-display text-lg font-semibold">{settings.hotline}</span>
              </span>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={settings.zalo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <ZaloIcon className="h-8 w-8 text-[#0068ff]" />
                <span className="text-sm font-semibold">Chat Zalo</span>
              </a>
              <a
                href={settings.messenger}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <MessengerIcon className="h-8 w-8 text-[#0084ff]" />
                <span className="text-sm font-semibold">Messenger</span>
              </a>
            </div>

            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <Mail className="h-5 w-5" />
              </span>
              <span className="font-medium">{settings.email}</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-7 text-[#151515] sm:p-9">
          {status === "done" ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-[#3b5bdb]" />
              <h3 className="mt-5 font-display text-2xl font-bold">Cảm ơn bạn!</h3>
              <p className="mt-3 max-w-xs text-neutral-600">
                Yêu cầu đã được gửi. Đội ngũ VinFast sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-sm border border-neutral-300 px-6 py-2.5 text-sm font-semibold transition hover:border-[#3b5bdb] hover:text-[#3b5bdb]"
              >
                Gửi yêu cầu khác
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
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
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
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
                  rows={3}
                  placeholder="Nhu cầu của bạn..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#3b5bdb] px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#2b47b8] disabled:opacity-70"
              >
                {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const inputCls =
  "w-full rounded-sm border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">{label}</span>
    {children}
  </label>
);

export default ContactSection;
