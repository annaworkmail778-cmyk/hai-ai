import { Suspense } from "react";
import { StaffShell } from "@/components/staff/shell";

export const metadata = { title: "Աշխատակցի հավելված" };

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell><Suspense>{children}</Suspense></StaffShell>;
}
