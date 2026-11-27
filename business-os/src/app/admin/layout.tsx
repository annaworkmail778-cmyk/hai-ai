import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";

export const metadata = { title: "Կառավարման վահանակ" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell><Suspense>{children}</Suspense></AdminShell>;
}
