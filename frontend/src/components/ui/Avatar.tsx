import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarStatus = "online" | "offline" | "busy" | "away" | "none";

type AvatarProps = {
  src: string;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
};

const sizeMap: Record<AvatarSize, { container: string; image: string; status: string }> = {
  xs:  { container: "size-6",  image: "size-6",  status: "size-1.5 border" },
  sm:  { container: "size-8",  image: "size-8",  status: "size-2 border" },
  md:  { container: "size-10", image: "size-10", status: "size-2.5 border-[1.5px]" },
  lg:  { container: "size-12", image: "size-12", status: "size-3 border-[1.5px]" },
  xl:  { container: "size-14", image: "size-14", status: "size-3.5 border-2" },
  "2xl": { container: "size-16", image: "size-16", status: "size-4 border-2" },
};

const statusColorMap: Record<Exclude<AvatarStatus, "none">, string> = {
  online:  "bg-success-500",
  offline: "bg-[var(--token-gray-400)]",
  busy:    "bg-error-500",
  away:    "bg-warning-400",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  status = "none",
  className,
}) => {
  const sizes = sizeMap[size];

  return (
    <div className={cn("relative inline-flex shrink-0", sizes.container, className)}>
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className={cn("rounded-full object-cover", sizes.image)}
      />
      {status !== "none" && (
        <span
          aria-label={status}
          className={cn(
            "absolute bottom-0 right-0 rounded-full",
            "border-[var(--token-white)] dark:border-[var(--token-gray-900)]",
            sizes.status,
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;