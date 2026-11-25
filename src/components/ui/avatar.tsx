import { avatarTone, cn, getInitials } from "@/lib/utils";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
} as const;

interface AvatarProps {
  name: string;
  seed?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ name, seed, size = "sm", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        avatarTone(seed ?? name),
        SIZES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
