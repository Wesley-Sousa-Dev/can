import type {
  Game,
  GameDetails,
  LanguageSupport,
  SystemRequirements,
} from "@/types/game";

// Dados fictícios da página de cada jogo, enquanto a API não fica pronta.
// Ficam separados de games.ts porque só a página individual precisa deles.
export type GameDetailsExtra = Omit<GameDetails, keyof Game>;

const SCREENSHOTS_PER_GAME = 4;

function buildScreenshotUrls(slug: string): string[] {
  return Array.from(
    { length: SCREENSHOTS_PER_GAME },
    (_, index) => `/games/screenshots/${slug}-${index + 1}.svg`,
  );
}

function language(
  name: string,
  support: { audio: boolean; subtitles: boolean },
): LanguageSupport {
  return {
    language: name,
    hasInterface: true,
    hasAudio: support.audio,
    hasSubtitles: support.subtitles,
  };
}

// Conjuntos de idiomas reaproveitados entre os jogos.
const DUBBED_LANGUAGES: LanguageSupport[] = [
  language("Português (Brasil)", { audio: true, subtitles: true }),
  language("Inglês", { audio: true, subtitles: true }),
  language("Espanhol (América Latina)", { audio: false, subtitles: true }),
  language("Francês", { audio: false, subtitles: true }),
  language("Japonês", { audio: true, subtitles: true }),
];

const SUBTITLED_LANGUAGES: LanguageSupport[] = [
  language("Português (Brasil)", { audio: false, subtitles: true }),
  language("Inglês", { audio: true, subtitles: true }),
  language("Espanhol (América Latina)", { audio: false, subtitles: true }),
];

const TEXT_ONLY_LANGUAGES: LanguageSupport[] = [
  language("Português (Brasil)", { audio: false, subtitles: false }),
  language("Inglês", { audio: false, subtitles: false }),
  language("Espanhol (América Latina)", { audio: false, subtitles: false }),
  language("Alemão", { audio: false, subtitles: false }),
];

// Requisitos genéricos por porte do jogo.
interface RequirementsPreset {
  minimum: SystemRequirements;
  recommended: SystemRequirements;
}

const LIGHT_REQUIREMENTS: RequirementsPreset = {
  minimum: {
    operatingSystem: "Windows 10 de 64 bits",
    processor: "Processador de 2 núcleos, 2,0 GHz",
    memory: "4 GB de RAM",
    graphics: "Vídeo integrado com suporte a DirectX 11",
    storage: "2 GB disponíveis",
  },
  recommended: {
    operatingSystem: "Windows 11 de 64 bits",
    processor: "Processador de 4 núcleos, 2,5 GHz",
    memory: "8 GB de RAM",
    graphics: "Placa de vídeo com 2 GB de memória",
    storage: "2 GB disponíveis em SSD",
  },
};

const MEDIUM_REQUIREMENTS: RequirementsPreset = {
  minimum: {
    operatingSystem: "Windows 10 de 64 bits",
    processor: "Processador de 4 núcleos, 2,8 GHz",
    memory: "8 GB de RAM",
    graphics: "Placa de vídeo com 3 GB de memória",
    storage: "25 GB disponíveis",
  },
  recommended: {
    operatingSystem: "Windows 11 de 64 bits",
    processor: "Processador de 6 núcleos, 3,2 GHz",
    memory: "16 GB de RAM",
    graphics: "Placa de vídeo com 6 GB de memória",
    storage: "25 GB disponíveis em SSD",
  },
};

const HEAVY_REQUIREMENTS: RequirementsPreset = {
  minimum: {
    operatingSystem: "Windows 10 de 64 bits",
    processor: "Processador de 6 núcleos, 3,0 GHz",
    memory: "12 GB de RAM",
    graphics: "Placa de vídeo com 6 GB de memória",
    storage: "80 GB disponíveis em SSD",
  },
  recommended: {
    operatingSystem: "Windows 11 de 64 bits",
    processor: "Processador de 8 núcleos, 3,6 GHz",
    memory: "16 GB de RAM",
    graphics: "Placa de vídeo com 10 GB de memória",
    storage: "80 GB disponíveis em SSD NVMe",
  },
};

function withRequirements(preset: RequirementsPreset) {
  return {
    minimumRequirements: preset.minimum,
    recommendedRequirements: preset.recommended,
  };
}

export const MOCK_GAME_DETAILS: Record<string, GameDetailsExtra> = {
  "neon-drift": {
    publisher: "Selo Trovão",
    screenshotUrls: buildScreenshotUrls("neon-drift"),
    aboutSections: [
      {
        title: "Velocidade com trilha própria",
        text: "Cada pista tem uma trilha synthwave que acelera junto com você. Quanto mais perto do limite, mais intensa fica a música.",
      },
      {
        title: "Ranking toda semana",
        text: "Desafios semanais colocam o seu melhor tempo contra jogadores do mundo inteiro, com recompensas visuais para os primeiros colocados.",
      },
    ],
    tags: ["Corrida", "Arcade", "Synthwave", "Multijogador", "Competitivo"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "online-multiplayer", "achievements", "controller-support", "cloud-saves"],
    accessibilityFeatures: ["Legendas", "Modo para daltonismo", "Controles remapeáveis", "Redução de efeitos de flash"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 91, totalReviews: 18_430 },
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "ecos-de-valdoria": {
    publisher: "Forja Lunar",
    screenshotUrls: buildScreenshotUrls("ecos-de-valdoria"),
    aboutSections: [
      {
        title: "Sete reinos, uma guerra",
        text: "Alie-se a um dos sete reinos de Valdoria ou tente unir todos eles. Cada decisão altera alianças, rotas comerciais e o final da sua história.",
      },
      {
        title: "Um mundo que lembra",
        text: "Os personagens reagem ao que você fez horas antes. Ajudar uma vila hoje pode abrir ou fechar portas em outra região.",
      },
    ],
    tags: ["RPG", "Mundo aberto", "Fantasia", "Escolhas importam", "Um jogador"],
    platforms: ["windows"],
    features: ["single-player", "achievements", "controller-support", "cloud-saves"],
    accessibilityFeatures: ["Legendas personalizáveis", "Ajuste do tamanho do texto", "Modo para daltonismo", "Narração dos menus"],
    languages: DUBBED_LANGUAGES,
    ageRating: "16",
    ageRatingDescriptors: ["Violência", "Linguagem imprópria"],
    reviewSummary: { positivePercent: 96, totalReviews: 42_870 },
    ...withRequirements(HEAVY_REQUIREMENTS),
  },
  "orbita-zero": {
    publisher: "Constelação Games",
    screenshotUrls: buildScreenshotUrls("orbita-zero"),
    aboutSections: [
      {
        title: "Cada recurso conta",
        text: "Oxigênio, energia e comida precisam estar em equilíbrio. Um erro de cálculo pode deixar metade da estação no escuro.",
      },
      {
        title: "No seu ritmo",
        text: "Pause o tempo a qualquer momento para planejar. A estação só avança quando você decide.",
      },
    ],
    tags: ["Estratégia", "Simulação", "Construção", "Espaço", "Gerenciamento"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "achievements", "cloud-saves"],
    accessibilityFeatures: ["Pausa a qualquer momento", "Ajuste do tamanho do texto", "Modo para daltonismo", "Controles remapeáveis"],
    languages: TEXT_ONLY_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 88, totalReviews: 9_204 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
  "cripta-silenciosa": {
    publisher: "Nevoeiro Studio",
    screenshotUrls: buildScreenshotUrls("cripta-silenciosa"),
    aboutSections: [
      {
        title: "O silêncio é o aviso",
        text: "Na cripta, os sons importam mais do que a luz. Aprenda a ouvir passos, respirações e portas antes que seja tarde.",
      },
      {
        title: "Jogável sem áudio",
        text: "Indicadores visuais mostram de onde vem cada som, para que o jogo funcione também para quem não ouve.",
      },
    ],
    tags: ["Terror", "Psicológico", "Primeira pessoa", "Atmosférico", "Um jogador"],
    platforms: ["windows"],
    features: ["single-player", "achievements", "controller-support"],
    accessibilityFeatures: ["Legendas com descrição de sons", "Indicadores visuais de som", "Ajuste de brilho", "Controles remapeáveis"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "16",
    ageRatingDescriptors: ["Violência", "Medo"],
    reviewSummary: { positivePercent: 82, totalReviews: 6_311 },
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "pixel-pioneers": {
    publisher: "Bit a Bit",
    screenshotUrls: buildScreenshotUrls("pixel-pioneers"),
    aboutSections: [
      {
        title: "Até quatro pioneiros",
        text: "Jogue sozinho ou com até três amigos no mesmo sofá. As fases mudam de forma conforme o número de jogadores.",
      },
      {
        title: "Nunca a mesma fase",
        text: "Os blocos se montam de um jeito diferente a cada partida, então sempre existe um caminho novo para descobrir.",
      },
    ],
    tags: ["Plataforma", "Pixel art", "Cooperativo", "Quebra-cabeça", "Multijogador local"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "co-op", "controller-support", "achievements"],
    accessibilityFeatures: ["Modo assistido", "Controles remapeáveis", "Modo para daltonismo"],
    languages: TEXT_ONLY_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 94, totalReviews: 12_980 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
  "reino-de-cartas": {
    publisher: "Baralho Alto",
    screenshotUrls: buildScreenshotUrls("reino-de-cartas"),
    aboutSections: [
      {
        title: "Mais de 400 cartas",
        text: "Monte baralhos com cartas de cinco reinos e descubra combinações que ninguém testou ainda.",
      },
      {
        title: "Gratuito de verdade",
        text: "Todas as cartas podem ser conquistadas jogando. As compras dentro do jogo trazem apenas itens visuais.",
      },
    ],
    tags: ["Cartas", "Estratégia", "Gratuito para jogar", "Por turnos", "Competitivo"],
    platforms: ["windows", "macos"],
    features: ["single-player", "online-multiplayer", "achievements"],
    accessibilityFeatures: ["Turnos sem limite de tempo no modo casual", "Ajuste do tamanho do texto", "Narração das cartas"],
    languages: TEXT_ONLY_LANGUAGES,
    ageRating: "10",
    ageRatingDescriptors: ["Violência"],
    reviewSummary: { positivePercent: 79, totalReviews: 65_402 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
  "mare-alta": {
    publisher: "Ventania Interativa",
    screenshotUrls: buildScreenshotUrls("mare-alta"),
    aboutSections: [
      {
        title: "Vento e corrente de verdade",
        text: "O barco responde ao vento, às ondas e às correntes, simulados a partir de dados reais do Atlântico.",
      },
      {
        title: "Viagem sem pressa",
        text: "Navegue em tempo real ou acelere a viagem. A travessia completa pode levar de algumas horas a vários dias.",
      },
    ],
    tags: ["Simulação", "Navegação", "Relaxante", "Mundo aberto", "Realista"],
    platforms: ["windows", "macos"],
    features: ["single-player", "controller-support", "cloud-saves"],
    accessibilityFeatures: ["Modo contra enjoo de movimento", "Legendas", "Ajuste do tamanho do texto"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 86, totalReviews: 3_870 },
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "fronteira-carmesim": {
    publisher: "Selo Trovão",
    screenshotUrls: buildScreenshotUrls("fronteira-carmesim"),
    aboutSections: [
      {
        title: "Cinco contra cinco",
        text: "Coordene ataques e defesas com a sua equipe. Cada rodada exige plano, comunicação e um pouco de improviso.",
      },
      {
        title: "Mapas que mudam",
        text: "Paredes, pisos e coberturas podem ser destruídos, abrindo novas rotas no meio da partida.",
      },
    ],
    tags: ["Tiro tático", "Multijogador", "Competitivo", "Em equipe", "Destruição"],
    platforms: ["windows"],
    features: ["online-multiplayer", "achievements", "controller-support"],
    accessibilityFeatures: ["Modo para daltonismo", "Transcrição do chat de voz", "Controles remapeáveis", "Mira assistida no modo casual"],
    languages: DUBBED_LANGUAGES,
    ageRating: "16",
    ageRatingDescriptors: ["Violência"],
    reviewSummary: { positivePercent: 74, totalReviews: 28_119 },
    ...withRequirements(HEAVY_REQUIREMENTS),
  },
  "jardim-mecanico": {
    publisher: "Pêndulo",
    screenshotUrls: buildScreenshotUrls("jardim-mecanico"),
    aboutSections: [
      {
        title: "Engrenagens que florescem",
        text: "Encaixe engrenagens, molas e pêndulos para devolver o movimento a um jardim de relojoaria abandonado.",
      },
      {
        title: "Sem pressa e sem relógio",
        text: "Nenhum quebra-cabeça tem tempo limite. Se travar, dicas opcionais mostram o próximo passo sem entregar a solução.",
      },
    ],
    tags: ["Quebra-cabeça", "Relaxante", "Steampunk", "Um jogador"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "achievements", "cloud-saves"],
    accessibilityFeatures: ["Dicas opcionais", "Sem limite de tempo", "Modo para daltonismo"],
    languages: TEXT_ONLY_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 97, totalReviews: 2_450 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
  "lamina-do-crepusculo": {
    publisher: "Forja Lunar",
    screenshotUrls: buildScreenshotUrls("lamina-do-crepusculo"),
    aboutSections: [
      {
        title: "Entre o dia e a noite",
        text: "O reino muda conforme a hora: inimigos, caminhos e até os chefes se transformam quando o sol se põe.",
      },
      {
        title: "Difícil, mas justo",
        text: "Cada derrota ensina algo. Para quem prefere outra experiência, a dificuldade pode ser ajustada a qualquer momento.",
      },
    ],
    tags: ["Ação", "RPG", "Difícil", "Fantasia sombria", "Chefes"],
    platforms: ["windows"],
    features: ["single-player", "achievements", "controller-support", "cloud-saves"],
    accessibilityFeatures: ["Dificuldade ajustável", "Controles remapeáveis", "Legendas", "Redução de tremor da câmera"],
    languages: DUBBED_LANGUAGES,
    ageRating: "16",
    ageRatingDescriptors: ["Violência"],
    reviewSummary: { positivePercent: 89, totalReviews: 21_765 },
    ...withRequirements(HEAVY_REQUIREMENTS),
  },
  "arena-astral": {
    publisher: "Constelação Games",
    screenshotUrls: buildScreenshotUrls("arena-astral"),
    aboutSections: [
      {
        title: "Heróis cósmicos",
        text: "Escolha entre mais de 60 heróis, cada um com habilidades que se combinam de formas diferentes com a equipe.",
      },
      {
        title: "Todos os heróis liberados",
        text: "Nenhum herói precisa ser comprado. A loja do jogo vende apenas itens visuais.",
      },
    ],
    tags: ["Gratuito para jogar", "Arena", "Multijogador", "Heróis", "Competitivo"],
    platforms: ["windows", "macos"],
    features: ["online-multiplayer", "achievements", "controller-support"],
    accessibilityFeatures: ["Modo para daltonismo", "Alertas com som e indicação visual", "Ajuste do tamanho da interface"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "12",
    ageRatingDescriptors: ["Violência"],
    reviewSummary: { positivePercent: 68, totalReviews: 120_450 },
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "colonia-artica": {
    publisher: "Ventania Interativa",
    screenshotUrls: buildScreenshotUrls("colonia-artica"),
    aboutSections: [
      {
        title: "Sobreviver ao inverno",
        text: "Construa abrigos, organize turnos de trabalho e mantenha os aquecedores ligados enquanto a temperatura despenca.",
      },
      {
        title: "Cada colono importa",
        text: "Os moradores têm nomes, histórias e opiniões. Decisões duras afetam a esperança de toda a colônia.",
      },
    ],
    tags: ["Sobrevivência", "Construção", "Estratégia", "Inverno"],
    platforms: ["windows", "linux"],
    features: ["single-player", "achievements", "cloud-saves"],
    accessibilityFeatures: ["Pausa a qualquer momento", "Ajuste do tamanho do texto", "Modo para daltonismo"],
    languages: TEXT_ONLY_LANGUAGES,
    ageRating: "12",
    ageRatingDescriptors: ["Medo"],
    reviewSummary: null,
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "protocolo-omega": {
    publisher: "Selo Trovão",
    screenshotUrls: buildScreenshotUrls("protocolo-omega"),
    aboutSections: [
      {
        title: "Uma cidade que vigia",
        text: "A inteligência artificial que governa a megacidade aprende com os seus movimentos. O mesmo truque raramente funciona duas vezes.",
      },
      {
        title: "Ação ou silêncio",
        text: "Cada missão pode ser cumprida sem ser visto ou no confronto direto, e o caminho escolhido muda as missões seguintes.",
      },
    ],
    tags: ["Ação", "Furtividade", "Ficção científica", "Um jogador"],
    platforms: ["windows"],
    features: ["single-player", "achievements", "controller-support"],
    accessibilityFeatures: ["Legendas", "Modo para daltonismo", "Controles remapeáveis"],
    languages: DUBBED_LANGUAGES,
    ageRating: "16",
    ageRatingDescriptors: ["Violência", "Linguagem imprópria"],
    reviewSummary: null,
    ...withRequirements(HEAVY_REQUIREMENTS),
  },
  "sombras-de-aurora": {
    publisher: "Nevoeiro Studio",
    screenshotUrls: buildScreenshotUrls("sombras-de-aurora"),
    aboutSections: [
      {
        title: "Florestas sob a aurora",
        text: "A luz da aurora boreal guia o caminho, mas também revela criaturas que preferiam continuar escondidas.",
      },
      {
        title: "Explorar sem combate",
        text: "Não há armas: sobreviver depende de observar, se esconder e entender o comportamento de cada criatura.",
      },
    ],
    tags: ["Aventura", "Terror", "Exploração", "Atmosférico"],
    platforms: ["windows", "macos"],
    features: ["single-player", "achievements", "controller-support"],
    accessibilityFeatures: ["Legendas com descrição de sons", "Ajuste de brilho", "Controles remapeáveis"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "14",
    ageRatingDescriptors: ["Medo"],
    reviewSummary: null,
    ...withRequirements(MEDIUM_REQUIREMENTS),
  },
  "contos-do-farol": {
    publisher: "Bit a Bit",
    screenshotUrls: buildScreenshotUrls("contos-do-farol"),
    aboutSections: [
      {
        title: "Histórias do mar",
        text: "Cada visitante do farol traz uma história. Ouça, investigue e descubra como todas elas se cruzam.",
      },
      {
        title: "Feito para ler no seu tempo",
        text: "Todos os textos têm narração e podem ser ampliados, e nenhum quebra-cabeça tem tempo limite.",
      },
    ],
    tags: ["Aventura", "Narrativo", "Quebra-cabeça", "Relaxante"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "achievements", "controller-support", "cloud-saves"],
    accessibilityFeatures: ["Narração de todos os textos", "Legendas", "Ajuste do tamanho do texto", "Sem limite de tempo"],
    languages: DUBBED_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 98, totalReviews: 1_980 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
  "liga-turbo": {
    publisher: "Estúdio Vetor",
    screenshotUrls: buildScreenshotUrls("liga-turbo"),
    aboutSections: [
      {
        title: "Pistas da comunidade",
        text: "Crie pistas no editor e compartilhe com todo mundo. As mais votadas entram na rotação oficial toda semana.",
      },
      {
        title: "Corrida para todo mundo",
        text: "A direção assistida ajuda quem está começando a completar as voltas, sem tirar a emoção das ultrapassagens.",
      },
    ],
    tags: ["Corrida", "Kart", "Gratuito para jogar", "Multijogador", "Criação de pistas"],
    platforms: ["windows", "macos", "linux"],
    features: ["single-player", "online-multiplayer", "controller-support", "achievements"],
    accessibilityFeatures: ["Direção assistida", "Modo para daltonismo", "Controles remapeáveis"],
    languages: SUBTITLED_LANGUAGES,
    ageRating: "L",
    ageRatingDescriptors: [],
    reviewSummary: { positivePercent: 84, totalReviews: 54_330 },
    ...withRequirements(LIGHT_REQUIREMENTS),
  },
};
