import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── ResponsiveImage ──────────────────────────────────────────────────────────

export default function ResponsiveImage() {
  return (
    <div className="overflow-hidden rounded-xl border border-(--token-gray-200) dark:border-(--color-border-dark-soft)">
      <Image
        src="/images/grid-image/image-01.png"
        alt="Cover"
        className="w-full object-cover"
        width={1054}
        height={600}
      />
    </div>
  );
}
