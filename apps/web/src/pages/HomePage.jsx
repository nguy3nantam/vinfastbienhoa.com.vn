import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import VehicleGrid from "@/components/site/VehicleGrid";
import IntroSection from "@/components/site/IntroSection";
import NewsCarouselSection from "@/components/site/NewsCarouselSection";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import Seo from "@/components/site/Seo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const HomePage = () => {
  const location = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="VinFast Kim Sơn - Đại Lý Xe Điện VinFast Chính Hãng Biên Hòa"
        description={`VinFast Kim Sơn - Nhà phân phối VinFast lớn nhất miền Nam. Báo giá xe điện VF3, VF5, VF6, VF7, VF8, VF9, Wild, ưu đãi tốt nhất, lái thử miễn phí tại Biên Hòa, Đồng Nai. Hotline ${settings.hotline}.`}
        keywords="vinfast kim sơn, vinfast biên hòa, vinfast đồng nai, giá xe vinfast, xe điện vinfast, vf3, vf5, vf6, vf7, vf8, vf9, vinfast wild, đại lý vinfast"
        path="/"
        image="/og-banner.jpg"
      />
      <Header />
      <main>
        <Hero />
        <VehicleGrid />
        <IntroSection />
        <NewsCarouselSection />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default HomePage;
