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
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
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
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/images/Logo.png"
        alt="SIPOS Logo"
        width={iconSize}
        height={iconSize}
        priority={priority}
        className={cn("shrink-0", iconClassName)}
      />
      {showText && (
        <span
          className={cn(
            "font-bold leading-none tracking-tight text-primary-600 dark:text-primary-300",
            textSizeMap[size],
            textClassName
          )}
        >
          SIPOS
        </span>
      )}
    </span>
  );
}
