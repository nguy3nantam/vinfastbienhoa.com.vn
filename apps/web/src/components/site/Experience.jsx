const ITEMS = [
  {
    title: "Bảo hành đẳng cấp thế giới",
    image: "https://images.hostinger.com/695fab38-3c72-4441-b964-ee6e17390fd8.png",
    desc: "Chính sách bảo hành 10 năm / 200.000 km cho xe và 10 năm không giới hạn số km cho pin, mang lại sự an tâm tuyệt đối trên mọi hành trình.",
  },
  {
    title: "Sạc điện tiện lợi",
    image: "https://images.hostinger.com/7059c56c-1d3e-4d62-8e9d-2070edec40e6.png",
    desc: "Hệ thống trạm sạc phủ khắp toàn quốc cùng bộ sạc tại nhà. Sạc nhanh DC giúp bạn đi được quãng đường xa chỉ sau ít phút dừng chân.",
  },
  {
    title: "Trao chìa khóa tận tâm",
    image: "https://images.hostinger.com/cc13e583-0650-4533-9e0d-6ce45b9a000d.png",
    desc: "Đội ngũ tư vấn chuyên nghiệp đồng hành cùng bạn từ lúc chọn xe, lái thử đến khi nhận xe và trong suốt quá trình sử dụng.",
  },
];

const Experience = () => (
  <section id="trai-nghiem" className="bg-[#fafafa] py-20 lg:py-28">
    <div className="mx-auto max-w-[72rem] px-5 text-center lg:px-10">
      <h2 className="font-display text-3xl font-bold sm:text-5xl">Trải nghiệm VinFast</h2>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
        VinFast đặt chất lượng chế tác cao cấp và sự đổi mới trong kỹ thuật lên hàng đầu, mang tới lợi
        ích tiết kiệm vượt trội cùng chính sách bảo hành dẫn đầu ngành.
      </p>
    </div>

    <div className="mx-auto mt-14 grid max-w-[90rem] gap-8 px-5 md:grid-cols-3 lg:px-10">
      {ITEMS.map((it) => (
        <article key={it.title} className="flex flex-col">
          <div className="overflow-hidden rounded-lg">
            <img
              src={it.image}
              alt={it.title}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <h3 className="mt-6 text-center font-display text-xl font-semibold">{it.title}</h3>
          <p className="mt-3 text-center text-[15px] leading-relaxed text-neutral-600">{it.desc}</p>
          <a
            href="#lien-he"
            className="mt-4 text-center text-sm font-semibold text-[#3b5bdb] transition-colors hover:text-[#2b47b8]"
          >
            Tìm hiểu thêm
          </a>
        </article>
      ))}
    </div>
  </section>
);

export default Experience;
