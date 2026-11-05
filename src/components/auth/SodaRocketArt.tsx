import type { CSSProperties } from "react";

// Ilustração das telas de entrar e criar conta: latas de refrigerante
// chacoalhadas viram foguetes, empurradas pelo jato que espirra da abertura.
// É decorativa (aria-hidden) e usa só as cores do manual, pelos tokens.
// As animações têm o prefixo motion-safe e param para quem pediu menos
// movimento nas configurações do sistema (WCAG 2.3.3).

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 800;
// Área extra de céu além do desenho, para colunas mais altas ou mais largas que ele.
const SKY_EXTRA_HEIGHT = 900;
const SKY_EXTRA_WIDTH = 300;

type SodaFlavor = "grape" | "blueberry" | "lime";

interface FlavorColors {
  bodyShadow: string;
  bodyLight: string;
  soda: string;
  sodaFillClass: string;
  emblemStrokeClass: string;
}

const FLAVOR_COLORS: Record<SodaFlavor, FlavorColors> = {
  grape: {
    bodyShadow: "var(--color-primary-hover)",
    bodyLight: "var(--color-primary)",
    soda: "var(--color-primary-focus)",
    sodaFillClass: "fill-primary-focus",
    emblemStrokeClass: "stroke-primary",
  },
  blueberry: {
    bodyShadow: "var(--color-card)",
    bodyLight: "var(--color-tag)",
    soda: "var(--color-tag)",
    sodaFillClass: "fill-tag",
    emblemStrokeClass: "stroke-tag",
  },
  lime: {
    bodyShadow: "var(--color-background)",
    bodyLight: "var(--color-cta)",
    soda: "var(--color-cta)",
    sodaFillClass: "fill-cta",
    emblemStrokeClass: "stroke-cta",
  },
};

// A lata é desenhada em pé, centrada na origem: tampa em y = -60 e fundo em y = 60.
// O jato sai pela abertura da tampa, para cima, e a rotação de cada lata o
// aponta para trás, como o rastro de um cometa.
const SODA_STREAM_PATH =
  "M -4 -64 C -16 -92 -6 -118 -22 -150 C -38 -182 -24 -210 -46 -244 C -60 -266 -34 -292 -8 -286 C 14 -300 46 -284 52 -258 C 58 -228 36 -206 36 -174 C 36 -140 18 -112 16 -64 Z";
const SODA_HIGHLIGHT_PATH =
  "M 2 -66 C -4 -100 4 -130 -6 -170 C -12 -200 -4 -226 -14 -252 C -2 -258 8 -250 10 -238 C 12 -214 6 -196 12 -168 C 18 -134 10 -100 8 -66 Z";
const LABEL_WAVE_PATH = "M -35 -10 C -15 -22 15 2 35 -10 L 35 22 C 15 34 -15 10 -35 22 Z";

// Espuma que estoura pela abertura, como quando se abre uma lata chacoalhada.
const FOAM_BURST = [
  { x: -6, y: -72, radius: 11 },
  { x: 8, y: -80, radius: 13 },
  { x: 22, y: -70, radius: 9 },
  { x: -16, y: -86, radius: 8 },
  { x: 20, y: -92, radius: 9 },
  { x: 4, y: -98, radius: 10 },
  { x: -8, y: -106, radius: 7 },
  { x: 14, y: -112, radius: 6 },
];

// Bolhinhas de gás dentro do jato.
const FIZZ_BUBBLES = [
  { x: -10, y: -140, radius: 4 },
  { x: 14, y: -168, radius: 5 },
  { x: -24, y: -208, radius: 6 },
  { x: 22, y: -228, radius: 4 },
  { x: 2, y: -196, radius: 3 },
  { x: -30, y: -250, radius: 5 },
  { x: 32, y: -256, radius: 6 },
];

// O fim do jato se quebra em gotas.
const STREAM_END_DROPS = [
  { x: -52, y: -284, radius: 6 },
  { x: -22, y: -304, radius: 5 },
  { x: 30, y: -306, radius: 7 },
  { x: 58, y: -282, radius: 4 },
  { x: 2, y: -322, radius: 4 },
];

const SPRAY_DROPLETS = [
  { startX: 4, travelX: -30, travelY: -230, radius: 5, delaySeconds: 0 },
  { startX: 8, travelX: 30, travelY: -250, radius: 4, delaySeconds: 0.2 },
  { startX: 6, travelX: -70, travelY: -140, radius: 4, delaySeconds: 0.4 },
  { startX: 6, travelX: 72, travelY: -150, radius: 3.5, delaySeconds: 0.6 },
  { startX: 4, travelX: -12, travelY: -290, radius: 6, delaySeconds: 0.8 },
  { startX: 8, travelX: 44, travelY: -200, radius: 3, delaySeconds: 1 },
  { startX: 6, travelX: -50, travelY: -260, radius: 4.5, delaySeconds: 1.2 },
  { startX: 6, travelX: 16, travelY: -180, radius: 3, delaySeconds: 1.4 },
];

interface FlyingCanConfig {
  id: string;
  flavor: SodaFlavor;
  x: number;
  y: number;
  angle: number;
  scale: number;
  animationDelaySeconds: number;
  /** A lata gira no próprio eixo, desgovernada, em vez de só balançar. */
  isTumbling?: boolean;
}

// Voam para cima e para a direita, em formação, com o rastro para trás.
const FLYING_CANS: FlyingCanConfig[] = [
  { id: "grape-leader", flavor: "grape", x: 390, y: 300, angle: 220, scale: 1.4, animationDelaySeconds: 0 },
  { id: "blueberry", flavor: "blueberry", x: 170, y: 170, angle: 212, scale: 0.9, animationDelaySeconds: 0.8 },
  { id: "lime", flavor: "lime", x: 505, y: 580, angle: 228, scale: 0.8, animationDelaySeconds: 1.6 },
  { id: "grape-tumbling", flavor: "grape", x: 520, y: 110, angle: 225, scale: 0.45, animationDelaySeconds: 0, isTumbling: true },
];

// Gerador pseudoaleatório com semente fixa: as estrelas saem iguais no
// servidor e no navegador, o que evita diferença na hidratação do React.
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

const randomForStars = createSeededRandom(42);
const STARS = Array.from({ length: 110 }, (_, starIndex) => ({
  id: starIndex,
  x: roundToTenth(-SKY_EXTRA_WIDTH + randomForStars() * (VIEWBOX_WIDTH + SKY_EXTRA_WIDTH * 2)),
  y: roundToTenth(randomForStars() * (VIEWBOX_HEIGHT + SKY_EXTRA_HEIGHT)),
  radius: roundToTenth(0.8 + randomForStars() * 1.8),
  delaySeconds: roundToTenth(randomForStars() * 3),
  twinkles: starIndex % 3 === 0,
}));

const randomForBubbles = createSeededRandom(7);
const RISING_BUBBLES = Array.from({ length: 20 }, (_, bubbleIndex) => ({
  id: bubbleIndex,
  x: roundToTenth(randomForBubbles() * VIEWBOX_WIDTH),
  y: roundToTenth(620 + randomForBubbles() * (VIEWBOX_HEIGHT + SKY_EXTRA_HEIGHT - 700)),
  radius: roundToTenth(3 + randomForBubbles() * 6),
  delaySeconds: roundToTenth(randomForBubbles() * 7),
}));

// Sem isto, a rotação e a escala das animações usariam o canto da ilustração como eixo.
const TRANSFORM_FROM_OWN_CENTER: CSSProperties = {
  transformBox: "fill-box",
  transformOrigin: "center",
};

interface FlavorGradientsProps {
  idPrefix: string;
  flavor: SodaFlavor;
}

function FlavorGradients({ idPrefix, flavor }: FlavorGradientsProps) {
  const colors = FLAVOR_COLORS[flavor];
  return (
    <>
      <linearGradient id={`${idPrefix}-can-body-${flavor}`} gradientUnits="userSpaceOnUse" x1={-35} y1={0} x2={35} y2={0}>
        <stop offset="0" style={{ stopColor: colors.bodyShadow }} />
        <stop offset="0.4" style={{ stopColor: colors.bodyLight }} />
        <stop offset="0.65" style={{ stopColor: colors.bodyLight }} />
        <stop offset="1" style={{ stopColor: colors.bodyShadow }} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-soda-${flavor}`} gradientUnits="userSpaceOnUse" x1={0} y1={-64} x2={0} y2={-300}>
        <stop offset="0" style={{ stopColor: colors.soda, stopOpacity: 1 }} />
        <stop offset="0.6" style={{ stopColor: colors.soda, stopOpacity: 0.75 }} />
        <stop offset="1" style={{ stopColor: colors.soda, stopOpacity: 0.15 }} />
      </linearGradient>
    </>
  );
}

interface FlyingCanProps extends FlyingCanConfig {
  idPrefix: string;
}

function FlyingCan({ idPrefix, flavor, x, y, angle, scale, animationDelaySeconds, isTumbling = false }: FlyingCanProps) {
  const colors = FLAVOR_COLORS[flavor];

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      {/* A animação fica num grupo interno: o transform do CSS substituiria
          o atributo transform de posição se estivessem no mesmo elemento. */}
      <g
        className={isTumbling ? "motion-safe:animate-can-tumble" : "motion-safe:animate-can-bob"}
        style={{ ...TRANSFORM_FROM_OWN_CENTER, animationDelay: `${animationDelaySeconds}s` }}
      >
        {/* Jato de refrigerante: corpo líquido, reflexo, gás, gotas e linhas de velocidade */}
        <path d={SODA_STREAM_PATH} fill={`url(#${idPrefix}-soda-${flavor})`} />
        <path d={SODA_HIGHLIGHT_PATH} className="fill-title" opacity={0.3} />
        {FIZZ_BUBBLES.map((bubble) => (
          <circle
            key={`fizz-${bubble.x}-${bubble.y}`}
            cx={bubble.x}
            cy={bubble.y}
            r={bubble.radius}
            className="fill-none stroke-title"
            strokeWidth={2}
            opacity={0.75}
          />
        ))}
        {STREAM_END_DROPS.map((drop) => (
          <circle key={`drop-${drop.x}-${drop.y}`} cx={drop.x} cy={drop.y} r={drop.radius} className={colors.sodaFillClass} opacity={0.6} />
        ))}
        <path d="M -30 -96 L -52 -236" className="stroke-title" strokeWidth={3} strokeLinecap="round" opacity={0.25} />
        <path d="M 40 -104 L 60 -220" className="stroke-title" strokeWidth={3} strokeLinecap="round" opacity={0.25} />
        {SPRAY_DROPLETS.map((droplet) => (
          <circle
            key={`spray-${droplet.delaySeconds}`}
            cx={droplet.startX}
            cy={-80}
            r={droplet.radius}
            className={`${colors.sodaFillClass} motion-safe:animate-soda-spray`}
            style={
              {
                ...TRANSFORM_FROM_OWN_CENTER,
                "--spray-x": `${droplet.travelX}px`,
                "--spray-y": `${droplet.travelY}px`,
                animationDelay: `${animationDelaySeconds + droplet.delaySeconds}s`,
              } as CSSProperties
            }
          />
        ))}

        {/* Corpo da lata: fundo, cilindro com rótulo e brilho, tampa e anel aberto */}
        <ellipse cx={0} cy={60} rx={35} ry={9} className="fill-disabled" />
        <g clipPath={`url(#${idPrefix}-can-shape)`}>
          <rect x={-35} y={-60} width={70} height={120} fill={`url(#${idPrefix}-can-body-${flavor})`} />
          <path d={LABEL_WAVE_PATH} className="fill-title" opacity={0.92} />
          <circle cx={0} cy={6} r={11} className={`fill-none ${colors.emblemStrokeClass}`} strokeWidth={3.5} />
          <path
            d="M 4.5 1.5 A 6 6 0 1 0 4.5 10.5"
            className={`fill-none ${colors.emblemStrokeClass}`}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <rect x={-25} y={-56} width={7} height={112} rx={3.5} className="fill-title" opacity={0.25} />
        </g>
        <ellipse cx={0} cy={-60} rx={35} ry={9} className="fill-placeholder" />
        <ellipse cx={0} cy={-60} rx={28} ry={6} className="fill-disabled" />
        <ellipse cx={9} cy={-61} rx={9} ry={3.5} className="fill-background-base" />
        <rect x={-18} y={-67} width={20} height={7} rx={3.5} className="fill-title" opacity={0.9} transform="rotate(-18 -8 -63)" />

        {/* A espuma vem por último para ficar por cima da tampa, saindo da lata */}
        {FOAM_BURST.map((foam) => (
          <circle key={`foam-${foam.x}-${foam.y}`} cx={foam.x} cy={foam.y} r={foam.radius} className="fill-title" opacity={0.92} />
        ))}
      </g>
    </g>
  );
}

interface SodaRocketArtProps {
  /** Prefixo dos ids internos, para duas cópias da arte não se confundirem na mesma página. */
  idPrefix: string;
  /**
   * cover: preenche a área cortando as bordas (faixa do celular).
   * contain: mostra o desenho inteiro no topo e estende o céu pelo resto (coluna do desktop).
   */
  fit: "cover" | "contain";
  className?: string;
}

export function SodaRocketArt({ idPrefix, fit, className = "" }: SodaRocketArtProps) {
  const preserveAspectRatio = fit === "cover" ? "xMidYMin slice" : "xMidYMin meet";

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
      className={`absolute inset-0 size-full ${className}`}
    >
      <defs>
        {/* Coordenadas absolutas: abaixo do desenho, o céu continua na cor da base. */}
        <linearGradient id={`${idPrefix}-sky`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={VIEWBOX_HEIGHT}>
          <stop offset="0" style={{ stopColor: "var(--color-primary-hover)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--color-panel)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-background-base)" }} />
        </linearGradient>
        <radialGradient id={`${idPrefix}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" style={{ stopColor: "var(--color-tag)", stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: "var(--color-tag)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${idPrefix}-planet`} cx="0.7" cy="0.7" r="0.75">
          <stop offset="0" style={{ stopColor: "var(--color-tag)" }} />
          <stop offset="0.65" style={{ stopColor: "var(--color-primary-hover)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-background-base)" }} />
        </radialGradient>
        <radialGradient id={`${idPrefix}-giant-bubble`} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" style={{ stopColor: "var(--color-primary-focus)", stopOpacity: 0.45 }} />
          <stop offset="1" style={{ stopColor: "var(--color-primary-focus)", stopOpacity: 0.05 }} />
        </radialGradient>
        <linearGradient id={`${idPrefix}-shooting-star`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-title)", stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: "var(--color-title)", stopOpacity: 0 }} />
        </linearGradient>
        <clipPath id={`${idPrefix}-can-shape`}>
          <rect x={-35} y={-60} width={70} height={120} />
        </clipPath>
        <FlavorGradients idPrefix={idPrefix} flavor="grape" />
        <FlavorGradients idPrefix={idPrefix} flavor="blueberry" />
        <FlavorGradients idPrefix={idPrefix} flavor="lime" />
      </defs>

      {/* Céu (maior que o desenho), brilho e estrelas */}
      <rect
        x={-SKY_EXTRA_WIDTH}
        y={-SKY_EXTRA_HEIGHT}
        width={VIEWBOX_WIDTH + SKY_EXTRA_WIDTH * 2}
        height={VIEWBOX_HEIGHT + SKY_EXTRA_HEIGHT * 2}
        fill={`url(#${idPrefix}-sky)`}
      />
      <circle cx={380} cy={320} r={320} fill={`url(#${idPrefix}-glow)`} />
      {STARS.map((star) => (
        <circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.radius}
          className={`fill-title ${star.twinkles ? "motion-safe:animate-twinkle" : ""}`}
          opacity={star.twinkles ? 1 : 0.6}
          style={star.twinkles ? { animationDelay: `${star.delaySeconds}s` } : undefined}
        />
      ))}
      <line x1={455} y1={135} x2={575} y2={40} stroke={`url(#${idPrefix}-shooting-star)`} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={40} y1={430} x2={120} y2={368} stroke={`url(#${idPrefix}-shooting-star)`} strokeWidth={2} strokeLinecap="round" />

      {/* Planeta com anel no canto, como na referência, e uma bolha gigante de refrigerante */}
      <circle cx={40} cy={60} r={150} fill={`url(#${idPrefix}-planet)`} />
      <ellipse
        cx={40}
        cy={60}
        rx={250}
        ry={46}
        transform="rotate(-18 40 60)"
        className="fill-none stroke-primary-focus"
        strokeWidth={3}
        opacity={0.5}
      />
      <circle cx={500} cy={420} r={50} fill={`url(#${idPrefix}-giant-bubble)`} className="stroke-title" strokeWidth={2} strokeOpacity={0.35} />
      <ellipse cx={482} cy={398} rx={13} ry={7} transform="rotate(-30 482 398)" className="fill-title" opacity={0.5} />

      {FLYING_CANS.map((flyingCan) => (
        <FlyingCan key={flyingCan.id} idPrefix={idPrefix} {...flyingCan} />
      ))}

      {/* Bolhas subindo do fundo */}
      {RISING_BUBBLES.map((bubble) => (
        <circle
          key={bubble.id}
          cx={bubble.x}
          cy={bubble.y}
          r={bubble.radius}
          className="fill-none stroke-title motion-safe:animate-bubble-rise"
          strokeWidth={1.5}
          opacity={0.6}
          style={{ ...TRANSFORM_FROM_OWN_CENTER, animationDelay: `${bubble.delaySeconds}s` }}
        />
      ))}
    </svg>
  );
}
