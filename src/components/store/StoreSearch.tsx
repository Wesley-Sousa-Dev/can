"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import { isGameReleased } from "@/lib/gameAvailability";
import { MINIMUM_SUGGESTION_LENGTH, suggestGames } from "@/lib/gameCatalog";
import { normalizeForSearch } from "@/lib/text";
import type { GameListing } from "@/types/game";

interface StoreSearchProps {
  games: GameListing[];
}

function buildSearchUrl(searchTerm: string): string {
  const trimmedSearchTerm = searchTerm.trim();
  return trimmedSearchTerm ? `/search?q=${encodeURIComponent(trimmedSearchTerm)}` : "/search";
}

// Busca da loja com sugestões, como a da Steam: os jogos aparecem enquanto a
// pessoa digita, antes de enviar. Segue o padrão "combobox" do W3C (APG):
// o foco fica no campo, e as setas destacam uma sugestão por aria-activedescendant.
export function StoreSearch({ games }: StoreSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const popupHeadingId = useId();

  const suggestions = suggestGames(games, searchTerm);
  const isPopupVisible = isPopupOpen && suggestions.length > 0;
  const hasSearchTermForSuggestions = normalizeForSearch(searchTerm).length >= MINIMUM_SUGGESTION_LENGTH;
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  function closePopup() {
    setIsPopupOpen(false);
    setActiveIndex(-1);
  }

  function handleSearchTermChange(nextSearchTerm: string) {
    setSearchTerm(nextSearchTerm);
    setIsPopupOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestions.length === 0) {
        return;
      }
      event.preventDefault();
      setIsPopupOpen(true);
      const lastIndex = suggestions.length - 1;
      if (event.key === "ArrowDown") {
        setActiveIndex(activeIndex >= lastIndex ? 0 : activeIndex + 1);
      } else {
        setActiveIndex(activeIndex <= 0 ? lastIndex : activeIndex - 1);
      }
      return;
    }

    // Com as sugestões abertas, o Esc só as fecha. Sem elas, o campo de busca
    // nativo usa o Esc para apagar o texto.
    if (event.key === "Escape" && isPopupVisible) {
      event.preventDefault();
      closePopup();
      return;
    }

    if (event.key === "Enter" && isPopupVisible && activeIndex >= 0) {
      event.preventDefault();
      closePopup();
      router.push(`/games/${suggestions[activeIndex].slug}`);
    }
  }

  // Sem sugestão destacada, o Enter faz a busca completa.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    closePopup();
    router.push(buildSearchUrl(searchTerm));
  }

  // Fecha quando o foco sai do campo e das sugestões, para não cobrir o resto da página.
  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    const nextFocusedElement = event.relatedTarget;
    if (!nextFocusedElement || !event.currentTarget.contains(nextFocusedElement)) {
      closePopup();
    }
  }

  function describeSuggestions(): string {
    if (!isPopupOpen || !hasSearchTermForSuggestions) {
      return "";
    }
    if (suggestions.length === 0) {
      return "Nenhum jogo encontrado. Aperte Enter para ver a pesquisa completa.";
    }
    const suggestionCount = suggestions.length === 1 ? "1 sugestão" : `${suggestions.length} sugestões`;
    return `${suggestionCount}. Use as setas para cima e para baixo para escolher.`;
  }

  return (
    // action e name mantêm a busca funcionando mesmo sem JavaScript.
    <form
      role="search"
      action="/search"
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className="relative flex md:w-96"
    >
      <label htmlFor="store-search" className="sr-only">
        Buscar jogos na loja
      </label>
      <input
        id="store-search"
        name="q"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isPopupVisible}
        aria-controls={listboxId}
        aria-activedescendant={isPopupVisible && activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
        value={searchTerm}
        onChange={(event) => handleSearchTermChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar na loja"
        autoComplete="off"
        spellCheck={false}
        className="min-h-11 w-full min-w-0 rounded-l-md border border-border-input bg-background px-3 text-medium text-title placeholder:text-placeholder"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="grid min-h-11 min-w-11 place-items-center rounded-r-md bg-primary text-title transition-colors hover:bg-primary-hover"
      >
        <Search aria-hidden="true" className="size-5" />
      </button>

      {/* Quantas sugestões apareceram, para quem usa leitor de tela. */}
      <p role="status" className="sr-only">
        {describeSuggestions()}
      </p>

      <div
        hidden={!isPopupVisible}
        className="absolute top-full right-0 z-40 mt-2 w-full rounded-lg bg-panel p-3 shadow-strong md:w-md"
      >
        <p id={popupHeadingId} className="mb-2 text-small font-medium text-subtitle">
          Resultados da pesquisa
        </p>
        <ul id={listboxId} role="listbox" aria-labelledby={popupHeadingId} className="flex flex-col gap-1">
          {suggestions.map((game, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={game.id} role="presentation">
                {/* Link com papel de opção: o clique abre a página do jogo, e o teclado
                    chega aqui pelas setas, sem passar cada sugestão no Tab. */}
                <Link
                  id={getOptionId(index)}
                  href={`/games/${game.slug}`}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  onClick={closePopup}
                  onPointerMove={() => setActiveIndex(index)}
                  className="group flex items-center gap-3 rounded-md bg-card p-2 outline-offset-0 aria-selected:bg-primary-hover aria-selected:outline-2 aria-selected:outline-primary-focus"
                >
                  <div className="w-24 shrink-0 overflow-hidden rounded-sm">
                    <GameCover imageUrl={game.coverImageUrl} sizes="96px" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-medium font-medium text-title">{game.title}</span>
                    {isGameReleased(game) ? (
                      <PriceTag priceInCents={game.priceInCents} discountPercent={game.discountPercent} />
                    ) : (
                      <span className="text-small text-subtitle">Em breve</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href={buildSearchUrl(searchTerm)}
          onClick={closePopup}
          className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-card text-medium text-title transition-colors hover:bg-primary-hover"
        >
          Ver todos os resultados
        </Link>
      </div>
    </form>
  );
}
