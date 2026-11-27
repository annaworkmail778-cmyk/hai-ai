import { notFound } from "next/navigation";
import { HotelShell } from "@/components/hotel/shell";
import { isLang, LANGS } from "@/lib/site-i18n";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function HotelLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <HotelShell lang={lang}>{children}</HotelShell>;
}
