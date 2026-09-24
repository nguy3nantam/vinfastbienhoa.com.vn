import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import { homeSlides as FALLBACK_SLIDES } from "@/data/homeSlides";

const Hero = () => {
  const [i, setI] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [isPaused, setIsPaused] = useState(false);
  const timer = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    pb.collection("sliders")
      .getFullList({ filter: "active = true", sort: "order", signal: controller.signal, requestKey: null })
      .then((records) => {
        if (!records.length) return;
        setSlides(
          records.map((r) => {
            const img = r.image ? pb.files.getURL(r, r.image) : r.image_url;
            const mobileImg =
              r.mobile_image_url ||
              r.mobileImage ||
              (typeof img === "string" && img.includes("desktop") ? img.replace("desktop", "mobile") : null);

            const isOfficial = Boolean(
              r.officialBanner ||
              r.source_url?.includes("vinfastauto.com") ||
              r.image_url?.includes("vinfastauto.com") ||
              (typeof img === "string" && img.includes("vinfastauto.com")) ||
              (!r.title && !r.subtitle)
            );

            return {
              image: img,
              mobileImage: mobileImg,
              officialBanner: isOfficial,
              title: r.title,
              subtitle: r.subtitle,
              link_url: r.link_url,
            };
          })
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const go = useCallback((n) => setI((p) => (n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer.current);
  }, [slides.length, isPaused]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) go(i + 1); // swipe left -> next slide
      else go(i - 1); // swipe right -> prev slide
    }
  };

  return (
    <section
      id="top"
      aria-label="Ưu đãi ô tô điện VinFast"
      aria-roledescription="carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative mt-[72px] aspect-[5/8] max-h-[85vh] w-full overflow-hidden bg-neutral-950 sm:aspect-[16/10] md:aspect-[16/9] md:max-h-[calc(100vh-72px)] select-none"
    >
      {slides.map((s, idx) => {
        const Wrapper = s.link_url ? "a" : "div";
        const isCurrent = idx === i;
        const mobileSrc = s.mobileImage || (s.image?.includes("desktop") ? s.image.replace("desktop", "mobile") : null);

        return (
          <Wrapper
            key={idx}
            {...(s.link_url ? { href: s.link_url } : {})}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? "opacity-100 z-[1]" : "pointer-events-none opacity-0 z-0"
            }`}
            aria-hidden={!isCurrent}
            tabIndex={s.link_url && !isCurrent ? -1 : undefined}
          >
            <picture className="block h-full w-full">
              {mobileSrc && <source media="(max-width: 639px)" srcSet={mobileSrc} />}
              <img
                src={s.image}
                alt={s.title || "VinFast banner"}
                className="h-full w-full object-cover object-center"
                loading={isCurrent ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={isCurrent ? "high" : "low"}
              />
            </picture>

            {!s.officialBanner && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />}
            {!s.officialBanner && (s.title || s.subtitle) && (
              <div className="absolute inset-x-0 bottom-16 z-10 mx-auto max-w-[90rem] px-5 text-white sm:bottom-20 lg:px-10">
                {s.title && (
                  <h2 className="font-display text-2xl font-bold sm:text-4xl drop-shadow-md">{s.title}</h2>
                )}
                {s.subtitle && <p className="mt-2 max-w-lg text-sm sm:text-base drop-shadow">{s.subtitle}</p>}
              </div>
            )}
          </Wrapper>
        );
      })}

      {/* Navigation Arrows for desktop/tablet */}
      <button
        onClick={() => go(i - 1)}
        aria-label="Trước"
        className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-105 active:scale-95 sm:flex md:left-5 md:h-12 md:w-12 cursor-pointer"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => go(i + 1)}
        aria-label="Sau"
        className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-105 active:scale-95 sm:flex md:right-5 md:h-12 md:w-12 cursor-pointer"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm sm:bottom-6 sm:gap-2.5 sm:px-4 sm:py-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`p-1 cursor-pointer transition-all duration-300 flex items-center justify-center`}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                idx === i
                  ? "h-2 w-6 bg-white sm:h-2.5 sm:w-7"
                  : "h-2 w-2 bg-white/50 hover:bg-white/80 sm:h-2.5 sm:w-2.5"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
