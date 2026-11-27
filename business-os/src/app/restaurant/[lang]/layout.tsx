import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RestaurantProvider } from "@/lib/restaurant/client";
import { isLang, LANGS } from "@/lib/restaurant/i18n";
import "../../restaurant.css";

export const metadata = { title: { default: "Summit Table · Demo", template: "%s · Summit Table (demo)" }, robots: { index: false, follow: false } };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function RestaurantGuestLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <RestaurantProvider role="guest"><Suspense>{children}</Suspense></RestaurantProvider>;
}
