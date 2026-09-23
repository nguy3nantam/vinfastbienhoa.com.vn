import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import pb from "@/lib/pocketbaseClient";
import { formatNewsTitle } from "@/lib/utils";

const NewsItemCard = ({ item }) => {
  const image = item.cover_image ? pb.files.getURL(item, item.cover_image) : item.cover_image_url;
  const isExternal = !!item.source_url;

  const content = (
    <>
      <div className="aspect-video w-full overflow-hidden bg-neutral-100">
        {image && (
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-neutral-400">
          {item.published_at ? new Date(item.published_at).toLocaleDateString("vi-VN") : ""}
        </p>
        <h3 className="mt-2 font-display text-base font-bold leading-snug text-[#151515] line-clamp-2">
          {formatNewsTitle(item.title)}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-2">{item.excerpt}</p>
        {isExternal && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#3b5bdb]">
            Đọc tiếp tại {item.source_name || "nguồn"} <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
    </>
  );

  const cardClass =
    "group block h-full overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md";

  if (isExternal) {
    return (
      <a href={item.source_url} target="_blank" rel="noreferrer" className={cardClass}>
        {content}
      </a>
    );
  }
  return (
    <Link to={`/tin-tuc/${item.id}`} className={cardClass}>
      {content}
    </Link>
  );
};

const NewsCarouselSection = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    pb.collection("news")
      .getList(1, 9, {
        filter: "published = true",
        sort: "-published_at",
        fields: "id,title,excerpt,cover_image,cover_image_url,published_at,source_url,source_name,collectionId,collectionName",
        requestKey: null,
      })
      .then((res) => setItems(res.items))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="bg-[#f6f7f9] py-16 lg:py-20">
      <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Tin tức</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
              Tin tức xe điện VinFast
            </h2>
          </div>
          <Link
            to="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b5bdb] hover:underline"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel opts={{ align: "start", slidesToScroll: 3 }} className="mt-10">
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <NewsItemCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default NewsCarouselSection;
