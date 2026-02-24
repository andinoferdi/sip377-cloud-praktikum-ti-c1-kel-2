import React from "react";

type AvatarTextProps = {
  name: string;
  className?: string;};

const AvatarText: React.FC<AvatarTextProps> = ({ name, className = "" }) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getColorClass = (name: string) => {
    const colors = [
      "bg-brand-100 text-brand-600",
      "bg-[var(--token-pink-100)] text-[var(--token-pink-600)]",
      "bg-[var(--token-cyan-100)] text-[var(--token-cyan-600)]",
      "bg-[var(--token-orange-100)] text-[var(--token-orange-600)]",
      "bg-[var(--token-green-100)] text-[var(--token-green-600)]",
      "bg-[var(--token-purple-100)] text-[var(--token-purple-600)]",
      "bg-[var(--token-yellow-100)] text-[var(--token-yellow-600)]",
      "bg-error-100 text-error-600",
    ];

    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div
      className={`flex h-10 w-10 ${className} items-center justify-center rounded-full ${getColorClass(
        name
      )}`}
    >
      <span className="text-sm font-medium">{initials}</span>
    </div>
  );
};

export default AvatarText;
