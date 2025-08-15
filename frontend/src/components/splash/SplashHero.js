import Image from "next/image";

export default function SplashHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src={"/splash_bg.png"}
        alt="Splash Background"
        fill
        style={{
          objectFit: "contain",
          objectPosition: "top",
        }}
      />
      <div className="relative z-10 max-w-[1000px] flex flex-col items-center justify-center text-center text-white p-16 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-30 rounded-xl mix-blend-overlay backdrop-blur-lg"></div>
        <div className="relative z-10 space-y-12">
          <div className="flex items-center justify-center mb-12 gap-2">
            <Image
              src={"/logo.svg"}
              alt="ChauPhim Logo"
              width={80}
              height={80}
            />
            <div className="text-left">
              <h1 className="mb-0 text-xl font-bold">ChauPhim</h1>
              <p className="font-extralight text-lg">Phim hay cả chậu</p>
            </div>
          </div>
          <h2 className="pb-8 text-2xl md:text-3xl lg:text-4xl font-semibold">
            Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
          </h2>
          <button className="relative bg-gradient-to-r from-primary to-secondary text-white text-lg px-24 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 transform overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            <a
              href="/phimhay"
              className="relative z-10 flex items-center justify-center gap-2 w-full h-full"
            >
              Xem Ngay
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </button>
        </div>
      </div>
    </div>
  );
}
