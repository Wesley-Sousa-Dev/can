import Image from "next/image";

import canEmblem from "@/assets/brand/can-emblem.png";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      {/* alt vazio: o nome "Can" já aparece em texto ao lado do emblema,
          e o leitor de tela não precisa ouvir a marca duas vezes. */}
      <Image src={canEmblem} alt="" width={40} height={40} className="size-10" />
      <span className="font-display text-x-large uppercase tracking-wider text-title">
        Can
      </span>
    </span>
  );
}
