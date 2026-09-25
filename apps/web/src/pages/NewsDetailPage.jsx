import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import DOMPurify from "dompurify";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingContact from "@/components/site/FloatingContact";
import ContactSection from "@/components/site/ContactSection";
import Seo from "@/components/site/Seo";
import pb from "@/lib/pocketbaseClient";
import { formatNewsTitle } from "@/lib/utils";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
};

const NewsDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setItem(null);
    setNotFound(false);
    setError(false);
    setLoading(true);
    pb.collection("news")
      .getOne(id, { filter: "published = true", signal: controller.signal, requestKey: null })
      .then((record) => {
        if (active) setItem(record);
      })
      .catch((err) => {
        if (!active || err.isAbort) return;
        if (err.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, attempt]);

  if (notFound) return <Navigate to="/tin-tuc" replace />;

  const image = item
    ? item.cover_image
      ? pb.files.getURL(item, item.cover_image)
      : item.cover_image_url
    : "";

  const newsSchema = item
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: formatNewsTitle(item.title),
        description: item.excerpt,
        image: image ? [image] : undefined,
        datePublished: item.published_at || item.created,
        dateModified: item.updated || item.published_at || item.created,
        author: { "@type": "Organization", name: item.source_name || "VinFast Kim Sơn" },
        publisher: {
          "@type": "Organization",
          name: "VinFast Kim Sơn",
          logo: { "@type": "ImageObject", url: "https://vinfastbienhoa.com.vn/og-banner.jpg" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://vinfastbienhoa.com.vn/tin-tuc/${item.id}` },
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      {item && (
        <Seo
          title={formatNewsTitle(item.title)}
          description={item.excerpt}
          path={`/tin-tuc/${item.id}`}
          image={image || undefined}
          type="article"
          schema={newsSchema}
          breadcrumb={[
            { name: "Tin tức", path: "/tin-tuc" },
            { name: formatNewsTitle(item.title), path: `/tin-tuc/${item.id}` },
          ]}
        />
      )}
      <Header />
      <main className="mx-auto max-w-[48rem] px-5 pb-20 pt-32 lg:px-0">
        <Link
          to="/tin-tuc"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 hover:text-[#3b5bdb]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tất cả tin tức
        </Link>
        {loading ? (
          <p className="text-neutral-400">Đang tải...</p>
        ) : error ? (
          <div role="alert" className="text-neutral-600">
            <p>Không tải được bài viết. Vui lòng thử lại.</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 font-semibold text-[#3b5bdb] hover:underline">
              Thử lại
            </button>
          </div>
        ) : item ? (
          <article>
            <p className="text-xs text-neutral-400">
              {formatDate(item.published_at)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[#151515] sm:text-3xl">
              {formatNewsTitle(item.title)}
            </h1>
            {image && (
              <img src={image} alt={item.title} className="mt-6 w-full rounded-lg object-cover" />
            )}
            <div
              className="prose prose-neutral mt-8 max-w-none text-[15px] leading-7 text-neutral-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(item.content || item.excerpt || ""),
              }}
            />
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3b5bdb] hover:underline"
              >
                Đọc bài viết đầy đủ tại {item.source_name || "nguồn"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </article>
        ) : null}
      </main>
      {item && <ContactSection />}
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default NewsDetailPage;
