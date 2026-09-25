import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Phone,
  Mail,
  Gauge,
  Zap,
  Timer,
  Users,
  Ruler,
  BatteryCharging,
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import pb from "@/lib/pocketbaseClient";
import { vf3Detail, COLOR_HEX, ELECTRIC_FEATURES, SERVICE_FEATURES } from "@/data/cars";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useVehicles } from "@/hooks/useVehicles";
import { ZaloIcon, MessengerIcon } from "@/components/site/icons";
import Seo from "@/components/site/Seo";

const SPEC_ICONS = [Zap, Gauge, Timer, Users, Ruler, BatteryCharging];

const inputCls =
  "w-full rounded-sm border border-neutral-300 bg-white px-3 py-2.5 sm:px-4 sm:py-3 text-[16px] sm:text-sm outline-none transition focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">{label}</span>
    {children}
  </label>
);

const buildDetail = (car, electricCars) => {
  if (!car) return null;
  if (car.id === "vf3") {
    return {
      ...vf3Detail,
      ...car,
      name: car.name.replace(/^VinFast\s*/i, ""),
      heroImage: car.image || vf3Detail.heroImage,
      colors: vf3Detail.colors,
      gallery: [...new Set([car.image || vf3Detail.heroImage, ...vf3Detail.gallery])],
    };
  }

  const isElectric = electricCars.some((c) => c.id === car.id);
  const baseHex = COLOR_HEX[car.color] || "#8b8d90";
  const extraColors = ["Trắng", "Đen", "Đỏ"]
    .filter((name) => name !== car.color)
    .slice(0, 2)
    .map((name) => ({ name, hex: COLOR_HEX[name] }));

  return {
    id: car.id,
    name: car.name.replace(/^VinFast\s*/i, ""),
    tagline: car.tagline || "Mẫu xe VinFast — vận hành mạnh mẽ, bền bỉ, hiện đại.",
    price: car.price,
    heroImage: car.image,
    gallery: [car.image],
    specs: car.specs,
    features: isElectric ? ELECTRIC_FEATURES : SERVICE_FEATURES,
    colors: [{ name: car.color, hex: baseHex }, ...extraColors],
  };
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { vehicles, electricCars, loading: vehiclesLoading } = useVehicles();
  const car = useMemo(() => vehicles.find((c) => c.id === id), [vehicles, id]);
  const detail = useMemo(() => buildDetail(car, electricCars), [car, electricCars]);
  const { settings } = useSiteSettings();
  const phoneDial = settings.hotline.replace(/\D/g, "");

  const [activeImage, setActiveImage] = useState(detail?.heroImage);
  const [selectedColor, setSelectedColor] = useState(detail?.colors?.[0]?.name || "");
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!detail) return;
    setActiveImage(detail.heroImage);
    setSelectedColor(detail.colors?.[0]?.name || "");
  }, [detail]);

  if (!detail && vehiclesLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b5bdb]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
          <h1 className="font-display text-2xl font-bold">Không tìm thấy mẫu xe</h1>
          <p className="mt-3 max-w-sm text-neutral-600">
            Sản phẩm bạn tìm không tồn tại hoặc đã được cập nhật. Vui lòng quay lại danh sách xe.
          </p>
          <Link
            to="/#dong-xe"
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#3b5bdb] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#2b47b8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách xe
          </Link>
        </main>
        <Footer />
        <FloatingContact />
      </div>
    );
  }

  const priceNumber = (car?.price || "").replace(/\D/g, "");
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    image: car.image,
    description: `${car.name} - ${car.tagline || ""} Báo giá và ưu đãi xe VinFast tại VinFast Kim Sơn, nhà phân phối lớn nhất miền Nam.`,
    brand: { "@type": "Brand", name: "VinFast" },
    sku: car.id,
    offers: {
      "@type": "Offer",
      price: priceNumber,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: "VinFast Kim Sơn" },
    },
  };

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
        model: detail.name,
        color: selectedColor,
        message: form.message.trim(),
      });
      setStatus("done");
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      setStatus("idle");
      setError("Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.");
      console.error("contact create failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={car.name}
        description={`${car.name} ${car.tagline || ""} Báo giá ${car.price}đ tại VinFast Kim Sơn - VinFast Biên Hòa, Đồng Nai. Ưu đãi tốt nhất, lái thử miễn phí. Hotline ${settings.hotline}.`}
        keywords={`giá xe ${car.name}, ${car.name} biên hòa, ${car.name} đồng nai, mua ${car.name} trả góp, ${car.name} vinfast`}
        path={`/xe/${car.id}`}
        image={car.image}
        type="product"
        schema={productSchema}
        breadcrumb={[{ name: car.name, path: `/xe/${car.id}` }]}
      />
      <Header />
      <main className="pt-[72px]">
        {/* Breadcrumb / back */}
        <div className="border-b border-neutral-100 bg-[#f6f7f9]">
          <div className="mx-auto flex max-w-[90rem] items-center px-5 py-4 lg:px-10">
            <Link
              to="/#dong-xe"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-[#3b5bdb]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách xe
            </Link>
          </div>
        </div>

        {/* Hero / gallery + summary */}
        <section className="mx-auto max-w-[90rem] px-5 py-14 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-lg bg-[#f6f7f9] p-8">
                <img
                  src={activeImage}
                  alt={`VinFast ${detail.name}`}
                  className="w-full object-contain transition-opacity duration-300"
                />
              </div>
              {detail.gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {detail.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`overflow-hidden rounded-md border-2 bg-[#f6f7f9] p-2 transition-colors ${activeImage === img ? "border-[#3b5bdb]" : "border-transparent"
                        }`}
                    >
                      <img src={img} alt={`${detail.name} ${idx + 1}`} className="aspect-square w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">
                VinFast
              </span>
              <h1 className="mt-3 font-display text-4xl font-extrabold italic tracking-tight sm:text-5xl">
                {detail.name}
              </h1>
              <p className="mt-3 text-lg text-neutral-600">{detail.tagline}</p>

              <div className="mt-6">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Giá từ</span>
                <div className="mt-1 font-display text-3xl font-bold text-[#151515]">
                  {detail.price} <span className="text-lg font-medium text-neutral-500">VNĐ</span>
                </div>
              </div>

              {/* Color options */}
              <div className="mt-8">
                <span className="text-sm font-semibold text-neutral-700">Màu sắc: {selectedColor}</span>
                <div className="mt-3 flex flex-wrap gap-3">
                  {detail.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${selectedColor === c.name
                          ? "border-[#3b5bdb] scale-110"
                          : "border-neutral-200 hover:border-neutral-400"
                        }`}
                    >
                      <span
                        className="h-8 w-8 rounded-full border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick specs */}
              <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {detail.specs.slice(0, 6).map((s, idx) => {
                  const Icon = SPEC_ICONS[idx % SPEC_ICONS.length];
                  return (
                    <div
                      key={s.label}
                      className="rounded-lg border border-neutral-100 bg-[#f6f7f9] p-4"
                    >
                      <Icon className="h-5 w-5 text-[#3b5bdb]" strokeWidth={1.75} />
                      <div className="mt-2 text-sm font-semibold text-[#151515]">{s.value}</div>
                      <div className="mt-0.5 text-xs text-neutral-500">{s.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#dat-hang"
                  className="rounded-sm bg-[#3b5bdb] px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#2b47b8]"
                >
                  Đặt hàng ngay
                </a>
                <a
                  href={`tel:${phoneDial}`}
                  className="inline-flex items-center gap-2 rounded-sm border border-neutral-300 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-[#3b5bdb] hover:text-[#3b5bdb]"
                >
                  <Phone className="h-4 w-4" />
                  Gọi tư vấn
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Full specs table */}
        <section className="border-t border-neutral-100 bg-[#f6f7f9] py-16 lg:py-20">
          <div className="mx-auto max-w-[72rem] px-5 lg:px-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">
              Thông số kỹ thuật
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Chi tiết kỹ thuật {detail.name}
            </h2>

            <div className="mt-10 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {detail.specs.map((s, idx) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-between px-6 py-4 ${idx % 2 === 0 ? "bg-white" : "bg-[#f6f7f9]/60"
                    }`}
                >
                  <span className="text-sm text-neutral-600">{s.label}</span>
                  <span className="text-sm font-semibold text-[#151515]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / advantages */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-[72rem] px-5 lg:px-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">
              Tính năng &amp; ưu điểm
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Vì sao chọn {detail.name}?
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {detail.features.map((f, idx) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-neutral-100 bg-[#f6f7f9] p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="font-display text-3xl font-extrabold text-[#3b5bdb]/25">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-[#151515]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Order / contact form */}
        <section id="dat-hang" className="bg-[#0d0d0f] py-20 text-white lg:py-28">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-5 lg:grid-cols-2 lg:px-10">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8aa4e8]">
                Đặt hàng {detail.name}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
                Sẵn sàng sở hữu {detail.name}?
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
                Điền thông tin để đặt cọc hoặc nhận tư vấn chi tiết về {detail.name}. Đội ngũ VinFast
                Kim Sơn sẽ liên hệ trong thời gian sớm nhất.
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
                    Yêu cầu đặt hàng {detail.name} đã được gửi. Đội ngũ VinFast sẽ liên hệ với bạn sớm nhất.
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
                  <div className="rounded-md bg-[#f6f7f9] px-4 py-3 text-sm text-neutral-600">
                    Đang đặt hàng:{" "}
                    <span className="font-semibold text-[#151515]">VinFast {detail.name}</span> — Màu{" "}
                    <span className="font-semibold text-[#151515]">{selectedColor}</span>
                  </div>
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
                    {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu đặt hàng"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Bottom back link */}
        <div className="border-t border-neutral-100 bg-white py-8">
          <div className="mx-auto flex max-w-[90rem] justify-center px-5 lg:px-10">
            <Link
              to="/#dong-xe"
              className="inline-flex items-center gap-2 rounded-sm border border-neutral-300 px-7 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-[#3b5bdb] hover:text-[#3b5bdb]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách xe
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default ProductDetailPage;
