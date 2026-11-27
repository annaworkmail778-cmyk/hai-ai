import { Suspense } from "react";
import { RestaurantProvider } from "@/lib/restaurant/client";
import "../restaurant.css";

export const metadata = { title: { default: "RISEUP Restaurant OS · Demo", template: "%s · RISEUP Restaurant OS" }, robots: { index: false, follow: false } };

export default function RestaurantStaffLayout({ children }: { children: React.ReactNode }) {
  return <RestaurantProvider><Suspense>{children}</Suspense></RestaurantProvider>;
}
