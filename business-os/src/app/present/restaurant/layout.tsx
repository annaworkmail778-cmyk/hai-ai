import { RestaurantProvider } from "@/lib/restaurant/client";
import "../../restaurant.css";

export const metadata = { title: "Ներկայացում · Restaurant OS", robots: { index: false, follow: false } };

export default function PresentRestaurantLayout({ children }: { children: React.ReactNode }) {
  return <RestaurantProvider role="presenter">{children}</RestaurantProvider>;
}
