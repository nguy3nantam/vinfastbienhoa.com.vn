const NEWS = [
  {
    date: "01/07/2026",
    title: "VinFast ra mắt chương trình xe đã qua kiểm định, cam kết chất lượng cao cấp",
  },
  {
    date: "08/06/2026",
    title: "Doanh thu toàn cầu quý I/2026 của VinFast tăng trưởng 42% so với cùng kỳ",
  },
  {
    date: "06/06/2026",
    title: "VinFast VF 8 thế hệ mới lập kỷ lục doanh số với 12.728 đơn đặt hàng",
  },
];

const PressRelease = () => (
  <section id="tin-tuc" className="bg-white py-20 lg:py-24">
    <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">Tin tức</h2>
      <div className="mt-10 grid gap-10 md:grid-cols-3">
        {NEWS.map((n) => (
          <article key={n.title} className="border-t-2 border-[#3b5bdb] pt-5">
            <span className="text-sm text-neutral-400">{n.date}</span>
            <h3 className="mt-3 font-display text-lg font-semibold uppercase leading-snug text-[#151515]">
              {n.title}
            </h3>
            <a
              href="#lien-he"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#3b5bdb]"
            >
              Đọc thêm &gt;
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default PressRelease;
