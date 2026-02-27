// brand-logo.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg";

export type BrandLogoProps = {
  size?: BrandLogoSize;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  priority?: boolean;
};

const iconSizeMap: Record<BrandLogoSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

const textSizeMap: Record<BrandLogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export default function BrandLogo({
  size = "md",
  showText = true,
  className,
  textClassName,
  iconClassName,
  priority = false,
}: BrandLogoProps) {
  const iconSize = iconSizeMap[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/images/Logo.png"
        alt="CloudTrack Campus"
        width={iconSize}
        height={iconSize}
        priority={priority}
        className={cn("shrink-0", iconClassName)}
      />
      {showText && (
        <span
          className={cn(
            "font-semibold leading-none tracking-tight",
            "text-[var(--token-gray-900)] dark:text-[var(--token-white-90)]",
            textSizeMap[size],
            textClassName
          )}
        >
          CloudTrack Campus
        </span>
      )}
    </span>
  );
}