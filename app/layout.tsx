import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yazılım Atölyesi | Üret, öğren, paylaş",
  description:
    "İstanbul Gedik Üniversitesi Yazılım Atölyesi gönüllü yazılım kulübü.",
  openGraph: {
    title: "Yazılım Atölyesi",
    description: "Birlikte üretiyor, öğreniyor, geliştiriyoruz.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <a className="skip-link" href="#main-content">
          İçeriğe geç
        </a>
        {children}
      </body>
    </html>
  );
}
