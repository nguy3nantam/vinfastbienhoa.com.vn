const DEFAULT_LOGO = "https://vinfastnguyenphuc.vn/wp-content/uploads/2024/10/logo-vinfast.png";

const Logo = ({ light = false, showText = true, src }) => (
  <div className="flex items-center gap-2 select-none">
    <img
      src={src || DEFAULT_LOGO}
      alt="VinFast Logo"
      className="h-8 w-auto"
    />
    {showText && (
      <span
        className={`font-display text-xl font-bold tracking-[0.25em] ${light ? "text-white" : "text-[#151515]"}`}
      >
        VINFAST
      </span>
    )}
  </div>
);

export default Logo;
