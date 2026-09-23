// Verified electric-car banners from the official Vietnam homepage (2026-09-21).
// Used only when the managed slider collection cannot be loaded.
const CDN = "https://static-cms-prod.vinfastauto.com/";

export const homeSlides = [
  { title: "Ô tô điện VinFast VF 2", image: CDN + "dat-coc-xe-vf2-desktop-092026.webp", mobileImage: CDN + "dat-coc-xe-vf2-mobile-092026.webp", link_url: "https://go.vinfastauto.com/q/EJ37Q3AP7V" },
  { title: "Ô tô điện VinFast VF 6", image: CDN + "dat-coc-xe-dien-vf6-desktop-092026.webp", mobileImage: CDN + "dat-coc-xe-dien-vf6-mobile-092026.webp", link_url: "https://go.vinfastauto.com/q/0JTEHK5O2Y" },
  { title: "Ô tô điện VinFast Limo Green", image: CDN + "limo-green-desktop-092026.webp", mobileImage: CDN + "limo-green-mobile-092026.webp", link_url: "https://go.vinfastauto.com/q/UYY0M2H5XH" },
  { title: "VinFast lên đời xe điện – voucher tới 80 triệu đồng", image: CDN + "vinfast-len-doi-xe-dien-voucher-80-trieu-desktop.jpg", mobileImage: CDN + "vinfast-len-doi-xe-dien-voucher-80-trieu-mobile.jpg", link_url: "https://vinfastauto.com/vn_vi/vinfast-tang-voucher-len-toi-80-trieu-dong-de-khach-hang-cu-chuyen-doi-sang-xe-dien" },
].map((slide) => ({ ...slide, officialBanner: true }));
