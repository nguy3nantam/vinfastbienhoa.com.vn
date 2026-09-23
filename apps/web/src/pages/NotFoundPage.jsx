import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Không tìm thấy trang | VinFast Kim Sơn</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <p className="text-sm font-semibold text-[#3b5bdb]">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-4 text-neutral-600">Đường dẫn không tồn tại hoặc đã được thay đổi.</p>
        <Link to="/" className="mt-6 rounded-sm bg-[#3b5bdb] px-6 py-3 font-semibold text-white">Về trang chủ</Link>
      </main>
      <Footer />
    </div>
  );
}
