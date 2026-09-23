import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import Seo from "@/components/site/Seo";
import pb from "@/lib/pocketbaseClient";
import { formatNewsTitle } from "@/lib/utils";

const PAGE_SIZE = 10;

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
};

const NewsCard = ({ item }) => {
  const image = item.cover_image ? pb.files.getURL(item, item.cover_image) : item.cover_image_url;

  return (
    <Link to={`/tin-tuc/${item.id}`} className="group block">
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-neutral-100">
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="pt-4">
        <h3 className="font-display text-lg font-bold leading-snug text-[#151515] transition-colors group-hover:text-[#3b5bdb] sm:text-xl">
          {formatNewsTitle(item.title)}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-2">{item.excerpt}</p>
        <p className="mt-3 text-xs text-neutral-400">{formatDate(item.published_at)}</p>
      </div>
    </Link>
  );
};

const NewsListPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (retry = false) => {
    if (loadingRef.current || (!hasMore && !retry)) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);
    const nextPage = page + 1;
    try {
      const res = await pb.collection("news").getList(nextPage, PAGE_SIZE, {
        filter: "published = true",
        sort: "-published_at",
        fields: "id,title,excerpt,cover_image,cover_image_url,published_at,collectionId,collectionName",
        requestKey: null,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.items.filter((it) => !seen.has(it.id))];
      });
      setPage(nextPage);
      setHasMore(nextPage < res.totalPages);
    } catch {
      setError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Tin tức"
        description="Cập nhật tin tức, sự kiện và ưu đãi mới nhất về các dòng xe điện VinFast VF3, VF5, VF6, VF7, VF8, VF9 từ VinFast Kim Sơn - Biên Hòa, Đồng Nai."
        keywords="tin tức vinfast, sự kiện vinfast, ưu đãi vinfast, xe điện vinfast mới nhất"
        path="/tin-tuc"
        breadcrumb={[{ name: "Tin tức", path: "/tin-tuc" }]}
      />
      <Header />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-32 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 hover:text-[#3b5bdb]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại trang chủ
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3b5bdb]">Tin tức</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
          Tin tức xe điện VinFast
        </h1>

        {initialLoading ? (
          <p className="mt-10 text-neutral-400">Đang tải...</p>
        ) : items.length === 0 && !error ? (
          <p className="mt-10 text-neutral-400">Chưa có tin tức nào.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="flex justify-center py-10">
          {loading && !initialLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          )}
          {error && !loading && (
            <button
              type="button"
              onClick={() => loadMore(true)}
              className="text-sm font-semibold text-[#3b5bdb] hover:underline"
            >
              Không tải được tin tức. Thử lại
            </button>
          )}
          {!error && !hasMore && !initialLoading && items.length > 0 && (
            <p className="text-sm text-neutral-400">Bạn đã xem hết tin tức.</p>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default NewsListPage;
