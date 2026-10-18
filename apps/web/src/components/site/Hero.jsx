import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import { homeSlides as FALLBACK_SLIDES } from "@/data/homeSlides";

const Hero = () => {
  const [i, setI] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const timer = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    pb.collection("sliders")
      .getFullList({ filter: "active = true", sort: "order", signal: controller.signal, requestKey: null })
      .then((records) => {
        if (!records.length) return;
        setSlides(
          records.map((r) => ({
            image: r.image ? pb.files.getURL(r, r.image) : r.image_url,
            mobileImage: r.mobile_image_url,
            officialBanner: r.source_url?.startsWith("https://vinfastauto.com/vn_vi#home-electric-") || !r.subtitle,
            title: r.title,
            subtitle: r.subtitle,
            link_url: r.link_url,
          }))
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const go = useCallback((n) => setI((p) => (n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    setI(0);
    timer.current = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer.current);
  }, [slides.length]);

  return (
    <section id="top" aria-label="Ưu đãi ô tô điện VinFast" aria-roledescription="carousel" className="relative mt-[72px] h-[380px] sm:h-[500px] md:h-[calc(100vh-72px)] max-h-[780px] w-full overflow-hidden bg-[#f6f7f9]">
      {slides.map((s, idx) => {
        const Wrapper = s.link_url ? "a" : "div";
        return (
          <Wrapper
            key={idx}
            {...(s.link_url ? { href: s.link_url } : {})}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={idx !== i}
            tabIndex={s.link_url && idx !== i ? -1 : undefined}
          >
            <picture>
              {s.mobileImage && <source media="(max-width: 767px)" srcSet={s.mobileImage} />}
              <img
                src={s.image}
                alt={s.title || ""}
                className="h-full w-full object-cover object-center"
                loading={idx === i ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={idx === i ? "high" : "low"}
              />
            </picture>
            {!s.officialBanner && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />}
            {!s.officialBanner && (s.title || s.subtitle) && (
              <div className="absolute inset-x-0 bottom-16 z-10 mx-auto max-w-[90rem] px-5 text-white sm:bottom-20 lg:px-10">
                {s.title && (
                  <h2 className="font-display text-2xl font-bold sm:text-4xl">{s.title}</h2>
                )}
                {s.subtitle && <p className="mt-2 max-w-lg text-sm sm:text-base">{s.subtitle}</p>}
              </div>
            )}
          </Wrapper>
        );
      })}



      <button
        onClick={() => go(i - 1)}
        aria-label="Trước"
        className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition hover:bg-white/40 sm:flex md:left-4 md:h-12 md:w-12"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={() => go(i + 1)}
        aria-label="Sau"
        className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition hover:bg-white/40 sm:flex md:right-4 md:h-12 md:w-12"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-8 sm:gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`rounded-full transition-all ${idx === i ? "h-2 w-6 bg-white sm:h-2.5 sm:w-7" : "h-2 w-2 bg-white/50 hover:bg-white/70 sm:h-2.5 sm:w-2.5"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
