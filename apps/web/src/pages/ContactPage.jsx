import { useState } from "react";
import { MapPin, Phone, Mail, CheckCircle2, Loader2, Building2 } from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import { MODEL_OPTIONS, COLOR_OPTIONS, CONTACT, LOCATIONS } from "@/data/cars";
import Seo from "@/components/site/Seo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import aboutHeroImage from "@/assets/about-hero.jpg";

const HERO_IMAGE = aboutHeroImage;

const inputCls =
  "w-full rounded-sm border border-neutral-300 bg-white px-3 py-2.5 sm:px-4 sm:py-3 text-[16px] sm:text-sm outline-none transition focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">{label}</span>
    {children}
  </label>
);

const ContactPage = () => {
  const { settings } = useSiteSettings();
  const kdDial = settings.hotline_kd.replace(/\D/g, "");
  const dvDial = settings.hotline_dv.replace(/\D/g, "");
  const [form, setForm] = useState({ name: "", phone: "", model: "", color: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

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
        color: form.color,
        message: form.message.trim(),
      });
      setStatus("done");
      setForm({ name: "", phone: "", model: "", color: "", message: "" });
    } catch (err) {
      setStatus("idle");
      setError("Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.");
      console.error("contact create failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Liên Hệ"
        description={`Liên hệ VinFast Kim Sơn - 10 showroom &amp; xưởng dịch vụ tại Biên Hòa, Đồng Nai, TP.HCM. Hotline KD ${settings.hotline_kd} - DV ${settings.hotline_dv}. Nhận báo giá và lịch lái thử.`}
        keywords="liên hệ vinfast kim sơn, hotline vinfast biên hòa, showroom vinfast đồng nai, đăng ký lái thử vinfast"
        path="/lien-he"
        breadcrumb={[{ name: "Liên hệ", path: "/lien-he" }]}
      />
      <Header />

      {/* Hero header image */}
      <section className="relative flex min-h-[70dvh] items-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Showroom VinFast Kim Sơn"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-[90rem] px-5 pb-14 pt-32 text-white sm:pb-20 lg:px-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8aa4e8] sm:text-sm">
            Liên hệ với VinFast Kim Sơn
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            CTY TNHH TM DV Ô TÔ KIM SƠN
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            Tự hào là nhà phân phối VinFast lớn nhất Miền Nam, với hơn 10 cơ sở Showroom, Xưởng Dịch Vụ
            hiện đại, sẵn sàng đồng hành cùng bạn trên mọi hành trình xe điện.
          </p>
        </div>
      </section>

      {/* Intro strip */}
      <section className="border-b border-neutral-200 bg-[#f6f7f9] py-10">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 sm:grid-cols-3 lg:px-10">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#3b5bdb]" />
            <div>
              <p className="font-display text-2xl font-bold text-[#151515]">10+</p>
              <p className="text-sm text-neutral-600">Showroom &amp; Xưởng Dịch Vụ</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#3b5bdb]" />
            <div>
              <p className="font-display text-2xl font-bold text-[#151515]">{settings.hotline_kd}</p>
              <p className="text-sm text-neutral-600">Hotline kinh doanh</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#3b5bdb]" />
            <div>
              <p className="font-display text-lg font-bold text-[#151515] sm:text-2xl">{CONTACT.email}</p>
              <p className="text-sm text-neutral-600">Email hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 locations */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">
            Hệ thống cơ sở
          </span>
          <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-snug text-[#151515] sm:text-4xl">
            10 Showroom &amp; Xưởng Dịch Vụ trải rộng khắp Đồng Nai và TP.HCM
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((loc) => (
              <div
                key={loc.name}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-[#3b5bdb]/40 hover:shadow-md"
              >
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#3b5bdb]" />
                <div>
                  <p className="text-sm font-semibold text-[#151515]">{loc.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{loc.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="uu-dai" className="bg-[#0d0d0f] py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 lg:grid-cols-2 lg:px-10">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8aa4e8]">
              Nhận ưu đãi tốt nhất
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
              Đăng ký ngay hôm nay
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              Điền thông tin bên dưới để nhận báo giá, chương trình ưu đãi mới nhất và lịch lái thử tại
              showroom gần bạn nhất.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={`tel:${kdDial}`}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b5bdb]">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-white/50">Hotline KD</span>
                  <span className="font-display text-lg font-semibold">{settings.hotline_kd}</span>
                </span>
              </a>
              <a
                href={`tel:${dvDial}`}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-white/50">Hotline DV</span>
                  <span className="font-display text-lg font-semibold">{settings.hotline_dv}</span>
                </span>
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="font-medium">{CONTACT.email}</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-7 text-[#151515] sm:p-9">
            {status === "done" ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-[#3b5bdb]" />
                <h3 className="mt-5 font-display text-2xl font-bold">Cảm ơn bạn!</h3>
                <p className="mt-3 max-w-xs text-neutral-600">
                  Yêu cầu đã được gửi. Đội ngũ VinFast Kim Sơn sẽ liên hệ với bạn trong thời gian sớm nhất.
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
                      {MODEL_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          VinFast {m}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Màu sắc">
                    <select value={form.color} onChange={update("color")} className={inputCls}>
                      <option value="">-- Chọn màu sắc --</option>
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
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
                  {status === "loading" ? "Đang gửi..." : "Nhận ưu đãi ngay"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default ContactPage;
