import { notFound } from "next/navigation";

/** Any unknown path under a locale renders the localized 404 (../not-found.tsx). */
export default function UnknownPage() {
  notFound();
}
