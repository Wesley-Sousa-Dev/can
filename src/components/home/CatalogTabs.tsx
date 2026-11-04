"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { GameListItem } from "@/components/game/GameListItem";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Game } from "@/types/game";

export interface CatalogTab {
  id: string;
  label: string;
  games: Game[];
  emptyMessage: string;
  showReleaseDate?: boolean;
}

interface CatalogTabsProps {
  tabs: CatalogTab[];
}

const HEADING_ID = "catalog-heading";

function getTabElementId(tabId: string): string {
  return `catalog-tab-${tabId}`;
}

function getPanelElementId(tabId: string): string {
  return `catalog-panel-${tabId}`;
}

// Abas no padrão do W3C (APG): só a aba ativa entra na ordem do Tab,
// e as setas, Home e End movem entre as abas.
export function CatalogTabs({ tabs }: CatalogTabsProps) {
  const [selectedTabId, setSelectedTabId] = useState(tabs[0]?.id);
  const tabButtonsById = useRef(new Map<string, HTMLButtonElement>());

  function selectAndFocusTab(tabId: string) {
    setSelectedTabId(tabId);
    tabButtonsById.current.get(tabId)?.focus();
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.id === selectedTabId);
    const lastIndex = tabs.length - 1;
    const targetIndexByKey: Record<string, number> = {
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      Home: 0,
      End: lastIndex,
    };

    const targetIndex = targetIndexByKey[event.key];
    if (targetIndex === undefined) {
      return;
    }

    event.preventDefault();
    selectAndFocusTab(tabs[targetIndex].id);
  }

  return (
    <section id="catalog" aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Explore o catálogo" />

      <div
        role="tablist"
        aria-labelledby={HEADING_ID}
        onKeyDown={handleTabListKeyDown}
        className="mb-4 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedTabId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                if (element) {
                  tabButtonsById.current.set(tab.id, element);
                } else {
                  tabButtonsById.current.delete(tab.id);
                }
              }}
              type="button"
              role="tab"
              id={getTabElementId(tab.id)}
              aria-selected={isSelected}
              aria-controls={getPanelElementId(tab.id)}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedTabId(tab.id)}
              className={`min-h-11 rounded-full border px-4 text-medium font-medium transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-title"
                  : "border-border-input text-subtitle hover:border-primary-focus hover:text-title"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Todos os painéis ficam no HTML (os inativos com "hidden") para que
          o aria-controls de cada aba sempre aponte para um elemento existente. */}
      {tabs.map((tab) => {
        const hasGames = tab.games.length > 0;
        return (
          <div
            key={tab.id}
            id={getPanelElementId(tab.id)}
            role="tabpanel"
            aria-labelledby={getTabElementId(tab.id)}
            hidden={tab.id !== selectedTabId}
            // Painel sem links precisa receber foco para o conteúdo ser alcançável pelo teclado.
            tabIndex={hasGames ? undefined : 0}
          >
            {hasGames ? (
              <ul className="flex flex-col gap-3">
                {tab.games.map((game) => (
                  <li key={game.id}>
                    <GameListItem game={game} showReleaseDate={tab.showReleaseDate} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-medium text-subtitle">{tab.emptyMessage}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
