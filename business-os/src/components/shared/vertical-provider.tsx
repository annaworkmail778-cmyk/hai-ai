"use client";
/*
 * Chooses the demo-session provider for the current vertical.
 * Hotel routes get the Hotel OS provider exactly as before. Restaurant OS routes
 * (`/restaurant`, `/r`, `/q`, `/present/restaurant`) bring their own provider in their layouts,
 * so they never poll or replay the hotel session.
 */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DemoProvider } from "@/lib/client/demo-store";

const RESTAURANT = [/^\/restaurant(\/|$)/, /^\/r(\/|$)/, /^\/q(\/|$)/, /^\/present\/restaurant(\/|$)/];
export const isRestaurantPath = (p: string) => RESTAURANT.some((r) => r.test(p));

export function VerticalProvider({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  if (isRestaurantPath(path)) return <>{children}</>;
  return <DemoProvider>{children}</DemoProvider>;
}
