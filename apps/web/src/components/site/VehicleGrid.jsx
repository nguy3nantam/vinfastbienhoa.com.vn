import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Zap, Timer, Users } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { openDepositDialog } from "./DepositDialog";

const ICONS = [Gauge, Zap, Timer, Users];

const VehicleCard = ({ car }) => {
  const detailRoute = `/xe/${car.id}`;

  return (
  <article
    id={car.id}
    className="group scroll-mt-28 overflow-hidden rounded-lg border border-neutral-100 bg-white transition-all duration-300 hover:shadow-xl"
  >
    <div className="grid gap-0 md:grid-cols-2">
      <div className="relative flex flex-col justify-center bg-white p-7">
        <span className="font-display text-2xl font-extrabold italic tracking-tight">{car.name}</span>
        {detailRoute ? (
          <Link to={detailRoute} className="relative mt-4 block overflow-hidden">
            <img
              src={car.image}
              alt={`VinFast ${car.name}`}
              loading="lazy"
              decoding="async"
              className="w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div className="relative mt-4 overflow-hidden">
            <img
              src={car.image}
              alt={`VinFast ${car.name}`}
              loading="lazy"
              decoding="async"
              className="w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <span className="mt-2 text-xs uppercase tracking-wide text-neutral-500">Màu {car.color}</span>
      </div>

      <div className="flex flex-col justify-between p-7">
        <div>
          <span className="text-xs uppercase tracking-wide text-neutral-500">Giá từ</span>
          <div className="mt-1 font-display text-2xl font-bold text-[#151515]">
            {car.price} <span className="text-base font-medium text-neutral-500">VNĐ</span>
          </div>

          <ul className="mt-6 space-y-3">
            {car.specs.map((s, idx) => {
              const Icon = ICONS[idx % ICONS.length];
              return (
                <li key={s.label} className="flex items-center gap-3 border-b border-neutral-200/70 pb-3">
                  <Icon className="h-5 w-5 shrink-0 text-[#3b5bdb]" strokeWidth={1.75} />
                  <span className="flex-1 text-sm text-neutral-600">{s.label}</span>
                  <span className="text-sm font-semibold text-[#151515]">{s.value}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={() => openDepositDialog(car.name)}
            className="rounded-sm bg-[#3b5bdb] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#2b47b8]"
          >
            Nhận Ưu Đãi
          </button>
          {detailRoute ? (
            <Link
              to={detailRoute}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#151515] transition-colors hover:text-[#3b5bdb]"
            >
              Chi tiết
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <a
              href="#trai-nghiem"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#151515] transition-colors hover:text-[#3b5bdb]"
            >
              Chi tiết
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  </article>
  );
};

const CategorySection = ({ title, description, list }) => (
  <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
    <div className="mx-auto max-w-[72rem] text-center">
      <h2 className="font-display text-2xl font-bold sm:text-4xl">{title}</h2>
      {description && <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">{description}</p>}
    </div>

    <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:gap-10">
      {list.map((car) => (
        <VehicleCard key={car.id} car={car} />
      ))}
    </div>
  </div>
);

const VehicleGrid = () => {
  const { electricCars, serviceCars } = useVehicles();

  return (
    <section id="dong-xe" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[72rem] px-5 text-center lg:px-10">
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Khám phá gia đình VinFast</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          Ngôn ngữ thiết kế VinFast kết hợp hoàn hảo giữa những đường cong thể thao, nét sang trọng và
          sự hiện diện đầy uy lực — tối ưu hiệu suất, công năng và vẻ đẹp tinh tế.
        </p>
      </div>

      <div className="mt-16">
        <CategorySection
          title="Dòng Xe Điện"
          description=""
          list={electricCars}
        />
      </div>

      <div className="mx-auto mt-20 max-w-[90rem] px-5 lg:px-10">
        <div className="h-px w-full bg-neutral-200" />
      </div>

      <div className="mt-20">
        <CategorySection
          title="Dòng Xe Dịch Vụ"
          description=""
          list={serviceCars}
        />
      </div>
    </section>
  );
};

export default VehicleGrid;
