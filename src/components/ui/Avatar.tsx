import { getInitials } from "@/lib/userDisplay";

interface AvatarProps {
  fullName: string;
  size: "small" | "large";
  className?: string;
}

const SIZE_CLASSES: Record<AvatarProps["size"], string> = {
  small: "size-8 font-sans text-small font-medium",
  large: "size-24 font-display text-xx-large",
};

// Avatar com as iniciais, enquanto não existe envio de foto.
// É decorativo: o nome da pessoa sempre aparece em texto ao lado.
export function Avatar({ fullName, size, className = "" }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-primary text-title ${SIZE_CLASSES[size]} ${className}`}
    >
      {getInitials(fullName)}
    </span>
  );
}
