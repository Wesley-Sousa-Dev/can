import { Gamepad2 } from "lucide-react";
import Image from "next/image";

interface GameCoverProps {
  /** Nula quando a loja não tem imagem do jogo: aparece um quadro com ícone no lugar. */
  imageUrl: string | null;
  /** Larguras que a imagem ocupa em cada tela, no formato do atributo "sizes". */
  sizes: string;
  /** Use em imagens que aparecem logo ao abrir a página, para carregarem primeiro. */
  isAboveTheFold?: boolean;
  /**
   * capsule: a capa horizontal da Steam (460 × 215), mostrada inteira, com o logo.
   * screenshot: uma captura de tela em 16:9, para áreas grandes como o carrossel.
   */
  shape?: "capsule" | "screenshot";
}

const ASPECT_RATIO_CLASS = {
  capsule: "aspect-460/215",
  screenshot: "aspect-video",
};

export function GameCover({ imageUrl, sizes, isAboveTheFold = false, shape = "capsule" }: GameCoverProps) {
  return (
    <div className={`relative overflow-hidden bg-panel ${ASPECT_RATIO_CLASS[shape]}`}>
      {imageUrl ? (
        // alt vazio de propósito: o nome do jogo sempre aparece em texto ao lado
        // da capa, então descrevê-la faria o leitor de tela repetir o título.
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={sizes}
          loading={isAboveTheFold ? "eager" : "lazy"}
          fetchPriority={isAboveTheFold ? "high" : "auto"}
          className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      ) : (
        <Gamepad2 aria-hidden="true" className="absolute inset-0 m-auto size-1/4 text-border-input" />
      )}
    </div>
  );
}
