import { ArrowRight, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { openDepositDialog } from "./DepositDialog";

const IntroSection = () => {
  const { settings } = useSiteSettings();
  const phoneDial = settings.hotline.replace(/\D/g, "");

  return (
    <section id="lien-he" className="border-y border-neutral-200/80 bg-[#f4f5f7] py-20 text-[#151515] lg:py-28">
      <div className="mx-auto max-w-[72rem] px-5 text-center lg:px-10">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">
          Giới Thiệu
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-[#151515] sm:text-5xl">
          CTY TNHH TM DV Ô TÔ KIM SƠN
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-relaxed text-neutral-600 sm:text-lg">
          <strong className="font-semibold text-[#151515]">VinFast Kim Sơn</strong> tự hào là nhà phân
          phối VinFast lớn nhất miền Nam. Hệ thống <strong className="font-semibold text-[#151515]">VinFast
          Biên Hòa</strong> - <strong className="font-semibold text-[#151515]">VinFast Đồng Nai</strong> đem
          đến trải nghiệm kinh doanh, dịch vụ, chăm sóc khách hàng cùng Showroom, Xưởng Dịch Vụ hiện
          đại. Quý Khách liên hệ hoặc đăng ký để nhận ưu đãi tốt nhất từ VinFast Kim Sơn.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => openDepositDialog()}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#3b5bdb] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#2b47b8]"
          >
            Đăng ký nhận ưu đãi
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href={`tel:${phoneDial}`}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-neutral-300 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#151515] shadow-sm transition hover:border-[#3b5bdb] hover:bg-neutral-50 hover:text-[#3b5bdb]"
          >
            <Phone className="h-4 w-4 text-[#3b5bdb]" />
            {settings.hotline}
          </a>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
