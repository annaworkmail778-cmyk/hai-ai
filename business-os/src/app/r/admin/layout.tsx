import { RShell } from "@/components/restaurant/staff/shell";

export const metadata = { title: "Կառավարման վահանակ" };

export default function RAdminLayout({ children }: { children: React.ReactNode }) {
  return <RShell>{children}</RShell>;
}
