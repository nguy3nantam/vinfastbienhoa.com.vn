import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Sparkles, HeartHandshake, Phone, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import { CONTACT, LOCATIONS } from "@/data/cars";
import Seo from "@/components/site/Seo";
import { openDepositDialog } from "@/components/site/DepositDialog";
import aboutHeroImage from "@/assets/about-hero.jpg";

const CORE_VALUES = [
  {
    icon: HeartHandshake,
    title: "Tận tâm",
    desc: "Luôn đặt lợi ích và sự hài lòng của khách hàng lên hàng đầu.",
  },
  {
    icon: ShieldCheck,
    title: "Chuyên nghiệp",
    desc: "Tư vấn chính xác, minh bạch và hỗ trợ nhanh chóng.",
  },
  {
    icon: Sparkles,
    title: "Uy tín",
    desc: "Cung cấp thông tin rõ ràng, chính sách minh bạch và đồng hành lâu dài.",
  },
  {
    icon: Leaf,
    title: "Đổi mới",
    desc: "Cập nhật liên tục các sản phẩm, công nghệ và chính sách mới nhất từ VinFast.",
  },
];

const PRODUCTS = [
  "VinFast VF 3",
  "VinFast VF 5",
  "VinFast VF 6",
  "VinFast VF 7",
  "VinFast VF 8",
  "VinFast VF 9",
  "VinFast Limo Green",
  "Các dòng xe Green phục vụ cá nhân và kinh doanh",
];

const SERVICES = [
  "Tư vấn mua xe phù hợp với nhu cầu sử dụng.",
  "Hỗ trợ vay trả góp với thủ tục nhanh chóng.",
  "Báo giá và cập nhật chương trình ưu đãi mới nhất.",
  "Hỗ trợ đăng ký, đăng kiểm và giao xe tận nơi.",
  "Đăng ký lái thử miễn phí.",
  "Tư vấn đổi xe cũ lên xe VinFast.",
  "Hỗ trợ kết nối dịch vụ bảo dưỡng, bảo hành theo chính sách của VinFast.",
];

const COMMITMENTS = [
  "Sản phẩm chính hãng từ VinFast.",
  "Chính sách bán hàng minh bạch.",
  "Báo giá nhanh và chính xác.",
  "Hỗ trợ khách hàng trước, trong và sau khi mua xe.",
  "Luôn cập nhật những chương trình ưu đãi mới nhất giúp khách hàng tối ưu chi phí sở hữu xe.",
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Giới Thiệu"
        description="VinFast Kim Sơn - nhà phân phối xe điện VinFast lớn nhất miền Nam, hệ thống 10 showroom &amp; xưởng dịch vụ tại Biên Hòa, Đồng Nai, TP.HCM. Tầm nhìn, sứ mệnh, giá trị cốt lõi."
        keywords="giới thiệu vinfast kim sơn, nhà phân phối vinfast biên hòa, showroom vinfast đồng nai, đại lý vinfast uy tín"
        path="/gioi-thieu"
        type="article"
        breadcrumb={[{ name: "Giới thiệu", path: "/gioi-thieu" }]}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-neutral-900">
          <img
            src={aboutHeroImage}
            alt="Showroom VinFast Biên Hòa"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          <div className="relative z-10 mx-auto w-full max-w-[72rem] px-5 pb-14 pt-40 lg:px-10">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Quay lại trang chủ
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7c94ff]">Giới thiệu</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              VinFast Biên Hòa
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">
              Chào mừng Quý khách đến với VinFast Biên Hòa
            </p>
          </div>
        </section>

        {/* Welcome text */}
        <section className="mx-auto max-w-[56rem] px-5 py-16 lg:px-0">
          <div className="space-y-5 text-[15px] leading-7 text-neutral-700">
            <p>
              <span className="font-semibold text-[#151515]">VinFast Biên Hòa</span> là đơn vị phân phối và tư vấn các
              dòng ô tô điện VinFast tại khu vực Biên Hòa, Đồng Nai. Với đội ngũ tư vấn chuyên nghiệp, tận tâm và giàu
              kinh nghiệm, chúng tôi luôn mang đến cho khách hàng những giải pháp di chuyển xanh, thông minh và tiết
              kiệm chi phí vận hành.
            </p>
            <p>
              Không chỉ cung cấp sản phẩm chính hãng, VinFast Biên Hòa còn đồng hành cùng khách hàng trong suốt quá
              trình sở hữu xe, từ tư vấn lựa chọn sản phẩm, hỗ trợ thủ tục mua xe, vay trả góp, đăng ký – đăng kiểm
              đến dịch vụ hậu mãi và chăm sóc khách hàng.
            </p>
          </div>
        </section>

        {/* Mission / Vision split with image */}
        <section className="mx-auto grid max-w-[72rem] gap-10 px-5 py-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div className="overflow-hidden rounded-md">
            <img
              src="https://images.hostinger.com/cb512838-e9ef-4a5e-861c-1cfb47a3caf1.png"
              alt="Đội ngũ tư vấn VinFast Biên Hòa"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-10">
            <div>
              <h2 className="font-display text-xl font-bold text-[#151515] sm:text-2xl">Sứ mệnh</h2>
              <div className="mt-2 h-1 w-10 rounded-full bg-[#3b5bdb]" />
              <p className="mt-4 text-[15px] leading-7 text-neutral-700">
                Mang đến cho khách hàng những sản phẩm ô tô điện VinFast chất lượng cao cùng dịch vụ chuyên nghiệp,
                góp phần thúc đẩy xu hướng giao thông xanh, hiện đại và bền vững tại Việt Nam.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#151515] sm:text-2xl">Tầm nhìn</h2>
              <div className="mt-2 h-1 w-10 rounded-full bg-[#3b5bdb]" />
              <p className="mt-4 text-[15px] leading-7 text-neutral-700">
                Trở thành một trong những đơn vị tư vấn và phân phối ô tô điện VinFast được khách hàng tin tưởng lựa
                chọn hàng đầu tại Đồng Nai, không ngừng nâng cao chất lượng dịch vụ và trải nghiệm khách hàng.
              </p>
            </div>
          </div>
        </section>

        {/* Core values */}
        <section className="bg-[#f6f7f9] py-20">
          <div className="mx-auto max-w-[72rem] px-5 lg:px-10">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Điều làm nên chúng tôi</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">Giá trị cốt lõi</h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CORE_VALUES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 rounded-md border border-black/5 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b5bdb]/10 text-[#3b5bdb]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#151515]">{title}</h3>
                  <p className="text-sm leading-6 text-neutral-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products & services */}
        <section className="mx-auto max-w-[72rem] px-5 py-20 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Sản phẩm</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
                Sản phẩm và dịch vụ
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                VinFast Biên Hòa cung cấp đầy đủ các dòng xe điện VinFast đang phân phối trên thị trường:
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-y-2.5 text-sm text-neutral-700">
                {PRODUCTS.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3b5bdb]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Đồng hành</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">Dịch vụ đi kèm</h2>
              <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
                {SERVICES.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3b5bdb]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Commitment with image */}
        <section className="mx-auto grid max-w-[72rem] gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Cam kết</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
              Cam kết với khách hàng
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">VinFast Biên Hòa cam kết mang đến:</p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
              {COMMITMENTS.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3b5bdb]" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 overflow-hidden rounded-md">
            <img
              src={aboutHeroImage}
              alt="Showroom VinFast Kim Sơn"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* Showroom locations */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-[72rem] px-5 lg:px-10">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Hệ thống cơ sở</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
                10 Showroom & Xưởng Dịch Vụ trải rộng khắp Đồng Nai và TP.HCM
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LOCATIONS.map((location) => {
                const mapQuery = encodeURIComponent(`${location.name}, ${location.address}`);
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
                return (
                  <a
                    key={location.name}
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3 rounded-md bg-[#3b5bdb] p-6 text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-[#3451c7] hover:shadow-md cursor-pointer"
                    title={`Xem chỉ đường đến ${location.name} trên Google Maps`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-white transition-transform group-hover:scale-110" strokeWidth={2} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-sm font-bold text-white">{location.name}</h3>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="mt-1 text-xs leading-5 text-white/85">{location.address}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Green future closing */}
        <section className="relative overflow-hidden bg-neutral-900 py-24">
          <img
            src={aboutHeroImage}
            alt="Đội xe điện VinFast Biên Hòa"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative z-10 mx-auto max-w-[48rem] px-5 text-center lg:px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7c94ff]">Đồng hành cùng tương lai xanh</p>
            <p className="mt-6 text-base leading-8 text-white/90 sm:text-lg">
              Chúng tôi tin rằng xe điện không chỉ là phương tiện di chuyển mà còn là xu hướng của tương lai. VinFast
              Biên Hòa mong muốn đồng hành cùng Quý khách trên hành trình xây dựng một cuộc sống hiện đại, thông minh
              và thân thiện với môi trường.
            </p>
            <p className="mt-6 text-sm leading-7 text-white/70">
              Xin chân thành cảm ơn Quý khách đã tin tưởng và lựa chọn VinFast Biên Hòa. Chúng tôi luôn sẵn sàng
              phục vụ và mang đến những trải nghiệm tốt nhất.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => openDepositDialog()}
                className="rounded-sm bg-[#3b5bdb] px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#2b47b8]"
              >
                Liên hệ tư vấn
              </button>
              <a
                href={`tel:${CONTACT.phoneDial}`}
                className="flex items-center gap-2 rounded-sm border border-white/30 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-neutral-900"
              >
                <Phone className="h-4 w-4" strokeWidth={2} />
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default AboutPage;
