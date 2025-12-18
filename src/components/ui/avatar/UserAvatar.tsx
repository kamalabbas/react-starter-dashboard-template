import React from "react";

interface Props {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function UserAvatar({ src, name = "", size = "md" }: Props) {
  const [failed, setFailed] = React.useState<boolean>(() => !Boolean(src));

  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const colors = [
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-sky-600",
    "bg-fuchsia-600",
    "bg-amber-600",
    "bg-teal-600",
  ];
  const idx = Math.abs((name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
  const bgClass = colors[idx];

  if (!failed && src) {
    return (
      // Keep fixed size to avoid layout shift
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0`}
        width={size === "sm" ? 32 : size === "md" ? 40 : 48}
        height={size === "sm" ? 32 : size === "md" ? 40 : 48}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full flex items-center justify-center text-white ${bgClass} flex-shrink-0`}>
      <span className="font-medium">{initials || ""}</span>
    </div>
  );
}
