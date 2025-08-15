import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: 'swap',
});

export const metadata = {
  title: "ChauPhim - Xem phim online chất lượng cao",
  description: "Xem phim online miễn phí với chất lượng HD, phụ đề tiếng Việt. Cập nhật phim mới nhất hàng ngày.",
  keywords: "xem phim online, phim HD, phim Việt Nam, phim nước ngoài, phụ đề Việt",
  openGraph: {
    title: "ChauPhim - Xem phim online chất lượng cao",
    description: "Xem phim online miễn phí với chất lượng HD, phụ đề tiếng Việt",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B1020" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
