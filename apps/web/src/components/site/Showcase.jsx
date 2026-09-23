const Showcase = () => (
  <section id="gioi-thieu" className="relative overflow-hidden bg-black text-white">
    <div className="mx-auto max-w-[72rem] px-5 pt-20 text-center lg:px-10">
      <h2 className="font-display text-3xl font-bold sm:text-5xl">
        Sự kết hợp hoàn hảo giữa chất lượng và tiện nghi
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/70">
        Những mẫu xe điện VinFast được trang bị công nghệ lấy con người làm trung tâm, nâng tầm trải
        nghiệm lái một cách liền mạch và tinh tế.
      </p>
    </div>
    <div className="relative mt-6">
      <img
        src="https://images.hostinger.com/3d843eff-0043-4cbb-995e-57821d920c27.png"
        alt="Dải sản phẩm VinFast"
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-w-[90rem] object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
    </div>
    <div className="mx-auto grid max-w-[72rem] gap-6 px-5 pb-20 pt-4 text-center sm:grid-cols-3 lg:px-10">
      {[
        { k: "471 km", v: "Quãng đường mỗi lần sạc" },
        { k: "10 năm", v: "Bảo hành pin & xe" },
        { k: "31 phút", v: "Sạc nhanh 10 → 70%" },
      ].map((s) => (
        <div key={s.v} className="border-t border-white/15 pt-5">
          <div className="font-display text-4xl font-extrabold text-[#8aa4e8]">{s.k}</div>
          <div className="mt-2 text-sm text-white/70">{s.v}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Showcase;
