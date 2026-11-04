import Image from "next/image";

interface GameCoverProps {
  imageUrl: string;
  /** Larguras que a imagem ocupa em cada tela, no formato do atributo "sizes". */
  sizes: string;
  /** Use em imagens que aparecem logo ao abrir a página, para carregarem primeiro. */
  isAboveTheFold?: boolean;
}

export function GameCover({
  imageUrl,
  sizes,
  isAboveTheFold = false,
}: GameCoverProps) {
  return (
    <div className="relative aspect-video overflow-hidden bg-panel">
      {/* alt vazio de propósito: o nome do jogo sempre aparece em texto ao lado
          da capa, então descrevê-la faria o leitor de tela repetir o título. */}
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes={sizes}
        loading={isAboveTheFold ? "eager" : "lazy"}
        fetchPriority={isAboveTheFold ? "high" : "auto"}
        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
      />
    </div>
  );
}
