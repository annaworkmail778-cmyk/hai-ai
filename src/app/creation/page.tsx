import type { Metadata } from "next";
import CreationScene from "@/components/CreationScene";

export const metadata: Metadata = {
  title: "The Creation of HAI — HAI_AI Systems",
  description:
    "A cinematic sequence: HAI, the HAI_AI assistant, awakens inside its creation chamber.",
};

export default function CreationPage() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-[#030104]">
      <CreationScene className="h-full w-full" />
    </main>
  );
}
