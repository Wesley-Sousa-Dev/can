"use client";

import { Menu, X } from "lucide-react";
import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { AccountLink } from "@/components/layout/AccountLink";
import { PrimaryNavigation } from "@/components/layout/PrimaryNavigation";

const MENU_PANEL_ID = "mobile-menu";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function toggleMenu() {
    setIsOpen((wasOpen) => !wasOpen);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  // Esc fecha o menu e devolve o foco ao botão, para o teclado não se perder.
  function handleEscapeKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || !isOpen) {
      return;
    }
    closeMenu();
    menuButtonRef.current?.focus();
  }

  // O painel cobre o conteúdo da página. Se o foco sair do menu, ele fecha,
  // para não esconder o elemento focado embaixo dele (WCAG 2.4.11).
  function handleFocusLeavingMenu(event: FocusEvent<HTMLDivElement>) {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement && event.currentTarget.contains(nextFocusedElement)) {
      return;
    }
    closeMenu();
  }

  return (
    <div className="md:hidden" onKeyDown={handleEscapeKey} onBlur={handleFocusLeavingMenu}>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls={MENU_PANEL_ID}
        aria-label="Menu"
        className="grid size-11 place-items-center rounded-md text-title transition-colors hover:bg-card"
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-6" />
        ) : (
          <Menu aria-hidden="true" className="size-6" />
        )}
      </button>

      <div
        id={MENU_PANEL_ID}
        hidden={!isOpen}
        className="absolute inset-x-0 top-full z-40 border-b border-border bg-panel px-4 pb-4 pt-2 shadow-strong"
      >
        <PrimaryNavigation layout="vertical" onNavigate={closeMenu} />
        <AccountLink onNavigate={closeMenu} className="mt-3 flex" />
      </div>
    </div>
  );
}
